import { readFile, readdir } from 'node:fs/promises'
import { resolve, join, extname, relative } from 'node:path'
import { callLLM } from '../../tools/llm.js'
import { logAction } from '../../memory/index.js'
import { makeResult } from '../../types/result.js'

const CODE_EXTS = new Set(['.js', '.ts', '.jsx', '.tsx', '.mjs', '.cjs',
  '.py', '.go', '.rs', '.java', '.json', '.yaml', '.yml', '.md', '.env.example'])
const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', 'build', '.merry', 'coverage'])
const MAX_MATCHES = 50
const MAX_CONTEXT_CHARS = 8_000

export async function execute(task) {
  const { query, source = 'codebase', depth = 1 } = task

  try {
    let output

    if (source === 'file') {
      output = await readAndSummarize(query, depth)
    } else {
      // 'codebase' and 'docs' both search local files; docs filters to .md only
      output = await searchCodebase(query, process.cwd(), source === 'docs', depth)
    }

    logAction('researcher', query, 'ok')
    return makeResult({ success: true, output, agent: 'researcher', action: 'search' })
  } catch (err) {
    logAction('researcher', query, 'error')
    return makeResult({ success: false, output: err.message, agent: 'researcher', action: 'search', error: err.message })
  }
}

async function searchCodebase(query, root, docsOnly, depth) {
  const matches = []
  const regex = new RegExp(query, 'gi')

  async function walk(dir) {
    let entries
    try { entries = await readdir(dir, { withFileTypes: true }) } catch { return }

    for (const entry of entries) {
      const full = join(dir, entry.name)
      if (entry.isDirectory()) {
        if (!SKIP_DIRS.has(entry.name)) await walk(full)
      } else {
        const ext = extname(entry.name)
        if (!CODE_EXTS.has(ext)) continue
        if (docsOnly && ext !== '.md') continue

        try {
          const content = await readFile(full, 'utf-8')
          const lines = content.split('\n')
          for (let i = 0; i < lines.length; i++) {
            regex.lastIndex = 0
            if (regex.test(lines[i])) {
              matches.push(`${relative(root, full)}:${i + 1}  ${lines[i].trim()}`)
              if (matches.length >= MAX_MATCHES) return
            }
          }
        } catch { /* archivo no legible, omitir */ }
      }
    }
  }

  await walk(root)

  if (matches.length === 0) return `Sin resultados para "${query}" en ${docsOnly ? 'docs' : 'codebase'}.`

  const summary = `${matches.length} coincidencia(s) para "${query}":\n\n${matches.join('\n')}`
  return depth >= 2 ? await synthesize(query, summary) : summary
}

async function readAndSummarize(filePath, depth) {
  const content = await readFile(resolve(filePath), 'utf-8')
  if (depth < 2) return content.slice(0, MAX_CONTEXT_CHARS)
  return synthesize(`Resume el archivo ${filePath}`, content)
}

async function synthesize(query, context) {
  return callLLM({
    prompt: `Analiza el siguiente contenido y responde en español de forma concisa a: "${query}"\n\n${context.slice(0, MAX_CONTEXT_CHARS)}`,
    complexity: 'simple',
    maxTokens: 512,
  })
}

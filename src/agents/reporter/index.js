import { mkdir, writeFile } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { callLLM } from '../../tools/llm.js'
import { logAction } from '../../memory/index.js'
import { makeResult } from '../../types/result.js'

const SYSTEM_MD = `Eres un generador de documentos Markdown profesionales.
Genera documentación estructurada, clara y completa en español.
Incluye: título con #, secciones con ##, tablas si aplica, listas y ejemplos concretos.
Responde SOLO con el contenido Markdown. Sin triple backticks envolventes.`

const SYSTEM_CSV = `Eres un generador de datos CSV estructurados.
Genera un CSV válido con headers descriptivos en la primera fila.
Usa coma como separador. Datos reales y precisos, nunca placeholders.
Responde SOLO con el CSV. Sin explicaciones ni backticks.`

const MERRY_DIR = join(process.cwd(), '.merry', 'reports')

export async function execute(task) {
  const { action = 'report', context, format: explicitFormat, dest } = task
  const input = context ?? action

  const format = explicitFormat ?? detectFormat(input)
  const ext    = format === 'csv' ? 'csv' : 'md'
  const system = format === 'csv' ? SYSTEM_CSV : SYSTEM_MD

  const outDir  = dest ? dirname(dest) : MERRY_DIR
  const outFile = dest ?? join(outDir, `${slug()}.${ext}`)

  try {
    const content = await callLLM({ prompt: input, complexity: 'complex', system, maxTokens: 4096 })

    await mkdir(outDir, { recursive: true })
    await writeFile(outFile, content, 'utf-8')

    logAction('reporter', input, 'ok')
    const preview = content.length > 400 ? content.slice(0, 400) + '\n…' : content
    return makeResult({
      success: true,
      output: `Documento generado: ${outFile}\n\n${preview}`,
      agent: 'reporter',
      action: format,
    })
  } catch (err) {
    logAction('reporter', input, 'error')
    return makeResult({ success: false, output: err.message, agent: 'reporter', action, error: err.message })
  }
}

function detectFormat(text) {
  if (/\bcsv\b/i.test(text)) return 'csv'
  return 'markdown'
}

function slug() {
  return new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
}

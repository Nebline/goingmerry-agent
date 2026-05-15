import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { callLLM } from '../../tools/llm.js'
import { logAction } from '../../memory/index.js'
import { makeResult } from '../../types/result.js'

const SYSTEM = `Eres un diseñador web de producción. Genera HTML5 completo y self-contained.
Reglas obligatorias:
- Un solo archivo .html con CSS inline en <style> y JS en <script>
- Diseño moderno: variables CSS, flexbox/grid, responsive (mobile-first)
- Colores con contraste mínimo 4.5:1. Tipografía legible base 16px
- Sin dependencias externas. Sin frameworks. Vanilla HTML/CSS/JS únicamente
- El resultado debe abrirse directamente en un browser y verse bien
Responde SOLO con el HTML completo. Empieza con <!DOCTYPE html>.`

const OUT_DIR = join(process.cwd(), '.merry', 'output')

export async function execute(task) {
  const { action = 'build', spec, context, dest } = task
  const input = spec ?? context ?? action

  const outFile = dest ?? join(OUT_DIR, `${slug()}.html`)

  try {
    const html = await callLLM({ prompt: input, complexity: 'complex', system: SYSTEM, maxTokens: 8192 })

    const clean = extractHtml(html)

    await mkdir(OUT_DIR, { recursive: true })
    await writeFile(outFile, clean, 'utf-8')

    logAction('web-designer', input, 'ok')
    return makeResult({
      success: true,
      output: `Archivo generado: ${outFile}\nAbre en tu browser para ver el resultado.`,
      agent: 'web-designer',
      action,
    })
  } catch (err) {
    logAction('web-designer', input, 'error')
    return makeResult({ success: false, output: err.message, agent: 'web-designer', action, error: err.message })
  }
}

function extractHtml(raw) {
  // Strip ```html ... ``` wrapper if the LLM added one
  const match = raw.match(/```(?:html)?\n?([\s\S]*?)```/)
  return (match ? match[1] : raw).trim()
}

function slug() {
  return new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
}

import { writeFile } from 'node:fs/promises'
import { callLLM } from '../../tools/llm.js'
import { logAction } from '../../memory/index.js'
import { makeResult } from '../../types/result.js'

const SYSTEM = `Eres un generador de código JavaScript/Node.js de producción.
Responde SOLO con el bloque de código ejecutable entre triple backticks con lenguaje (js o javascript).
Usa ESM (import/export). Sin explicaciones ni texto extra. El código debe funcionar sin modificaciones.`

export async function execute(task) {
  const { action = 'generate', context, file } = task

  try {
    const raw = await callLLM({
      prompt: context,
      complexity: 'complex',
      system: SYSTEM,
      maxTokens: 2048,
    })

    const match = raw.match(/```(?:js|javascript)?\n([\s\S]*?)```/)
    const code = match ? match[1].trim() : raw.trim()

    if (file) {
      await writeFile(file, code, 'utf-8')
    }

    logAction('coder', context, 'ok')
    return makeResult({ success: true, output: code, agent: 'coder', action })
  } catch (err) {
    logAction('coder', context, 'error')
    return makeResult({ success: false, output: err.message, agent: 'coder', action, error: err.message })
  }
}

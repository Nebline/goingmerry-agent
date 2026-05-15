import { callLLM } from '../tools/llm.js'

// Quick heuristic: connectors that suggest a multi-step task
const MULTI_STEP = /\b(y\s+(también|además|luego|después)|después\s+de|primero.{1,40}luego|además\s+de|también\s+crea|también\s+genera|y\s+luego)\b/i

/**
 * Splits a complex multi-step input into independent sub-tasks.
 * Returns null if the input is a single task (no decomposition needed).
 * @param {string} input
 * @returns {Promise<string[]|null>}
 */
export async function decompose(input) {
  if (!MULTI_STEP.test(input)) return null

  const prompt = `Eres un planificador de tareas. Divide la siguiente instrucción en subtareas independientes.
Cada subtarea debe ser autocontenida (no depende del resultado de las otras).
Responde SOLO con JSON válido: {"tasks": ["<subtarea 1>", "<subtarea 2>"]}
Máximo 5 subtareas. Si no hay subtareas claras, responde: {"tasks": []}
Instrucción: "${input}"`

  try {
    const raw  = await callLLM({ prompt, complexity: 'simple', maxTokens: 256 })
    const match = raw.match(/\{[\s\S]*?\}/)
    const { tasks } = JSON.parse(match[0])
    if (!Array.isArray(tasks) || tasks.length < 2) return null
    return tasks
  } catch {
    return null
  }
}

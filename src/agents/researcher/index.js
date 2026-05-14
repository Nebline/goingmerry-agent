// Subagente: researcher — búsqueda, síntesis y validación de información

/**
 * @param {object} task
 * @param {string} task.query   - pregunta o término a investigar
 * @param {string} task.source  - 'web' | 'docs' | 'codebase'
 * @param {number} [task.depth] - nivel de profundidad: 1 (rápido) | 2 | 3 (exhaustivo)
 * @returns {Promise<{summary: string, sources: string[]}>}
 */
export async function execute(task) {
  // TODO: seleccionar fuente según task.source
  // TODO: sintetizar resultados — nunca inventar datos
  // TODO: retornar fuentes verificables junto al resumen
  throw new Error('researcher.execute: no implementado')
}

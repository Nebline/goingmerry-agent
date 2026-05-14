// Subagente: reporter — generación de reportes, informes y documentación estructurada

/**
 * @param {object} task
 * @param {string}   task.format  - 'markdown' | 'pdf' | 'xlsx' | 'docx'
 * @param {string}   task.title   - título del documento
 * @param {object}   task.data    - datos reales a incluir (nunca datos de ejemplo)
 * @param {string}   [task.dest]  - ruta de salida del archivo generado
 * @returns {Promise<{success: boolean, path: string}>}
 */
export async function execute(task) {
  // TODO: validar que task.data contiene datos reales, no placeholders
  // TODO: generar documento en el formato solicitado
  // TODO: retornar ruta del archivo generado como evidencia
  throw new Error('reporter.execute: no implementado')
}

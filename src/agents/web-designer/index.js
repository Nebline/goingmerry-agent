// Subagente: web-designer — interfaces web funcionales (HTML/CSS/JS)

/**
 * @param {object} task
 * @param {string}   task.type     - 'page' | 'component' | 'dashboard' | 'spa'
 * @param {string}   task.spec     - descripción de la interfaz a construir
 * @param {string}   [task.dest]   - directorio de salida
 * @param {string[]} [task.assets] - rutas de assets existentes a incluir
 * @returns {Promise<{success: boolean, files: string[]}>}
 */
export async function execute(task) {
  // TODO: generar HTML/CSS/JS vanilla o con framework ligero según spec
  // TODO: verificar que los archivos generados son funcionales y abribles en browser
  // TODO: retornar lista de archivos generados como evidencia
  throw new Error('web-designer.execute: no implementado')
}

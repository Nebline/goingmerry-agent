// Subagente: coder — generación, refactor y debugging de código

/**
 * @param {object} task
 * @param {string} task.action   - 'generate' | 'refactor' | 'debug'
 * @param {string} task.context  - descripción de la tarea
 * @param {string} [task.file]   - archivo objetivo si aplica
 * @returns {Promise<{success: boolean, output: string}>}
 */
export async function execute(task) {
  // TODO: seleccionar herramienta según escala (Claude Code vs OpenCode GO)
  // TODO: generar o modificar código funcional y ejecutable
  // TODO: verificar que el resultado compila/corre antes de retornar
  throw new Error('coder.execute: no implementado')
}

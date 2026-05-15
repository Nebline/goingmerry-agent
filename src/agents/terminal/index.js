// Subagente: terminal — ejecución de comandos del sistema operativo

import { exec } from 'node:child_process'
import { promisify } from 'node:util'
import { requiresApproval } from '../../tools/approval.js'

const execAsync = promisify(exec)

const DESTRUCTIVE_PATTERNS = [/rm\s+-rf/, /DROP\s+TABLE/i, /TRUNCATE/i, /git\s+push.*main/]

/**
 * @param {object} task
 * @param {string} task.command - comando a ejecutar
 * @param {string} [task.cwd]   - directorio de trabajo
 * @returns {Promise<{stdout: string, stderr: string}>}
 */
export async function execute(task) {
  const isDestructive = DESTRUCTIVE_PATTERNS.some(p => p.test(task.command))

  if (isDestructive && requiresApproval('destructive')) {
    throw new Error(`ApprovalGate: comando destructivo requiere confirmación → ${task.command}`)
  }

  // TODO: registrar en log cada comando ejecutado
  // TODO: implementar timeout configurable por comando
  throw new Error('terminal.execute: no implementado')
}

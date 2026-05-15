// Subagente: file-manager — lectura, escritura y organización de archivos

import { createReadStream, createWriteStream } from 'node:fs'
import { readFile, writeFile, rename, unlink, mkdir } from 'node:fs/promises'
import { requiresApproval } from '../../tools/approval.js'

/**
 * @param {object} task
 * @param {string} task.action  - 'read' | 'write' | 'move' | 'delete' | 'mkdir'
 * @param {string} task.path    - ruta del archivo o directorio
 * @param {string} [task.content] - contenido a escribir (si action === 'write')
 * @param {string} [task.dest]    - destino (si action === 'move')
 * @returns {Promise<{success: boolean, output: string}>}
 */
export async function execute(task) {
  if (task.action === 'delete' && requiresApproval('destructive')) {
    throw new Error('ApprovalGate: eliminación de archivo requiere confirmación humana')
  }
  // TODO: implementar operaciones de archivo con backup antes de modificar críticos
  throw new Error('file-manager.execute: no implementado')
}

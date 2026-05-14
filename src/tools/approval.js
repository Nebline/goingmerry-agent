// Capa 5: ApprovalGate — solicitud de confirmación humana antes de acciones críticas

import * as readline from 'node:readline/promises'
import { stdin, stdout } from 'node:process'

/**
 * Solicita confirmación explícita al usuario antes de ejecutar una acción crítica.
 * Lanza un error si el usuario rechaza.
 *
 * @param {object} opts
 * @param {string} opts.action  - descripción precisa de la acción
 * @param {string} opts.impact  - qué cambia o se pierde si se ejecuta
 * @returns {Promise<void>} - resuelve si el usuario confirma
 * @throws {Error} si el usuario rechaza
 */
export async function approvalGate({ action, impact }) {
  const rl = readline.createInterface({ input: stdin, output: stdout })

  console.log('\n[MERRY] ApprovalGate:')
  console.log(`  Acción: ${action}`)
  console.log(`  Impacto: ${impact}`)

  const answer = await rl.question('  ¿Continuar? (s/n): ')
  rl.close()

  if (answer.trim().toLowerCase() !== 's') {
    throw new Error(`ApprovalGate: acción cancelada por el usuario → ${action}`)
  }
}

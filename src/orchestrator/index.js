// Capa 2: Orquestador — descompone tareas y coordina subagentes
// No implementa lógica de dominio; solo delega y verifica resultados

import config from '../../merry.config.js'
import { approvalGate } from '../tools/approval.js'

/**
 * Punto de entrada principal del orquestador.
 * @param {string} input - Tarea en lenguaje natural del usuario
 */
export async function run(input) {
  // TODO: clasificar tarea → determinar subagente(s) responsables
  // TODO: verificar si requiere ApprovalGate antes de ejecutar
  // TODO: delegar a subagente y esperar resultado verificado
  // TODO: registrar en memoria de sesión
  console.log(`[Orquestador] Tarea recibida: "${input}"`)
  console.log(`[Orquestador] Agentes disponibles: ${config.agents.join(', ')}`)
}

/**
 * Determina si una acción requiere confirmación humana.
 * @param {string} actionType - Tipo de acción (ver config.approvalGate.requireFor)
 * @returns {boolean}
 */
export function requiresApproval(actionType) {
  return config.approvalGate.enabled &&
    config.approvalGate.requireFor.includes(actionType)
}

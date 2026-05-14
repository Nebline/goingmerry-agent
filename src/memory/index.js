// Capa 6: Memoria y estado — contexto de sesión y persistencia entre ejecuciones

/**
 * Estado de la sesión actual (en memoria, volátil).
 * Para persistencia entre sesiones se usará SQLite en .merry/memory.db
 */
const session = {
  project: null,       // proyecto activo
  branch: null,        // rama Git actual
  modifiedFiles: [],   // archivos modificados sin commitear
  pendingApprovals: [], // acciones esperando ApprovalGate
  agentLog: [],        // historial de acciones de esta sesión
}

export function getSession() {
  return { ...session }
}

export function setProject(name, branch) {
  session.project = name
  session.branch = branch
}

export function logAction(agent, action, result) {
  session.agentLog.push({ agent, action, result, ts: Date.now() })
}

export function addPendingApproval(action) {
  session.pendingApprovals.push(action)
}

export function clearPendingApproval(action) {
  session.pendingApprovals = session.pendingApprovals.filter(a => a !== action)
}

// TODO: implementar persistencia SQLite en .merry/memory.db
// TODO: cargar estado de sesión anterior al iniciar

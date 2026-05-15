// Clasificador de tareas — traduce lenguaje natural a {agent, type, needsApproval}
// Diseño: reglas primero, LLM como fallback cuando no hay match claro

/** @typedef {{ agent: string, type: string, needsApproval: boolean, confidence: 'high'|'low' }} Classification */

const RULES = [
  // coder
  { pattern: /crea|genera|escribe|implementa|construye|añade/i,   agent: 'coder',        type: 'generate',  needsApproval: false },
  { pattern: /refactor|limpia|optimiza|mejora|simplifica/i,       agent: 'coder',        type: 'refactor',  needsApproval: false },
  { pattern: /debug|error|fallo|no funciona|bug|arregla|corrige/i, agent: 'coder',       type: 'debug',     needsApproval: false },

  // file-manager
  { pattern: /crea.*archivo|nuevo.*archivo|escribe.*en/i,         agent: 'file-manager', type: 'write',     needsApproval: false },
  { pattern: /mueve|renombra|copia.*archivo/i,                    agent: 'file-manager', type: 'move',      needsApproval: false },
  { pattern: /elimina|borra|delete.*archivo/i,                    agent: 'file-manager', type: 'delete',    needsApproval: true  },
  { pattern: /lee|muestra|abre.*archivo|contenido de/i,           agent: 'file-manager', type: 'read',      needsApproval: false },

  // terminal
  { pattern: /ejecuta|corre|run|npm|node |instala|instalar/i,     agent: 'terminal',     type: 'run',       needsApproval: false },
  { pattern: /git push|push.*main|push.*master|push.*prod/i,      agent: 'terminal',     type: 'push',      needsApproval: true  },
  { pattern: /rm -rf|borra.*todo|elimina.*directorio/i,           agent: 'terminal',     type: 'destructive', needsApproval: true },

  // researcher
  { pattern: /busca|investiga|researc|explica|qué es|cómo funciona|documentación/i, agent: 'researcher', type: 'web',  needsApproval: false },
  { pattern: /analiza|resume|sintetiza|compara/i,                 agent: 'researcher',   type: 'analyze',   needsApproval: false },

  // reporter
  { pattern: /reporte|informe|documento|pdf|xlsx|csv/i,           agent: 'reporter',     type: 'report',    needsApproval: false },
  { pattern: /readme|documentación del proyecto|doc de/i,         agent: 'reporter',     type: 'docs',      needsApproval: false },

  // web-designer
  { pattern: /página|landing|dashboard|interfaz|ui|html|css/i,    agent: 'web-designer', type: 'page',      needsApproval: false },
  { pattern: /componente|card|modal|formulario|navbar/i,          agent: 'web-designer', type: 'component', needsApproval: false },
]

/**
 * Clasifica la entrada del usuario en una tarea estructurada.
 * @param {string} input
 * @returns {Classification}
 */
export function classify(input) {
  for (const rule of RULES) {
    if (rule.pattern.test(input)) {
      return {
        agent: rule.agent,
        type:  rule.type,
        needsApproval: rule.needsApproval,
        confidence: 'high',
      }
    }
  }

  // Sin match claro → fallback a coder con baja confianza
  // TODO: reemplazar este fallback por una llamada a claude-haiku para clasificar
  return {
    agent: 'coder',
    type: 'generate',
    needsApproval: false,
    confidence: 'low',
  }
}

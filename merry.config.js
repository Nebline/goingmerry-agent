export default {
  version: '1.0.0',

  models: {
    complex: 'claude-sonnet-4-6',  // arquitectura, análisis, generación
    simple:  'claude-haiku-4-5',   // clasificación, formato, tareas simples
  },

  tools: {
    claudeCode: true,
    openCodeGo: true,
  },

  memory: {
    type: 'sqlite',
    path: '.merry/memory.db',
  },

  approvalGate: {
    enabled: true,
    requireFor: [
      'destructive',   // rm -rf, borrados masivos
      'push-main',     // push a main/master/production
      'external',      // emails, webhooks, APIs con efecto
      'secrets',       // modificar .env o archivos de secretos
      'prod-db',       // DROP, TRUNCATE, DELETE masivo en producción
    ],
  },

  agents: [
    'coder',
    'file-manager',
    'terminal',
    'researcher',
    'reporter',
    'web-designer',
  ],

  routing: {
    // Usar OpenCode GO cuando la tarea supera estos umbrales
    openCodeGo: {
      minFiles: 20,
      minChanges: 10,
    },
  },
}

import { callLLM } from '../tools/llm.js'

const RULES = [
  { patterns: [/ejecuta|corre|comando|bash|script|terminal/i],           agent: 'terminal',     action: 'run'      },
  { patterns: [/genera|escribe|código|función|clase|refactor|debug/i],   agent: 'coder',        action: 'generate' },
  { patterns: [/^(lee|leer|lista|listar|mueve|elimina|borra|crea\s+(el\s+)?directorio|crea\s+carpeta|mkdir|abre\s+el\s+archivo)/i, /escribe\s+archivo|mueve\s+el\s+archivo/i], agent: 'file-manager', action: 'read' },
  { patterns: [/busca|investiga|qué\s+es|explica|encuentra|search|find/i], agent: 'researcher', action: 'search'   },
  { patterns: [/reporte|informe|pdf|excel|documenta/i],                  agent: 'reporter',     action: 'generate' },
  { patterns: [/página|web|html|css|componente|diseño/i],                agent: 'web-designer', action: 'build'    },
]

export async function classify(input) {
  for (const rule of RULES) {
    if (rule.patterns.some(p => p.test(input))) {
      return { agent: rule.agent, action: rule.action, method: 'keyword' }
    }
  }
  return classifyWithLLM(input)
}

async function classifyWithLLM(input) {
  const agents = ['terminal', 'coder', 'file-manager', 'researcher', 'reporter', 'web-designer']
  const prompt = `Clasifica esta tarea en exactamente uno de estos agentes: ${agents.join(', ')}.
Responde SOLO con JSON válido: {"agent": "<nombre>", "action": "<verbo breve>"}
Tarea: "${input}"`

  const raw = await callLLM({ prompt, complexity: 'simple', maxTokens: 64 })

  try {
    const match = raw.match(/\{[\s\S]*?\}/)
    return { ...JSON.parse(match[0]), method: 'llm' }
  } catch {
    return { agent: 'coder', action: 'generate', method: 'fallback' }
  }
}

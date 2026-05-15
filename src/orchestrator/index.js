import config from '../../merry.config.js'
import { approvalGate } from '../tools/approval.js'
import { logAction } from '../memory/index.js'
import { makeResult } from '../types/result.js'
import { classify } from './classifier.js'
import { loadAgent } from './loader.js'
import { decompose } from './decomposer.js'

export async function run(input, { quiet = false } = {}) {
  // Multi-step: decompose and run in parallel
  const subtasks = await decompose(input)
  if (subtasks) {
    return runParallel(subtasks, { quiet })
  }

  const { agent: agentName, action, method } = await classify(input)
  if (!quiet) console.log(`[Merry] → ${agentName} (via ${method})`)

  let agent
  try {
    agent = await loadAgent(agentName)
  } catch {
    const msg = `Agente "${agentName}" no disponible en esta versión.`
    if (!quiet) console.error(`[Merry] ${msg}`)
    return makeResult({ success: false, output: msg, agent: agentName, action, error: msg })
  }

  const task = buildTask(agentName, action, input)
  logAction(agentName, input, 'started')

  let result
  try {
    result = await agent.execute(task)
  } catch (err) {
    logAction(agentName, input, 'error')
    if (!quiet) console.error(`[${agentName.toUpperCase()}] Error: ${err.message}`)
    return makeResult({ success: false, output: err.message, agent: agentName, action, error: err.message })
  }

  logAction(agentName, input, result.success ? 'ok' : 'error')
  if (!quiet) printResult(result)
  return result
}

async function runParallel(tasks, { quiet }) {
  if (!quiet) console.log(`[Merry] → Tarea múltiple: ${tasks.length} subtareas en paralelo`)

  const settled = await Promise.allSettled(tasks.map(t => run(t, { quiet: true })))

  const lines = settled.map((r, i) => {
    if (r.status === 'fulfilled') return `[${i + 1}] ✓  ${r.value.output}`
    return `[${i + 1}] ✗  ${r.reason?.message ?? 'Error desconocido'}`
  })

  const allOk = settled.every(r => r.status === 'fulfilled' && r.value?.success)
  return makeResult({
    success: allOk,
    output: lines.join('\n\n'),
    agent: 'orchestrator',
    action: 'multi-task',
  })
}

export function requiresApproval(actionType) {
  return config.approvalGate.enabled &&
    config.approvalGate.requireFor.includes(actionType)
}

function buildTask(agent, action, input) {
  switch (agent) {
    case 'terminal':
      return { command: input, cwd: process.cwd() }
    case 'coder':
      return { action, context: input }
    case 'file-manager':
      return buildFileTask(input)
    case 'researcher':
      return buildResearchTask(input)
    case 'reporter':
      return { action: 'report', context: input }
    case 'web-designer':
      return { action: 'build', spec: input }
    default:
      return { action, context: input }
  }
}

function buildFileTask(input) {
  const lower = input.toLowerCase()

  if (/^(lee|leer|muestra|abre)\b/.test(lower)) {
    const path = input.replace(/^(lee|leer|muestra|abre)\s+(el\s+archivo\s+)?/i, '').trim()
    return { action: 'read', path }
  }
  if (/^(lista|listar|archivos\s+en)\b/.test(lower)) {
    const path = input.replace(/^(lista|listar|archivos\s+en)\s+/i, '').trim() || '.'
    return { action: 'list', path }
  }
  if (/^(crea\s+(el\s+)?directorio|crea\s+carpeta|mkdir)\b/.test(lower)) {
    const path = input.replace(/^(crea\s+(el\s+)?directorio|crea\s+carpeta|mkdir)\s+/i, '').trim()
    return { action: 'mkdir', path }
  }
  if (/^(elimina|borra|eliminar|borrar)\b/.test(lower)) {
    const path = input.replace(/^(elimina|borra|eliminar|borrar)\s+(el\s+archivo\s+)?/i, '').trim()
    return { action: 'delete', path }
  }
  return { action: 'list', path: '.' }
}

function buildResearchTask(input) {
  const query  = input.replace(/^(busca|investiga|search|encuentra|qué\s+es|explica)\s+/i, '').trim()
  const source = /\b(docs|documentaci[oó]n|readme|markdown)\b/i.test(input) ? 'docs' : 'codebase'
  const depth  = /\b(resume|resumen|detalle|detallado|sintetiza)\b/i.test(input) ? 2 : 1
  return { query, source, depth }
}

function printResult(result) {
  const status = result.success ? 'OK' : 'ERROR'
  console.log(`\n[${result.agent.toUpperCase()}] → ${status}`)
  console.log(result.output)
  if (!result.success && result.error) {
    console.error(`\nCausa: ${result.error}`)
  }
}

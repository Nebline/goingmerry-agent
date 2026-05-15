import { exec } from 'node:child_process'
import { promisify } from 'node:util'
import { approvalGate } from '../../tools/approval.js'
import { logAction } from '../../memory/index.js'
import { makeResult } from '../../types/result.js'
import config from '../../../merry.config.js'

const execAsync = promisify(exec)

const DESTRUCTIVE = [
  /rm\s+-rf/i,
  /DROP\s+TABLE/i,
  /TRUNCATE/i,
  /git\s+push.*(main|master|prod|production)/i,
  /format\s+[a-z]:/i,
  /del\s+\/[sf]/i,
]

export async function execute(task) {
  const { cwd = process.cwd() } = task
  const command = task.command.replace(/^(ejecuta|corre|bash|terminal)\s+/i, '').trim()

  const isDestructive = DESTRUCTIVE.some(p => p.test(command))
  if (isDestructive && config.approvalGate.enabled) {
    await approvalGate({
      action: command,
      impact: 'Comando potencialmente destructivo en el sistema de archivos o repositorio',
    })
  }

  try {
    const { stdout, stderr } = await execAsync(command, { cwd, timeout: 30_000 })
    const output = stdout.trim() || stderr.trim()
    logAction('terminal', command, 'ok')
    return makeResult({ success: true, output, agent: 'terminal', action: command })
  } catch (err) {
    logAction('terminal', command, 'error')
    return makeResult({
      success: false,
      output: err.stderr?.trim() || err.message,
      agent: 'terminal',
      action: command,
      error: err.message,
    })
  }
}

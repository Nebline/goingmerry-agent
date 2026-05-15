import { appendFile, mkdir } from 'node:fs/promises'
import { join } from 'node:path'

const LOGS_DIR = join(process.cwd(), '.merry', 'logs')

export async function log(level, message, meta = {}) {
  const entry = JSON.stringify({ ts: new Date().toISOString(), level, message, ...meta }) + '\n'
  const file  = join(LOGS_DIR, `merry-${today()}.log`)
  try {
    await mkdir(LOGS_DIR, { recursive: true })
    await appendFile(file, entry, 'utf-8')
  } catch { /* logging must never crash the agent */ }
}

export const logger = {
  info:  (msg, meta) => log('info',  msg, meta),
  warn:  (msg, meta) => log('warn',  msg, meta),
  error: (msg, meta) => log('error', msg, meta),
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

import { appendFile, writeFile, readFile, mkdir } from 'node:fs/promises'
import { join } from 'node:path'

const MERRY_DIR  = join(process.cwd(), '.merry')
const LOG_FILE   = join(MERRY_DIR, 'memory.jsonl')
const STATE_FILE = join(MERRY_DIR, 'session.json')

const session = {
  project: null,
  branch: null,
  modifiedFiles: [],
  pendingApprovals: [],
  agentLog: [],
}

// Load previous state on startup
mkdir(MERRY_DIR, { recursive: true })
  .then(() => readFile(STATE_FILE, 'utf-8'))
  .then(raw => Object.assign(session, JSON.parse(raw)))
  .catch(() => {})

export function getSession() {
  return { ...session }
}

export function setProject(name, branch) {
  session.project = name
  session.branch  = branch
  persist()
}

export function logAction(agent, action, result) {
  const entry = { agent, action, result, ts: Date.now() }
  session.agentLog.push(entry)
  appendFile(LOG_FILE, JSON.stringify(entry) + '\n', 'utf-8').catch(() => {})
}

export function addPendingApproval(action) {
  session.pendingApprovals.push(action)
  persist()
}

export function clearPendingApproval(action) {
  session.pendingApprovals = session.pendingApprovals.filter(a => a !== action)
  persist()
}

function persist() {
  mkdir(MERRY_DIR, { recursive: true })
    .then(() => writeFile(STATE_FILE, JSON.stringify(session, null, 2), 'utf-8'))
    .catch(() => {})
}

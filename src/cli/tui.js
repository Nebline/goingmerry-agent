import chalk from 'chalk'
import ora from 'ora'

// ── Paleta Iron Man / Going Merry ───────────────────────────────
const C = {
  red:   '#E63946',
  gold:  '#FFD700',
  cyan:  '#00B4D8',
  white: '#F1FAEE',
  dim:   '#457B9D',
  green: '#06D6A0',
}

// ── ASCII Going Merry ────────────────────────────────────────────
const SHIP = [
  '         |    |    |        ',
  '         |    |    |        ',
  '    ─────┼────┼────┼─────   ',
  '   /  ≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡   \\ ',
  '  /   GOING    MERRY   🐑   \\ ',
  ' /______________________________\\ ',
  ' ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~  ',
]

// ── Agentes registrados ──────────────────────────────────────────
const AGENTS = [
  { id: 'terminal',     icon: '⚡', label: 'TERMINAL    ' },
  { id: 'coder',        icon: '💻', label: 'CODER       ' },
  { id: 'file-manager', icon: '📁', label: 'FILE-MGR    ' },
  { id: 'researcher',   icon: '🔍', label: 'RESEARCHER  ' },
  { id: 'reporter',     icon: '📊', label: 'REPORTER    ' },
  { id: 'web-designer', icon: '🎨', label: 'WEB-DESIGNER' },
]

const W = 58  // ancho interior del header box

// ── Funciones públicas ───────────────────────────────────────────

export function showHeader(activeAgent = null) {
  console.clear()

  // Header box
  console.log(chalk.hex(C.red)('  ╔' + '═'.repeat(W) + '╗'))
  console.log(chalk.hex(C.red)('  ║') + chalk.hex(C.gold).bold(center('⚓  G O I N G   M E R R Y  ⚓', W)) + chalk.hex(C.red)('║'))
  console.log(chalk.hex(C.red)('  ║') + chalk.hex(C.cyan)(center('AGENT SYSTEM   ·   v1.0', W)) + chalk.hex(C.red)('║'))
  console.log(chalk.hex(C.red)('  ╚' + '═'.repeat(W) + '╝'))

  // Ship
  console.log()
  SHIP.forEach((line, i) => {
    const color = i <= 2 ? C.gold : i === 5 ? C.gold : i === 6 ? C.cyan : C.white
    console.log(chalk.hex(color)('  ' + line))
  })

  // Status grid
  console.log()
  console.log(chalk.hex(C.cyan)('  ─── SISTEMAS ' + '─'.repeat(W - 14)))
  AGENTS.forEach(a => {
    const active = a.id === activeAgent
    const dot  = active ? chalk.hex(C.green)('◉ ACTIVO  ') : chalk.hex(C.dim)('○ STANDBY ')
    const name = active ? chalk.hex(C.white).bold(a.label) : chalk.hex(C.dim)(a.label)
    console.log(`  ${a.icon}  ${name}  ${dot}`)
  })
  console.log(chalk.hex(C.cyan)('  ' + '─'.repeat(W)))
  console.log()
}

export function showResult(result) {
  if (!result) return
  const ok  = result.success !== false
  const col = ok ? chalk.hex(C.green) : chalk.hex(C.red)
  const status = ok ? 'OK' : 'ERROR'

  console.log(chalk.hex(C.cyan)('  ─── OUTPUT ' + '─'.repeat(W - 12)))
  console.log(col(`  [${(result.agent || 'merry').toUpperCase()}] → ${status}`))
  console.log()
  ;(result.output || '(sin salida)').split('\n').forEach(l =>
    console.log(chalk.hex(C.white)('  ' + l))
  )
  if (!ok && result.error) {
    console.log(chalk.hex(C.red)(`\n  ✕ ${result.error}`))
  }
  console.log()
  console.log(chalk.hex(C.cyan)('  ' + '─'.repeat(W)))
  console.log()
}

export function showInfo(msg)  { console.log(chalk.hex(C.cyan)(`  ◆ ${msg}`)) }
export function showWarn(msg)  { console.log(chalk.hex(C.gold)(`  ⚠  ${msg}`)) }
export function showError(msg) { console.log(chalk.hex(C.red)(`  ✕ ${msg}`)) }

export function textPrompt()  { return chalk.hex(C.gold)('  ⌨  → ') }
export function voicePrompt() { return chalk.hex(C.red)('  🎙 → ') }

export function createSpinner(text) {
  return ora({ text: chalk.hex(C.cyan)(text), spinner: 'dots12', color: 'yellow' })
}

// ── Helpers ──────────────────────────────────────────────────────

function center(str, width) {
  const pad = Math.max(0, Math.floor((width - str.length) / 2))
  return ' '.repeat(pad) + str + ' '.repeat(width - pad - str.length)
}

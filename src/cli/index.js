import * as readline from 'node:readline/promises'
import { stdin, stdout } from 'node:process'
import { run } from '../orchestrator/index.js'
import {
  showHeader, showResult, showInfo, showWarn, showError,
  textPrompt, voicePrompt, createSpinner,
} from './tui.js'
import { recordAndTranscribe } from './voice.js'

const RECORD_SECS = 5
const EXIT_CMDS   = new Set(['salir', 'exit', 'q', 'quit'])

// ── Modo single-command (non-interactive) ────────────────────────
const args = process.argv.slice(2)
if (args.length > 0) {
  const input = args.join(' ').trim()
  run(input).catch(err => { console.error(err.message); process.exit(1) })
  process.exitCode = 0
} else {
  // ── Modo TUI interactivo ─────────────────────────────────────
  startTUI().catch(err => { console.error(err.message); process.exit(1) })
}

async function startTUI() {
  showHeader()
  showInfo('Escribe una tarea · "v" para voz · "salir" para cerrar')
  console.log()

  process.on('SIGINT', () => {
    console.log('\n\n  ⚓ Hasta la próxima, nakama.\n')
    process.exit(0)
  })

  const rl = readline.createInterface({ input: stdin, output: stdout, terminal: true })

  while (true) {
    let raw
    try {
      raw = await rl.question(textPrompt())
    } catch {
      // CTRL+D
      console.log('\n  ⚓ Hasta la próxima, nakama.\n')
      break
    }

    const input_txt = raw.trim()
    if (!input_txt) continue
    if (EXIT_CMDS.has(input_txt)) {
      console.log('\n  ⚓ Hasta la próxima, nakama.\n')
      break
    }

    let finalInput = input_txt

    // ── Modo voz ────────────────────────────────────────────────
    if (input_txt === 'v') {
      try {
        process.stdout.write(voicePrompt())
        showInfo(`Grabando ${RECORD_SECS}s... habla ahora`)
        finalInput = await recordAndTranscribe(RECORD_SECS)
        if (!finalInput) { showWarn('No se detectó audio.'); continue }
        showInfo(`Escuché: "${finalInput}"`)
        console.log()
      } catch (err) {
        showError(err.message)
        continue
      }
    }

    // ── Ejecutar tarea ──────────────────────────────────────────
    const spin = createSpinner('Procesando...')
    spin.start()

    let result
    try {
      result = await run(finalInput, { quiet: true })
    } catch (err) {
      spin.fail(err.message)
      continue
    }

    spin.stop()
    showResult(result)
  }

  rl.close()
  process.exit(0)
}

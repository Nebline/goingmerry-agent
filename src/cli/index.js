// Capa 1: CLI — punto de entrada del usuario
// Parsea argumentos y delega al orquestador

import { run } from '../orchestrator/index.js'

const args = process.argv.slice(2)
const input = args.join(' ').trim()

if (!input) {
  console.log('Merry v1.0 — escribe una tarea para comenzar.')
  process.exit(0)
}

run(input)

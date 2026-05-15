import { spawn } from 'node:child_process'
import { readFile, unlink } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'

const TMP_WAV        = join(tmpdir(), 'merry-voice.wav')
const WHISPER_URL    = 'https://api.openai.com/v1/audio/transcriptions'
const DEFAULT_SECS   = 5

// ── API pública ──────────────────────────────────────────────────

/**
 * Graba audio del micrófono y lo transcribe con OpenAI Whisper.
 * Requiere: SoX instalado en el sistema + OPENAI_API_KEY en .env.local
 *
 * Instalar SoX en Windows:
 *   winget install SoX.SoX
 *   choco install sox.portable
 */
export async function recordAndTranscribe(seconds = DEFAULT_SECS) {
  await record(seconds)
  const text = await transcribe(TMP_WAV)
  await unlink(TMP_WAV).catch(() => {})
  return text.trim()
}

// ── Grabación vía SoX ────────────────────────────────────────────

function record(seconds) {
  return new Promise((resolve, reject) => {
    const proc = spawn('sox', [
      '-d',                       // dispositivo de audio por defecto
      '-r', '16000',              // 16 kHz (óptimo para Whisper)
      '-e', 'signed-integer',
      '-b', '16',
      '-c', '1',                  // mono
      TMP_WAV,
      'trim', '0', String(seconds),
    ])

    proc.stderr.on('data', () => {})  // silenciar stderr de sox
    proc.on('error', () => reject(new Error(
      'SoX no encontrado.\n' +
      '  Windows: winget install SoX.SoX\n' +
      '  O descarga: https://sourceforge.net/projects/sox/'
    )))
    proc.on('close', code => {
      if (code === 0) resolve()
      else reject(new Error(`Grabación falló (código ${code}). Verificar micrófono.`))
    })
  })
}

// ── Transcripción vía OpenAI Whisper (fetch nativo Node 20+) ────

async function transcribe(wavPath) {
  const key = process.env.OPENAI_API_KEY
  if (!key) throw new Error(
    'OPENAI_API_KEY no configurada.\n' +
    '  Agrega OPENAI_API_KEY=sk-... en .env.local'
  )

  const audioData = await readFile(wavPath)
  const form = new FormData()
  form.append('file', new File([audioData], 'audio.wav', { type: 'audio/wav' }))
  form.append('model', 'whisper-1')
  form.append('language', 'es')

  const res = await fetch(WHISPER_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}` },
    body: form,
  })

  if (!res.ok) {
    const err = await res.text().catch(() => res.statusText)
    throw new Error(`Whisper API error ${res.status}: ${err}`)
  }

  const data = await res.json()
  return data.text || ''
}

import { spawn } from 'node:child_process'

const DEFAULT_SECS = 6

/**
 * Graba y transcribe voz usando Windows Speech Recognition (System.Speech).
 * Requiere: Windows 10/11 con micrófono configurado.
 * Sin API keys. Sin dependencias externas.
 */
export async function recordAndTranscribe(seconds = DEFAULT_SECS) {
  return recognizeWithWindowsSR(seconds)
}

function recognizeWithWindowsSR(seconds) {
  // PowerShell invoca System.Speech.Recognition (.NET nativo de Windows)
  const script = `
Add-Type -AssemblyName System.Speech
try {
  $r = New-Object System.Speech.Recognition.SpeechRecognitionEngine
  $r.SetInputToDefaultAudioDevice()
  $r.LoadGrammar((New-Object System.Speech.Recognition.DictationGrammar))
  $result = $r.Recognize([System.TimeSpan]::FromSeconds(${seconds}))
  if ($result) { Write-Output $result.Text }
  else { Write-Output '' }
  $r.Dispose()
} catch {
  Write-Error $_.Exception.Message
  exit 1
}
`

  return new Promise((resolve, reject) => {
    const proc = spawn('powershell', [
      '-NonInteractive',
      '-NoProfile',
      '-Command', script,
    ])

    let out = ''
    let err = ''

    proc.stdout.on('data', d => { out += d.toString() })
    proc.stderr.on('data', d => { err += d.toString() })

    proc.on('error', () => reject(new Error(
      'PowerShell no disponible. ¿Estás en Windows?'
    )))

    proc.on('close', code => {
      if (code !== 0) {
        reject(new Error(
          `Windows Speech Recognition falló.\n` +
          `  Verifica que el micrófono esté configurado en Windows.\n` +
          (err ? `  Detalle: ${err.trim()}` : '')
        ))
      } else {
        resolve(out.trim())
      }
    })
  })
}

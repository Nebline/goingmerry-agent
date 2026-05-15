import { readFile, writeFile, rename, unlink, mkdir, readdir } from 'node:fs/promises'
import { resolve, dirname, relative, extname } from 'node:path'
import { approvalGate } from '../../tools/approval.js'
import { logAction } from '../../memory/index.js'
import { makeResult } from '../../types/result.js'
import config from '../../../merry.config.js'

const FILE_ICON = { d: '📁', f: '📄' }

export async function execute(task) {
  const { action, path: filePath, content = '', dest } = task

  try {
    const result = await dispatch(action, filePath, content, dest)
    logAction('file-manager', `${action} ${filePath}`, 'ok')
    return makeResult({ success: true, output: result, agent: 'file-manager', action })
  } catch (err) {
    logAction('file-manager', `${action} ${filePath}`, 'error')
    return makeResult({ success: false, output: err.message, agent: 'file-manager', action, error: err.message })
  }
}

async function dispatch(action, filePath, content, dest) {
  const abs = resolve(filePath)

  switch (action) {
    case 'read':
      return readFile(abs, 'utf-8')

    case 'write': {
      await mkdir(dirname(abs), { recursive: true })
      await writeFile(abs, content, 'utf-8')
      return `Guardado: ${abs}`
    }

    case 'append': {
      await mkdir(dirname(abs), { recursive: true })
      const existing = await readFile(abs, 'utf-8').catch(() => '')
      await writeFile(abs, existing + content, 'utf-8')
      return `Actualizado: ${abs}`
    }

    case 'move': {
      const absDest = resolve(dest)
      await mkdir(dirname(absDest), { recursive: true })
      await rename(abs, absDest)
      return `Movido: ${filePath} → ${dest}`
    }

    case 'delete': {
      if (config.approvalGate.enabled) {
        await approvalGate({
          action: `Eliminar archivo: ${abs}`,
          impact: 'El archivo se borrará permanentemente sin posibilidad de recuperación',
        })
      }
      await unlink(abs)
      return `Eliminado: ${abs}`
    }

    case 'mkdir': {
      await mkdir(abs, { recursive: true })
      return `Directorio creado: ${abs}`
    }

    case 'list': {
      const entries = await readdir(abs, { withFileTypes: true })
      const lines = entries.map(e => {
        const icon = e.isDirectory() ? FILE_ICON.d : FILE_ICON.f
        return `${icon} ${e.name}`
      })
      return `Contenido de ${filePath}:\n${lines.join('\n')}`
    }

    default:
      throw new Error(`Acción no reconocida: "${action}". Usa: read, write, append, move, delete, mkdir, list`)
  }
}

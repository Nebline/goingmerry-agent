# Merry — Orquestador de Agentes CLI

> Agente de producción autónomo. No es un chatbot: genera artefactos funcionales.

**Stack:** Node.js · Claude Code · OpenCode GO · GitHub  
**Interfaz:** CLI conversacional  
**Versión:** 1.0.0

---

## ¿Qué es Merry?

Merry es un orquestador de agentes orientado a resultados tangibles: código ejecutable, reportes reales, automatizaciones funcionales. Cada sesión termina con algo construido, desplegado o documentado.

**Misión:** maximizar output útil por token consumido.

---

## Arquitectura

```
CLI → Orquestador → Subagentes → ApprovalGate → Herramientas → Memoria
```

| Capa | Módulo | Rol |
|------|--------|-----|
| 1 | `src/cli/` | Entrada del usuario |
| 2 | `src/orchestrator/` | Descompone y delega tareas |
| 3 | `src/agents/` | Ejecución especializada |
| 4 | `src/tools/approval.js` | Confirmación humana para acciones críticas |
| 5 | `src/tools/` | Claude Code, OpenCode GO, Bash |
| 6 | `src/memory/` | Estado de sesión + SQLite local |
| 7 | `merry.config.js` | Configuración centralizada |

---

## Subagentes

| ID | Responsabilidad |
|----|----------------|
| `coder` | Generación, refactor y debugging de código |
| `file-manager` | Lectura, escritura y organización de archivos |
| `terminal` | Ejecución de comandos del sistema |
| `researcher` | Búsqueda, síntesis y validación de información |
| `reporter` | Reportes, informes y documentación estructurada |
| `web-designer` | UI/UX, HTML/CSS/JS, componentes web |

---

## Uso rápido

```bash
# Instalar dependencias
npm install

# Ejecutar una tarea
npm start "genera un script que liste archivos por extensión"

# Modo desarrollo (hot reload)
npm run dev "analiza la estructura del proyecto actual"
```

---

## Estructura del proyecto

```
goingmerry-agent/
├── CLAUDE.md              # Instrucciones operativas para Claude Code
├── AGENTS.md              # Contrato universal de agentes (tool-agnostic)
├── merry.config.js        # Configuración centralizada
├── docs/
│   └── MERRY_MEMORY.md    # Memoria maestra del proyecto
└── src/
    ├── cli/               # Punto de entrada CLI
    ├── orchestrator/      # Coordinación de subagentes
    ├── agents/            # coder · file-manager · terminal · researcher · reporter · web-designer
    ├── tools/             # ApprovalGate · logger · integraciones IA
    └── memory/            # Estado de sesión y persistencia
```

---

## Seguridad y ApprovalGate

Las siguientes acciones requieren confirmación explícita antes de ejecutarse:

- Borrados masivos o destructivos (`rm -rf`)
- Push a ramas protegidas (`main`, `production`)
- Modificación de archivos `.env` o secretos
- Envío de emails, webhooks o notificaciones externas
- Operaciones en base de datos de producción

---

## Flujo Git

```
feat/xxx  ──┐
fix/xxx   ──┼──► dev ──► main (solo via PR)
docs/xxx  ──┘
```

Commits en inglés, formato [Conventional Commits](https://www.conventionalcommits.org/).

---

## Documentación

| Archivo | Propósito |
|---------|-----------|
| `CLAUDE.md` | Reglas operativas para Claude Code (compacto + detallado) |
| `AGENTS.md` | Contrato tool-agnostic para cualquier agente |
| `docs/MERRY_MEMORY.md` | Memoria maestra: arquitectura, capacidades, reglas completas |

---

*Repositorio: [Nebline/goingmerry-agent](https://github.com/Nebline/goingmerry-agent)*

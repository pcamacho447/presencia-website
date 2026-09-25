# Directivas y Arquitectura de Trabajo - Presencia Web

## 1. Metodología BMAD (Breakthrough Method for Agile AI-Driven Development)
Este proyecto utiliza el marco ágil de desarrollo por especificación y agentes especializados de BMAD v6.12 (`bmm`).
- **Fases del Ciclo de Vida**:
  1. *Análisis*: Requisitos y objetivos de negocio (`bmad-agent-analyst`, `bmad-prd`, `bmad-product-brief`).
  2. *Planificación & Historias*: Desglose en Epics y User Stories (`bmad-agent-pm`, `bmad-create-epics-and-stories`, `bmad-sprint-planning`).
  3. *Arquitectura & Solución*: Modelado técnico y diseño de interfaces (`bmad-agent-architect`, `bmad-architecture`, `bmad-agent-ux-designer`).
  4. *Implementación & Revisión*: Desarrollo asistido y revisiones de código estrictas (`bmad-agent-dev`, `bmad-code-review`, `bmad-qa-generate-e2e-tests`).
- **Artefactos**: Todos los artefactos de planificación e historias se organizan en `_bmad-output/` y `_bmad/`.

## 2. Entorno y Herramientas (CLI & Runtime)
- **Pi Coding Agent**: Harness ligero y CLI universal disponible en PATH (`pi`).
- **UV (Python Environment)**: Gestor ultra-rápido disponible en `~/.local/bin/uv.exe` para ejecutar los scripts de automatización de BMAD.
- **Node.js & NPX**: Motor de ejecución para servidores MCP y dependencias web.

## 3. Integración de Herramientas MCP
- **Supabase MCP Server**:
  - Proyecto referenciado: `zboxdsiejvmjupdawgax`.
  - Módulos activos: `database`, `docs`, `debugging`, `functions`, `storage`.
  - Regla: Consultar esquemas y validar políticas RLS antes de generar migraciones o consultas SQL.
- **Figma Developer MCP Server**:
  - Extracción directa de diseños, tokens, componentes, árboles de nodos y medidas de pantalla.
  - Regla: Al implementar componentes UI en frontend, inspeccionar el diseño de Figma primero para mantener fidelidad visual pixel-perfect.

## 4. Flujo de Trabajo Optimizado para el Asistente
- **Autonomía & Rigor**: Planificar antes de codificar, modularizar componentes y ejecutar validaciones automáticas.
- **Idioma**: Comunicación técnica y documentación en Español.

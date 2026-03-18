# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Application Tracker — a project in its initial stage (no application code yet). The repository currently defines a **multi-agent workflow** via role-based agent definitions in `agents/`.

## Agent System

The `agents/` directory contains four role definitions that form a pipeline:

1. **Architect** (`architect.md`) — Plans implementations, defines before/after states, produces plan documents with acceptance criteria. Does not write code. Yields on bug reports or trivial changes.
2. **Coder** (`coder.md`) — Implements from architect plans or standalone briefs. Writes tests first when specs exist. Never commits — that happens after review. Yields on complex work without a plan.
3. **Contextualizer** (`contextuatilizer.md`) — Walks the codebase and produces/updates `.context.md` files per directory for orientation.
4. **Reviewer** (`reviewer.md`) — Reviews code, plans, docs, or config. Delivers pass/partial-pass/fail verdicts with blockers, warnings, and confidence scores.

Each agent has: identity, playbook (step-by-step workflow), handoff format, red lines (hard constraints), and yield conditions (when to stop and hand back).

### Key Workflow Constraints

- Architect plans use a confidence scale (0–5) and must include acceptance criteria.
- Coder follows TDD when test specs are provided — tests must fail before implementation.
- Coder never expands scope beyond the plan or brief.
- Reviewer checks substance before form; uses a structured verdict format.
- Commits happen only after review and user confirmation — never during implementation.

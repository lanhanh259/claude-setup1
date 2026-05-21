---
name: writing-skills
description: Guides the creation of well-structured Claude Agent Skills following Anthropic's official specification. Use when the user asks to write, create, build, review, or improve a skill (SKILL.md file). Do NOT use for general coding tasks unrelated to skill authoring.
---

# Writing Skills for Claude

This skill teaches how to author Agent Skills that Claude can discover and use effectively. The body below is intentionally short — detailed guidance lives in `references/`, loaded only when needed.

## Core principles

1. **Be concise.** The context window is shared. Only add what Claude doesn't already know.
2. **Use progressive disclosure.** Keep SKILL.md as a table of contents; push detail into `references/`.
3. **Match freedom to fragility.** Loose prose for open tasks, exact commands for fragile ones.
4. **Test with the models you target.** Haiku, Sonnet, and Opus respond differently to the same instructions.

## File structure

```
your-skill-name/        # kebab-case: lowercase, numbers, hyphens only
├── SKILL.md            # REQUIRED — exact case
├── references/         # optional, loaded on demand
├── scripts/            # optional, executable utilities
└── assets/             # optional, templates/fonts/icons (convention, not in best-practices doc)
```

## Naming convention

Prefer **gerund form** (verb + -ing) for the `name` field. It describes the activity the skill provides and reads consistently across a collection.

| | Example |
|---|---|
| ✅ Gerund (preferred) | `processing-pdfs`, `analyzing-spreadsheets`, `writing-documentation` |
| ✅ Acceptable | Noun phrase: `pdf-processing`. Action: `process-pdfs` |
| ❌ Avoid | `helper`, `utils`, `tools`, `documents`, `data` (vague); `anthropic-*`, `claude-*` (reserved) |

Recommended: the skill folder name matches the `name` field. The official spec doesn't strictly require this — some Anthropic examples diverge (e.g. folder `bigquery-skill/` with `name: bigquery-analysis`) — but matching keeps discovery and references predictable.

## YAML frontmatter (only `name` and `description` are required)

```yaml
---
name: processing-pdfs
description: [what it does] + [when to use] + [optional negative trigger]
---
```

**Hard rules from the spec:**
- `name`: max 64 chars, lowercase letters/numbers/hyphens only, no XML tags, no reserved words (`anthropic`, `claude`)
- `description`: non-empty, max 1024 chars, no XML tags, third person
- No other fields are part of the official spec. Any `metadata:` block is non-standard.

For detailed rules on the description field — the single most important part of a skill — see [references/descriptions.md](references/descriptions.md).

## Workflow

When asked to write or review a skill, follow this order:

1. **Clarify the trigger.** What user phrases should activate this skill? What should NOT activate it? Without this, the description can't be written well.
2. **Draft the description first.** This is the discovery surface. See [references/descriptions.md](references/descriptions.md).
3. **Choose the structure.** Single SKILL.md, or SKILL.md + references? See [references/progressive-disclosure.md](references/progressive-disclosure.md).
4. **Write the body.** Apply degree-of-freedom matching and concise style. See [references/writing-body.md](references/writing-body.md).
5. **Add workflows or feedback loops** if the task is multi-step or quality-critical. See [references/workflows-and-loops.md](references/workflows-and-loops.md).
6. **If the skill includes scripts**, apply the executable-code rules. See [references/advanced-scripts.md](references/advanced-scripts.md).
7. **Validate** against [references/checklist.md](references/checklist.md).
8. **Plan evaluations.** See [references/evaluation-and-iteration.md](references/evaluation-and-iteration.md).

## Reference index

| File | When to read |
|---|---|
| [references/descriptions.md](references/descriptions.md) | Writing or reviewing the `description` field |
| [references/progressive-disclosure.md](references/progressive-disclosure.md) | Deciding how to split SKILL.md and references |
| [references/writing-body.md](references/writing-body.md) | Writing the SKILL.md body — conciseness, freedom, terminology |
| [references/workflows-and-loops.md](references/workflows-and-loops.md) | Multi-step tasks, checklists, validate-fix loops |
| [references/patterns.md](references/patterns.md) | Template, examples, and conditional-workflow patterns |
| [references/advanced-scripts.md](references/advanced-scripts.md) | Skills that bundle executable code |
| [references/evaluation-and-iteration.md](references/evaluation-and-iteration.md) | Building evals; Claude A / Claude B iteration |
| [references/checklist.md](references/checklist.md) | Final review before publishing |
| [references/troubleshooting.md](references/troubleshooting.md) | Skill misbehaves (won't trigger, triggers too often, etc.) |

## Quick anti-patterns

- ❌ First-person description (`"I can help you..."`) — use third person
- ❌ Vague descriptions (`"Helps with documents"`) — include what AND when
- ❌ Vague names (`helper`, `utils`) or reserved words (`anthropic-*`, `claude-*`)
- ❌ Windows paths (`scripts\helper.py`) — always use forward slashes
- ❌ Offering a menu of options (`"use pypdf or pdfplumber or PyMuPDF..."`) — pick a default
- ❌ Time-sensitive content (`"before August 2025..."`) — use an "old patterns" section
- ❌ Nested references (SKILL.md → A.md → B.md) — keep one level deep
- ❌ Inline a `README.md` for Claude — that's for humans; Claude reads SKILL.md + references/

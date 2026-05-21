# Progressive disclosure

Skills work in three loading levels. Designing around these levels is the most important architectural decision in skill authoring.

## Contents
- The three loading levels
- When to keep everything in SKILL.md
- When to split into references
- Pattern 1: High-level guide with references
- Pattern 2: Domain-based organization
- Pattern 3: Conditional details
- Keep references one level deep
- Table of contents for long references

## The three loading levels

| Level | Content | When loaded | Cost |
|---|---|---|---|
| 1 | `name` + `description` from every skill | Always (at startup) | Permanent |
| 2 | SKILL.md body | When the skill triggers | Per-conversation |
| 3 | Files in `references/`, `scripts/`, `assets/` | On demand, only the ones Claude reads | Only when read |

**Implication:** SKILL.md every token competes with conversation history. Reference files are essentially free until Claude opens them.

## When to keep everything in SKILL.md

Single-file SKILL.md is fine when:
- Total content stays under ~200 lines comfortably
- The skill has one cohesive workflow with no branching
- There are no large reference materials (long API tables, multiple schemas, deep examples)

## When to split into references

Move content out of SKILL.md when:
- Body approaches 500 lines (hard limit for performance)
- The skill covers multiple domains or modes (split by domain)
- Some sections only apply to specific subtasks (conditional disclosure)
- Reference material is long but consulted infrequently

## Pattern 1: High-level guide with references

SKILL.md is a short overview that links out.

```
pdf/
├── SKILL.md            # Quick start + links
├── forms.md            # Form-filling guide
├── reference.md        # API reference
└── examples.md         # Usage examples
```

SKILL.md body:
```markdown
## Quick start

```python
import pdfplumber
with pdfplumber.open("file.pdf") as pdf:
    text = pdf.pages[0].extract_text()
```

## Features
- **Form filling**: see [forms.md](forms.md)
- **API reference**: see [reference.md](reference.md)
- **Examples**: see [examples.md](examples.md)
```

Claude loads `forms.md` only when the user asks about forms.

## Pattern 2: Domain-based organization

For skills that span several domains, split by domain so Claude only loads what's relevant.

```
bigquery-skill/
├── SKILL.md
└── reference/
    ├── finance.md     # revenue, billing
    ├── sales.md       # pipeline, opportunities
    ├── product.md     # API usage, features
    └── marketing.md   # campaigns, attribution
```

SKILL.md points Claude to the right file:
```markdown
## Available datasets
- **Finance**: revenue, ARR → [reference/finance.md](reference/finance.md)
- **Sales**: pipeline, accounts → [reference/sales.md](reference/sales.md)
```

## Pattern 3: Conditional details

Show common path inline; link to specialized paths.

```markdown
## Editing documents

For simple text edits, modify the XML directly.

**For tracked changes**: see [redlining.md](redlining.md)
**For OOXML internals**: see [ooxml.md](ooxml.md)
```

## Keep references one level deep

All reference files must link directly from SKILL.md. When references are nested (SKILL.md → A.md → B.md), Claude may use `head` to preview B.md instead of reading it fully, causing missing information.

| | Example |
|---|---|
| ✅ Good | SKILL.md → `references/forms.md`, SKILL.md → `references/api.md` |
| ❌ Bad | SKILL.md → `advanced.md` → `details.md` |

## Table of contents for long references

For any reference file longer than ~100 lines, include a TOC at the top. This protects against partial reads.

```markdown
# API Reference

## Contents
- Authentication and setup
- Core methods (CRUD)
- Batch operations
- Error handling
- Examples

## Authentication and setup
...
```

## Folder name: `reference/` vs `references/`

Both are valid — there is no functional difference. Anthropic's official examples mix conventions: some keep files directly at the skill root (e.g. `forms.md`, `reference.md`), others group them under a `reference/` (singular) subfolder. Pick one convention and stay consistent within a single skill.

## File naming inside references

Use descriptive names that match content:
- ✅ `form_validation_rules.md`, `auth_flow.md`, `revenue_schema.md`
- ❌ `doc2.md`, `file1.md`, `notes.md`

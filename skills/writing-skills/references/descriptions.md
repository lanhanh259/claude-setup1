# Writing effective descriptions

The `description` field is how Claude decides whether to load your skill from among potentially 100+ available skills. Get this wrong and the skill never triggers — or triggers constantly.

## Contents
- Hard rules from the spec
- Third person, always
- Structure: what + when + optional negative trigger
- Good and bad examples
- Common mistakes

## Hard rules from the spec

- Must be **non-empty**
- Maximum **1024 characters**
- **No XML tags** (`< >`)
- Loaded into the system prompt at all times — every token has a permanent cost

## Third person, always

The description is injected into the system prompt. Inconsistent point-of-view causes discovery problems.

| | Example |
|---|---|
| ✅ Good | `"Processes Excel files and generates reports"` |
| ❌ First person | `"I can help you process Excel files"` |
| ❌ Second person | `"You can use this to process Excel files"` |

## Structure

```
[What the skill does, in third person]
 + [Specific triggers for when to use it]
 + [Optional: negative triggers — when NOT to use it]
```

The "when" half is more important than the "what" half. Claude already understands capabilities; what it needs to know is **discovery cues** — exact phrases or contexts that should activate the skill.

## Good examples

```yaml
description: Extracts text and tables from PDF files, fills forms, merges documents.
  Use when working with PDF files or when the user mentions PDFs, forms, or document extraction.
```

```yaml
description: Analyzes Excel spreadsheets, creates pivot tables, generates charts.
  Use when analyzing Excel files, spreadsheets, tabular data, or .xlsx files.
```

```yaml
description: Generates descriptive commit messages by analyzing git diffs.
  Use when the user asks for help writing commit messages or reviewing staged changes.
```

```yaml
description: Guides the creation of well-structured Claude Agent Skills following
  Anthropic's official specification. Use when the user asks to write, create, build,
  review, or improve a skill. Do NOT use for general coding tasks unrelated to skill authoring.
```

## Bad examples

```yaml
description: Helps with documents              # Too vague — no triggers
description: Processes data                    # Missing what AND when
description: Does stuff with files             # Useless
description: I can help process files          # Wrong POV
description: <tool>file processor</tool>       # Contains XML tags (rejected)
```

## Common mistakes

### Overusing trigger phrases
Adding too many user-phrase examples bloats the description without improving discovery. Three to five strong triggers beat ten weak ones.

### Forgetting negative triggers
If a skill could plausibly activate on unrelated tasks, add `Do NOT use for X`. Example:

```yaml
description: Reviews and refactors Python code for performance. Use when the user asks
  for code review, optimization, or profiling of Python. Do NOT use for general Q&A
  about Python syntax or for code in other languages.
```

### Putting implementation details here
The description is for discovery, not implementation. Save details for the SKILL.md body.

```yaml
# Bad — implementation leakage
description: Uses pdfplumber library with the extract_text() method to pull text...

# Good — discovery-focused
description: Extracts text and tables from PDF files. Use when working with PDFs...
```

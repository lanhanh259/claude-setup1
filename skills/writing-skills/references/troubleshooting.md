# Troubleshooting

Common skill problems and how to fix them.

## Contents
- Skill never triggers
- Skill triggers too often
- Claude ignores instructions
- SKILL.md feels slow / heavy
- Claude reads partial content from references
- MCP tools not found
- File not found errors

## Skill never triggers

**Likely causes:**
- Description is too vague ("Helps with documents")
- Description doesn't include the user phrases people actually use
- Description is in first or second person

**Fix:**
1. Rewrite description in third person.
2. Add specific triggers — file types (".xlsx"), user phrases ("commit message"), domain words.
3. Include both *what* and *when*.
4. See [descriptions.md](descriptions.md) for examples.

## Skill triggers too often

**Likely causes:**
- Description is too broad — overlaps with unrelated tasks
- No negative triggers

**Fix:**
1. Narrow the scope words in the description.
2. Add `Do NOT use for X` for clear non-cases.
3. Run eval scenarios specifically targeting false positives.

## Claude ignores instructions

**Likely causes:**
- Instructions buried deep in SKILL.md
- Wording is too soft ("you can also..." or "it's good practice to...")
- File is too long — Claude is skimming

**Fix:**
1. Move critical steps near the top.
2. Use stronger language: `**CRITICAL:**`, `**MUST:**`, `**Validate immediately:**`
3. If the section is in a reference, link it more prominently from SKILL.md
4. If SKILL.md is over 400 lines, split.

## SKILL.md feels slow / heavy

**Likely cause:** body is too large; loading it eats context.

**Fix:**
1. Move detailed sections into `references/`.
2. Keep SKILL.md as a table of contents with quick start.
3. Target under 200 lines for the body where possible.
4. See [progressive-disclosure.md](progressive-disclosure.md).

## Claude reads partial content from references

**Likely cause:** nested references (SKILL.md → A.md → B.md). Claude uses `head` to preview when chasing nested links.

**Fix:**
1. Flatten — make every reference file linkable directly from SKILL.md.
2. For long reference files, add a TOC at the top so partial reads still surface the structure.

## MCP tools not found

**Likely cause:** bare tool name without server prefix.

**Fix:** Use fully qualified names: `BigQuery:bigquery_schema`, not `bigquery_schema`.

## File not found errors

**Likely cause:** Windows-style paths (`scripts\helper.py`).

**Fix:** Replace `\` with `/` everywhere. Forward slashes work on all platforms; backslashes break on Unix.

## Compatibility summary

| Symptom | Most likely cause |
|---|---|
| Never triggers | Description |
| Over-triggers | Description (too broad) |
| Skips steps | Instructions not prominent |
| Slow / heavy | SKILL.md too large |
| Incomplete reads | Nested references |
| Tool errors | MCP prefix missing |
| Path errors | Windows-style backslashes |

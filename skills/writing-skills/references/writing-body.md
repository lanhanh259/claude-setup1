# Writing the SKILL.md body

How to write the body of SKILL.md so Claude follows it reliably without wasting context.

## Contents
- Concise is the default — Claude is already smart
- Setting degrees of freedom
- Consistent terminology
- Avoid time-sensitive information
- Test across models

## Concise is the default — Claude is already smart

Only add context Claude doesn't already have. Challenge every paragraph:
- "Does Claude really need this explanation?"
- "Can I assume Claude knows this?"
- "Does this paragraph justify its token cost?"

**Concise (~50 tokens):**
````markdown
## Extract PDF text

Use pdfplumber:
```python
import pdfplumber
with pdfplumber.open("file.pdf") as pdf:
    text = pdf.pages[0].extract_text()
```
````

**Verbose (~150 tokens):**
```markdown
## Extract PDF text

PDF (Portable Document Format) files are a common file format containing text,
images, and other content. To extract text, you'll need a library. Many libraries
are available, but pdfplumber is recommended because it's easy to use...
```

The concise version assumes Claude knows what PDFs are and how libraries work — which is correct.

## Setting degrees of freedom

Match specificity to how fragile the task is.

### High freedom — text-based instructions

Use when multiple approaches are valid and decisions depend on context.

```markdown
## Code review process
1. Analyze structure and organization
2. Check for bugs and edge cases
3. Suggest readability improvements
4. Verify project conventions
```

### Medium freedom — pseudocode or parameterized scripts

Use when a preferred pattern exists but variation is acceptable.

```python
def generate_report(data, format="markdown", include_charts=True):
    # Process data
    # Output in specified format
    # Optionally include visualizations
```

### Low freedom — exact commands, no flags

Use when operations are fragile and consistency is critical.

```markdown
## Database migration

Run exactly this command:

```bash
python scripts/migrate.py --verify --backup
```

Do not modify or add flags.
```

### The analogy

Think of Claude as a robot exploring a path:
- **Narrow bridge with cliffs:** one safe way forward → low freedom, exact instructions
- **Open field:** many valid paths → high freedom, general direction

## Consistent terminology

Pick one term per concept and stick with it. Inconsistent vocabulary confuses Claude.

| Concept | Pick one |
|---|---|
| API target | "endpoint" — not "URL", "route", "path" |
| Input control | "field" — not "box", "element", "control" |
| Data retrieval | "extract" — not "pull", "get", "retrieve" |

## Avoid time-sensitive information

Skills outlive specific dates. Anything starting with "before/after [date]" or "as of [year]" will become wrong.

**Bad:**
```markdown
If you're doing this before August 2025, use the old API.
After August 2025, use the new API.
```

**Good — use an "old patterns" collapsible:**
````markdown
## Current method

Use the v2 API endpoint: `api.example.com/v2/messages`

<details>
<summary>Legacy v1 API (deprecated 2025-08)</summary>

The v1 API used: `api.example.com/v1/messages`. No longer supported.
</details>
````

## Test across models

Skills augment models, so effectiveness depends on the underlying model. Test with every model you target.

| Model | Watch for |
|---|---|
| Haiku (fast, economical) | Does the skill provide *enough* guidance? |
| Sonnet (balanced) | Is the skill clear and efficient? |
| Opus (powerful reasoning) | Is the skill *over-explaining*? |

What works perfectly for Opus may need more detail for Haiku. Aim for instructions that work across the range.

## Body length target

The official spec sets **500 lines** as the hard upper bound. The bands below are an additional recommendation, not part of the spec:

- **Under 200 lines:** comfortable; usually fine in one file *(recommended)*
- **200–500 lines:** start moving non-essential content to `references/` *(recommended)*
- **Over 500 lines:** must split — performance degrades past this *(spec)*

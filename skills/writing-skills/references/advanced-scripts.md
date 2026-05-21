# Advanced: skills with executable code

These rules apply only to skills that bundle scripts. Skip if your skill is markdown-only.

## Contents
- Solve, don't punt
- No voodoo constants
- Why provide utility scripts at all
- Execute vs read-as-reference
- Plan-validate-execute pattern
- Visual analysis
- Package dependencies and runtime
- MCP tool references
- Don't assume tools are installed

## Solve, don't punt

When writing a script, handle error conditions in the script rather than letting it crash and forcing Claude to recover.

**Good — handle errors explicitly:**
```python
def process_file(path):
    """Process a file, creating it if it doesn't exist."""
    try:
        with open(path) as f:
            return f.read()
    except FileNotFoundError:
        print(f"File {path} not found, creating default")
        with open(path, "w") as f:
            f.write("")
        return ""
    except PermissionError:
        print(f"Cannot access {path}, using default")
        return ""
```

**Bad — punt to Claude:**
```python
def process_file(path):
    return open(path).read()  # Just fail and let Claude figure it out
```

## No voodoo constants

Document why each constant has its value (Ousterhout's law). If you don't know the right value, neither will Claude.

**Good — self-documenting:**
```python
# HTTP requests typically complete within 30s
# Longer timeout accounts for slow connections
REQUEST_TIMEOUT = 30

# Three retries balances reliability vs speed
# Most intermittent failures resolve by the second retry
MAX_RETRIES = 3
```

**Bad — magic numbers:**
```python
TIMEOUT = 47  # Why 47?
RETRIES = 5   # Why 5?
```

## Why provide utility scripts at all

Claude could generate the code, but pre-made scripts win on:
- **Reliability** — fewer bugs than freshly-generated code
- **Tokens** — script contents don't enter context; only output does
- **Speed** — no code generation step
- **Consistency** — every run does the same thing

## Execute vs read-as-reference

Be explicit about which mode applies. Wrong mode = wasted tokens or wrong behavior.

| Mode | Phrasing | Use for |
|---|---|---|
| Execute | "Run `analyze_form.py` to extract fields" | Deterministic utilities — the common case |
| Read as reference | "See `analyze_form.py` for the extraction algorithm" | Complex logic Claude needs to understand or adapt |

## Plan-validate-execute pattern

For batch operations, destructive changes, or high-stakes work, insert a validated intermediate step.

**Workflow becomes:** analyze → **create plan file** → **validate plan** → execute → verify.

Example: updating 50 form fields based on a spreadsheet. Without validation Claude might reference non-existent fields, create conflicts, or miss required fields.

```markdown
1. Analyze form: `python scripts/analyze_form.py input.pdf` → `fields.json`
2. Create plan: edit `fields.json` to add target values → `changes.json`
3. **Validate plan**: `python scripts/validate_changes.py changes.json fields.json`
4. If validation fails, fix `changes.json` and re-validate
5. Execute: `python scripts/apply_changes.py input.pdf changes.json output.pdf`
6. Verify: `python scripts/verify_output.py output.pdf`
```

**Why this works:**
- Validation catches errors before any changes are applied
- Machine-verifiable, not relying on Claude's judgment
- Plan iteration is cheap — original is never touched
- Errors point to specific problems

**Make validation messages specific:**
```
# Good
Field 'signature_date' not found. Available fields: customer_name, order_total, signature_date_signed

# Bad
Validation failed
```

## Visual analysis

For inputs that can be rendered as images (PDFs, forms, charts), use vision instead of fragile parsing.

```markdown
## Form layout analysis

1. Convert PDF to images:
   ```bash
   python scripts/pdf_to_images.py form.pdf
   ```
2. Analyze each page image to identify field locations and types
```

## Package dependencies and runtime

Skills run in different runtimes with different constraints:

| Environment | Network | Package install |
|---|---|---|
| claude.ai | Yes | npm, PyPI, GitHub |
| Claude API code execution | No | No runtime install — pre-configured packages only |
| Claude Code *(not in official best-practices doc — observed)* | Yes | Prefer local install over global |

**Always:**
- List required packages explicitly in SKILL.md
- Verify packages are available in the target runtime

## MCP tool references

Always use fully qualified MCP tool names: `ServerName:tool_name`. Without the prefix, Claude may fail to locate the tool when multiple MCP servers are connected.

```markdown
Use the BigQuery:bigquery_schema tool to retrieve table schemas.
Use the GitHub:create_issue tool to file issues.
```

## Don't assume tools are installed

Be explicit about dependencies.

**Bad:**
```
Use the pdf library to process the file.
```

**Good:**
````markdown
Install required package:
```bash
pip install pypdf
```

Then use it:
```python
from pypdf import PdfReader
reader = PdfReader("file.pdf")
```
````

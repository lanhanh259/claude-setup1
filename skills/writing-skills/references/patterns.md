# Common patterns

Reusable structures for common skill-authoring needs.

## Contents
- Template pattern
- Examples pattern (input/output pairs)
- Conditional workflow pattern

## Template pattern

Provide a template for output format. Match strictness to your needs.

### Strict template (when format matters — API responses, data formats)

````markdown
## Report structure

ALWAYS use this exact template:

```markdown
# [Analysis Title]

## Executive summary
[One-paragraph overview]

## Key findings
- Finding 1 with supporting data
- Finding 2 with supporting data

## Recommendations
1. Specific actionable recommendation
```
````

### Flexible template (when adaptation helps)

````markdown
## Report structure

Sensible default, but use judgment based on the analysis:

```markdown
# [Title]

## Executive summary
[Overview]

## Key findings
[Adapt sections based on what you discover]

## Recommendations
[Tailor to context]
```

Adjust sections as needed.
````

## Examples pattern (input/output pairs)

When output quality depends on style, examples beat descriptions.

````markdown
## Commit message format

Follow these examples:

**Example 1:**
Input: Added user authentication with JWT tokens
Output:
```
feat(auth): implement JWT-based authentication

Add login endpoint and token validation middleware
```

**Example 2:**
Input: Fixed bug where dates displayed incorrectly in reports
Output:
```
fix(reports): correct date formatting in timezone conversion

Use UTC timestamps consistently across report generation
```

Style: `type(scope): brief description` then detailed explanation.
````

*Rule of thumb (not in spec):* three to five examples is usually enough — diminishing returns past five.

## Conditional workflow pattern

Guide Claude through decision points at the start of a task.

```markdown
## Document modification workflow

1. Determine the modification type:
   - **Creating new content?** → Creation workflow below
   - **Editing existing content?** → Editing workflow below

### Creation workflow
1. Use docx-js
2. Build from scratch
3. Export to .docx

### Editing workflow
1. Unpack existing document
2. Modify XML directly
3. Validate after each change
4. Repack
```

If branches grow too large, move each into its own reference file:

```markdown
## Document modification workflow

- **Creating new content?** → see [creation.md](creation.md)
- **Editing existing content?** → see [editing.md](editing.md)
```

## When to use which pattern

| Need | Pattern |
|---|---|
| Output must match exact format | Strict template |
| Output should follow a style but adapt | Flexible template + examples |
| Style is hard to describe | Examples pattern |
| Task forks based on input type | Conditional workflow |
| Multi-step process with order dependencies | Workflow + checklist (see workflows-and-loops.md) |

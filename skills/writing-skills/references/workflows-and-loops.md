# Workflows and feedback loops

For multi-step tasks, structure prevents Claude from skipping steps. For quality-critical tasks, validation loops catch errors before they propagate.

## Contents
- When to use a workflow
- Checklist pattern
- Feedback loop pattern (validate → fix → repeat)
- Example: skill without code
- Example: skill with code

## When to use a workflow

Use a workflow when the task is:
- Multi-step with order dependencies
- Has validation/verification steps that must not be skipped
- Has branching based on input type

If the task is one or two steps with no fragility, skip the workflow ceremony and just describe it.

## Checklist pattern

For complex workflows, give Claude a checklist to copy into its response and check off as it progresses. This visible state prevents skipping.

```markdown
## Research synthesis workflow

Copy this checklist and track progress:

- [ ] Step 1: Read all source documents
- [ ] Step 2: Identify key themes
- [ ] Step 3: Cross-reference claims
- [ ] Step 4: Create structured summary
- [ ] Step 5: Verify citations

**Step 1: Read all source documents**
Review each file in `sources/`. Note main arguments and evidence.

**Step 2: Identify key themes**
Look for patterns across sources. Where do they agree or disagree?

...
```

## Feedback loop pattern

The most powerful quality-improvement pattern: **run validator → fix errors → repeat until clean.**

The validator can be a script, a reference document, or a checklist. The structure is the same.

### Example: validator is a reference document

```markdown
## Content review process

1. Draft content following [style-guide.md](style-guide.md)
2. Review against the checklist:
   - Terminology consistency
   - Example format
   - Required sections present
3. If issues found:
   - Note each issue with section reference
   - Revise
   - Review again
4. **Only proceed when all requirements pass**
5. Finalize and save
```

### Example: validator is a script

```markdown
## Document editing process

1. Make edits to `word/document.xml`
2. **Validate immediately**: `python scripts/validate.py unpacked_dir/`
3. If validation fails:
   - Read the error message
   - Fix the XML
   - Run validation again
4. **Only proceed when validation passes**
5. Rebuild: `python scripts/pack.py unpacked_dir/ output.docx`
6. Test the output
```

## Making validation prominent

If Claude keeps skipping validation, the instruction isn't prominent enough. Strengthen it:

| Weak | Strong |
|---|---|
| `Run validation` | `**Validate immediately:** ...` |
| `Don't forget to validate` | `**CRITICAL: Validation must pass before proceeding.**` |
| `Check the output` | `**Verify each item against the checklist before continuing.**` |

## Branching workflows

For workflows that fork based on input, make the decision explicit at the top:

```markdown
## Document modification workflow

**First, determine the modification type:**

- Creating new content? → Use the **Creation workflow** below
- Editing existing content? → Use the **Editing workflow** below

### Creation workflow
1. Use docx-js library
2. Build from scratch
3. Export to .docx

### Editing workflow
1. Unpack the existing document
2. Modify XML directly
3. Validate after each change
4. Repack
```

If branches grow large, push each into its own reference file.

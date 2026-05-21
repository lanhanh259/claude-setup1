# Evaluation and iteration

How to validate a skill before publishing, and how to refine it over time.

## Contents
- Build evaluations BEFORE writing the skill
- Evaluation structure
- The Claude A / Claude B iteration pattern
- Observing how Claude navigates the skill
- Gathering team feedback

## Build evaluations BEFORE writing the skill

Counterintuitive but correct: write the evals first. This ensures the skill solves real problems, not imagined ones.

**Process:**
1. **Identify gaps.** Run Claude on representative tasks *without* the skill. Document specific failures or missing context.
2. **Create evaluations.** Build at least 3 scenarios targeting those gaps. Include positive cases, negative cases (skill should NOT trigger), and ambiguous edges.
3. **Establish baseline.** Measure Claude's performance without the skill.
4. **Write the minimum.** Create only enough content to close the gaps and pass the evals.
5. **Iterate.** Run the evals, compare against baseline, refine.

This avoids over-engineering and ensures every section of the skill earns its tokens.

## Evaluation structure

```json
{
  "skills": ["pdf-processing"],
  "query": "Extract all text from this PDF and save to output.txt",
  "files": ["test-files/document.pdf"],
  "expected_behavior": [
    "Reads the PDF using an appropriate library",
    "Extracts text from all pages — no skipped pages",
    "Saves output to output.txt in readable format"
  ]
}
```

There is no built-in runner for these; you create your own. The point is to have an objective rubric, not just gut feel.

**Coverage targets** *(recommendation — the spec only requires "at least three scenarios")*:
- 3+ positive cases (skill should trigger)
- 2+ negative cases (skill should NOT trigger — guards against over-triggering)
- 1+ ambiguous case (tests description precision)

## The Claude A / Claude B iteration pattern

The most effective skill-development pattern:

- **Claude A** = the instance you collaborate with to write and refine the skill
- **Claude B** = a fresh instance with the skill loaded, used to test it

This works because Claude understands both how to write effective agent instructions and what information agents need.

### Creating a new skill

1. **Complete a task without a skill.** Work through a problem with Claude A using normal prompting. Notice the context you keep providing.
2. **Identify the reusable pattern.** What information would be useful for similar future tasks?
3. **Ask Claude A to draft the skill.** "Create a skill that captures this pattern."
4. **Review for conciseness.** "Remove the explanation about X — Claude already knows that."
5. **Improve information architecture.** "Move the table schema to a separate reference file."
6. **Test with Claude B.** A fresh instance with the skill loaded.
7. **Iterate based on observation**, not assumptions.

### Iterating on existing skills

Continue the same cycle:

1. **Use the skill on real workflows** (not synthetic tests).
2. **Observe where Claude B struggles or makes unexpected choices.**
3. **Return to Claude A with specifics.** Example: "Claude B forgot to filter test accounts. The skill mentions it, but maybe not prominently enough?"
4. **Apply Claude A's refinements** — often: reorganize, use stronger language ("MUST" not "always"), restructure prominent sections.
5. **Test again with Claude B** on similar requests.
6. **Repeat** as new scenarios appear.

## Observing how Claude navigates the skill

Pay attention to patterns when Claude uses the skill:

| Observation | What it means |
|---|---|
| Reads files in unexpected order | Structure isn't intuitive — reorganize |
| Fails to follow references | Links aren't prominent enough |
| Keeps re-reading the same reference | That content should be in SKILL.md instead |
| Never reads a bundled file | File is unnecessary or poorly signaled |

The `name` and `description` are particularly load-bearing. Most discovery problems trace back to one of them.

## Gathering team feedback

1. Share the skill with teammates and observe usage.
2. Ask:
   - Does the skill activate when expected?
   - Are instructions clear?
   - What's missing?
3. Incorporate feedback — your usage patterns have blind spots.

## Test with the models you target

Don't ship a skill tested only on Opus if it'll be used with Haiku. Run the eval set on each target model. Skills that assume too much fail on smaller models.

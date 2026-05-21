---
name: comparing-implementations
description: Compares two parallel implementations of the same concept (component, module, feature) side-by-side from a senior developer perspective. Classifies the object type first, then applies weighted criteria appropriate to it. Use when the user wants to evaluate two existing versions and decide which to keep, e.g. "so sánh bảng giá cũ và mới", "compare X v1 vs v2", "which implementation is better", "đánh giá 2 phiên bản A vs B". Do NOT use for reviewing uncommitted changes (use reviewing-code) or for reviewing a PR (use review). Do NOT use when one version does not yet exist — that is a design task, not a comparison. Do NOT use when the user has 3 or more versions — ask them to narrow to 2 first.
---

# Comparing parallel implementations

Compares two **existing** implementations of the same concept side-by-side as a senior reviewer would: classify the object type, weight criteria accordingly, gather evidence with file:line citations, and produce a verdict.

This is NOT a diff review. Both versions must already exist in the codebase.

## Workflow

Work through these steps in order. Do not print the checklist in the response:

- [ ] Step 1 — Identify the pair
- [ ] Step 2 — Classify the object type
- [ ] Step 3 — Pick the criteria preset and add domain-specific criteria
- [ ] Step 4 — Gather evidence by reading both implementations
- [ ] Step 5 — Score each criterion with verdict + evidence
- [ ] Step 6 — Write the comparison report

### Step 1 — Identify the pair

The user usually says "compare X old vs new" without paths. Locate both versions:

1. If GitNexus is available in this repo, run `gitnexus_query({query: "<concept>"})` to find candidate symbols / files.
2. If GitNexus is unavailable, fall back to Glob + Grep on the concept name.
3. **Always confirm the pair with the user before reading code.** Display the two candidates as `A (old): <path>` / `B (new): <path>` and ask "is this the correct pair?". Do not proceed on assumption.
4. If the user provides paths or symbol names directly, skip search but still echo the pair back for confirmation.

**Never compare 3+ versions in one report.** If the user has 3 candidates, ask them to narrow to 2 first.

### Step 2 — Classify the object type

Read the entry point of each implementation (the main exported symbol). Classify into ONE of:

- **UI component** — renders to DOM, has props, manages presentation
- **Store / state** — holds and mutates application state (Zustand, Redux, context)
- **Data layer** — fetches or persists data (API client, query hook, repository)
- **Business logic** — pure computation, transformation, calculation
- **Background / async** — worker, queue handler, scheduler

If the object spans two types (e.g. a hook that also manages state), pick the dominant one and note the secondary type in the report.

### Step 3 — Pick the criteria preset and add domain-specific criteria

Each object type has a preset of weighted criteria. See [references/criteria_presets.md](references/criteria_presets.md).

**Critical:** the preset is the starting point, not the final list. Inspect what the object actually does and **add domain-specific criteria** the preset cannot anticipate.

Example — a price table is a UI component, but its real concerns include:
- Color flicker on tick updates
- Sort stability under real-time data
- Scroll position preservation on data refresh
- Number formatting precision

A login form is also a UI component, but its real concerns are:
- Validation timing (on-blur vs on-submit)
- Error message accessibility
- Submit button state during async

The domain-specific criteria are usually where the actual quality difference lives. Surface them.

### Step 4 — Gather evidence

Read both implementations fully. Take notes per criterion. **Every note must include `file:line` references.**

Evidence note template:

```
Criterion: Re-render scope
A (old): src/oldTable.tsx:42 — entire table re-renders on any cell update (no memo)
B (new): src/newTable.tsx:38 — cell-level memo via React.memo + useShallow on store slice
```

If evidence cannot be determined from static code (e.g. runtime behavior, network conditions), write `Cannot determine from code` for that criterion. Do not guess.

### Step 5 — Score each criterion

Verdict scheme: 3 ordinal values — `A Better` / `Same` / `B Better` — plus `Cannot compare` as an explicit fallback when evidence is missing on one side.

Do not use numeric scores (1–10) — they signal false precision.

**Mandatory evidence rules:**

| Claim type | Rule |
|---|---|
| Performance | Mark as `structural (not benchmarked)` — code was read, nothing was measured |
| Maintainability / DX | Cite concrete reasoning (e.g. "Props API has 12 required fields vs 4") |
| Reliability | Cite the actual failure path (e.g. "Throws on `null` at file.ts:47 — no fallback") |
| Any verdict | Must include `file:line` citations on both sides |

If a criterion has no evidence on one side, the verdict is `Cannot compare`, not a default win for the other side.

### Step 6 — Write the comparison report

Use this output structure:

```markdown
# Comparison: <name>

## Verdict
- **Recommended:** A / B / depends on context
- **When to prefer A:** ...
- **When to prefer B:** ...

## Object classification
- **Primary type:** <UI component | Store | Data layer | Business logic | Background>
- **Secondary type (if applicable):** <e.g. "also a hook that owns local state">
- **Domain context:** <e.g. real-time price table with 100+ rows updated via WebSocket>

## Criteria and verdicts

| Criterion | Group | Verdict | Evidence (A / B) |
|---|---|---|---|
| Re-render scope | Performance (structural) | B Better | A: oldTable.tsx:42 — entire table re-renders on any cell update (no memo) / B: newTable.tsx:38 — cell-level `React.memo` + `useShallow` slice |
| Subscription granularity | Performance (structural) | B Better | A: oldTable.tsx:12 subscribes to whole store / B: newTable.tsx:14 selects only `rows` slice |
| Empty state UX | Reliability | A Better | A: oldTable.tsx:120 renders explicit "No data" panel / B: newTable.tsx:88 returns `null` — blank screen |
| Props API stability | Architecture | Same | Both expose 5 required props with matching shapes (oldTable.tsx:8 / newTable.tsx:8) |
| Color flicker on tick | Domain-specific | Cannot compare | Cannot determine from static code — needs runtime verification with live WebSocket feed |

## Trade-offs worth flagging
- B is faster on re-render, but its cell renderer is hardcoded at newTable.tsx:91, making column extension harder than A's slot-based approach (oldTable.tsx:60).
- A has better empty-state UX but pays for it with a full re-render on every tick.

## Unknowns
- Color flicker behavior — cannot determine from static code, needs runtime verification.
```

Do not include a **Migration notes** section unless the user explicitly asks for one, or unless the project clearly intends to replace one version with the other (e.g. file is named `*.deprecated.*`, or a comment marks it as legacy).

## Language and terminology

Write the report in Vietnamese. For technical terms, follow this rule:

- **First occurrence:** English term followed by Vietnamese translation in parentheses — e.g. *re-render scope* (phạm vi render lại), *subscription granularity* (độ chi tiết đăng ký).
- **Subsequent occurrences:** English term only, no repeated parenthetical.

Never translate code identifiers, file names, or `file:line` references.

## When NOT to use this skill

| Situation | Use instead |
|---|---|
| Comparing 3+ versions | Ask user to narrow to 2 first |
| Comparing libraries from npm or third-party SDKs | Out of scope — this skill is for in-repo code only |

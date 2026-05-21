# Criteria presets by object type

For each object type, a preset of weighted criteria. Weight is a priority hint, not strict math — it tells which criteria should dominate the final verdict when the two sides trade off.

> **Performance criteria are structural, not benchmarked.** Every verdict on "Heavy weight — performance" items (re-render scope, memoization, subscription granularity, virtualization, update granularity, derived state caching, retry/backoff, concurrency model, algorithmic complexity, etc.) is derived from reading code — no measurement was taken. Always label them `Performance (structural)` in the report, and never claim "X is faster" without a runtime benchmark.

## Contents
- UI component
- Store / state
- Data layer
- Business logic
- Background / async
- Cross-cutting criteria (always considered)

## UI component

Examples: tables, forms, modals, charts, lists.

**Heavy weight — performance dominates for interactive components:**
- Re-render scope — entire tree, or only the changed subtree?
- Memoization strategy — `React.memo`, `useMemo`, `useCallback`, `useShallow` placed where they matter?
- Subscription granularity — store slice scope vs. whole-store subscribe
- Virtualization — for >50 items, is windowing used (`react-window` or equivalent)?

**Medium weight — architecture and maintainability:**
- Separation of concerns — data fetching, formatting, rendering, business logic each isolated?
- Component composition — row / cell / header reusable independently?
- Business logic location — in the component, or in a selector / util?
- Props API stability — adding features without breaking existing callers?

**Lower weight unless critical:**
- Type safety — props typed precisely, or `any` leaks?
- Test-ability — can it render with mock data in a unit test?

**Reliability (narrow scope for UI):**
- Loading state — present and consistent across edge conditions?
- Empty state — handled explicitly with intentional UX, not blank screen?
- Error boundary — partial failure isolated, or one broken row crashes the tree?
- Null / missing data fallback — explicit fallback values, not crash on undefined?

## Store / state

Examples: Zustand store, Redux slice, React Context, MobX store.

**Heavy weight — state shape determines everything downstream:**
- Update granularity — does a single-field update trigger all subscribers, or only the affected slice?
- Derived state caching — computed values memoized, or recomputed on every read?
- Selector pattern — selectors return stable references (preventing downstream re-renders)?
- Action surface — single action with payload union vs. many narrow actions?

**Medium weight:**
- Mutability model — immer / structural copy vs. manual spread (consistency, correctness)?
- State normalization — entities normalized by ID, or nested with duplication?
- Initialization and hydration — clean lifecycle, no race on first render?

**Reliability:**
- Race conditions — concurrent updates, optimistic mutations handled?
- Persistence — what is saved, when, and how is corruption recovered?

**DX:**
- DevTools integration — Redux DevTools or equivalent attached?
- Time-travel debugging — supported by the store type?

## Data layer

Examples: API client, query hook (TanStack Query, SWR), repository, GraphQL resolver.

**Heavy weight — reliability dominates for data:**
- Error handling — typed errors vs. swallowed exceptions vs. generic catch?
- Retry and backoff — present, bounded, and only for retriable failures?
- Cancellation — in-flight requests cancelled on unmount or query change?
- Cache invalidation — explicit triggers, time-based TTL, or none?

**Medium weight:**
- Type safety end-to-end — request and response shapes typed, not `any`?
- Request deduplication — concurrent identical requests merged into one?
- Stale-while-revalidate — present and tunable?

**Architecture:**
- Auth handling — centralized (interceptor) or scattered across callsites?
- Logging and observability — instrumented at the right hooks (request, response, error)?

## Business logic

Examples: utility functions, calculation engines, validators, transformers.

**Heavy weight — correctness dominates pure functions:**
- Edge case coverage — empty input, nulls, boundary values, large input?
- Numerical precision — float rounding, integer overflow, currency rules?
- Determinism — same input produces same output, no hidden side effects?
- Pure-vs-impure separation — IO isolated from logic?

**Medium weight:**
- Test coverage — unit tests exist and cover the edge cases?
- Algorithmic complexity — O(n²) where O(n log n) is achievable?

**DX:**
- Function signature clarity — inputs and outputs unambiguous?
- Error signaling — exceptions, result types, or nullable returns? Consistent?

## Background / async

Examples: web worker, queue handler, scheduler, cron task.

**Heavy weight — reliability dominates background work:**
- Failure recovery — retries, dead-letter queue, idempotency keys?
- Concurrency model — serial, parallel-bounded, or unbounded (risk)?
- Resource cleanup — connections, timers, subscriptions all disposed?
- Backpressure — what happens when work arrives faster than processing?

**Medium weight:**
- Observability — logging, metrics, traces emitted at meaningful checkpoints?
- Cancellation — graceful shutdown supported on SIGTERM or similar?

## Cross-cutting criteria (always considered, lower weight)

These apply across all object types — include only if they materially differ:

- Naming clarity — symbol names communicate intent without needing comments?
- File and module organization — related code colocated, unrelated separated?
- Comments — present only where genuinely needed, not narrating obvious code?
- Dependency footprint — new third-party deps justified, or could existing deps cover it?
- Bundle size impact — only relevant for client-side code shipped to browser?

# Debugging

An error message names the line where a failure showed up, not the code that caused it. Agents that edit that line produce fixes that pass once and fail again somewhere else. The method below forces the trace back to the origin.

Contents: the method, symptom-fix tells, when the fix does not work, environment checks, flaky behavior, the debug report.

## The method

**1. Understand the path.** Read the code path from entry point to failure site. Look at a passing case first so you know what normal looks like. Debugging something you do not understand is guessing.

**2. Make it fail.** Get a deterministic reproduction and record the exact command and output: a failing test, a script, a `curl`, a minimal input. You cannot fix what you have not seen fail.
- If the failure is intermittent, find what varies (data, ordering, time, concurrency, environment) and add temporary logging to catch it.
- If you cannot reproduce it, say so and ask the user for logs, input or steps. Do not "fix" a failure you have not observed.

**3. Look, do not guess.** Trace backward from the failure: who produced this bad value? Observe actual values with logs, a debugger, or assertions at the boundaries between components. Bisect to narrow the search: `git bisect`, a smaller input, disabling half the code. Remove temporary instrumentation afterwards.

**4. State the hypothesis in one line.** "X fails because Y, which originates in Z." Predict what you would observe if it is true, then check. A hypothesis you did not test is still a guess.

**5. Change one thing at a time.** If a change does not alter the failure, revert it before trying the next idea. Stacked speculative changes make it impossible to know what worked, and they leave junk behind.

**6. Fix the cause.** Ask: "After this fix, can the same bad state still reach the user by another path?" If yes, it is a symptom fix. Grep for sibling call sites with the same flaw before deciding the fix is complete.

Tracing often exposes a second, latent defect of the same kind (a function that returns `None` on invalid input instead of failing, a missing validation). Fix the cause of the reported failure. Do not widen the diff to repair the latent one, especially if that changes a function's contract. Name it in the report under "Perlu keputusanmu" and let the user decide.

**7. Prove it.** Run the original reproduction and see it pass. Add a regression test that fails without the fix (revert the fix temporarily to confirm). Run the neighbors.

## Symptom-fix tells

If your change looks like one of these, stop and return to step 3.

- A `try/catch` that returns a default, `None`, `null`, or an empty list
- `?.`, `|| ''`, `?? 0`, `.get(x, {})` added to silence a null that should never occur
- An early `return` when a value is missing, with no reason it can legitimately be missing
- Widening a type, `any`, `as unknown as`, `# type: ignore`, `@ts-ignore`, `unwrap_or_default()` to quiet the compiler
- A `sleep`, retry or longer timeout added to cure a race
- Skipping, `xfail`ing, or loosening the test that exposed the bug
- Special-casing the exact input that failed
- Catching the generic `Exception` / `Error`
- Fixing one call site while five others share the flaw

A null or error is legitimately expected only at a system boundary: user input, network responses, optional database columns, files. Handle it there, explicitly, with behavior the user can see. Everywhere else, a null means a bug upstream.

Compiler and linter errors are information. Fix what they point at. A suppression is acceptable only with a comment stating why it is correct.

## When the fix does not work

- After two failed attempts: stop editing. Re-read the code path, re-check your hypothesis against fresh observations, and return to step 3. Do not stack workarounds.
- After three: tell the user what you observed, what you ruled out, and what information or access you need. A clear "I do not know yet, here is what I have eliminated" is better than a fourth guess.
- If a fix makes tests pass but you cannot explain why the bug happened, it is not a fix yet.

## Environment checks

Many "bugs" are not in the code. Check these before changing logic:

- Right working directory, right branch, right binary (`which`, `--version`)
- Dependencies match the lockfile; install is complete
- Stale build output, stale cache, a dev server still running old code
- Environment variables, config files, feature flags
- The test is running the code you edited, not an installed copy

## Flaky behavior

Find the source of nondeterminism: shared state, ordering, real time, randomness, network, concurrency. Make it deterministic (inject the clock, seed the randomness, isolate state). Adding retries or sleeps hides a flaky test without fixing it.

## The debug report

When the task was a bug, the report states the cause, not just the change:

```
Penyebab: <1-3 sentences: what went wrong and where it originated>
Bukti: <the observation that confirmed it: log line, failing test, value>
Perbaikan: <what changed, and why it removes the cause>
Verifikasi: <repro command -> result; regression test -> fails before, passes after>
```

If the cause is uncertain, say which part is confirmed and which part is inferred.

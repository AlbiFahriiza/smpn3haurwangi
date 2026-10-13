# Verification

Agents stop when the work looks finished. Looking finished and being finished are different, and the gap between them is where untested code ships. The rule: a task is done only when a check that could have failed has passed, and you have read its output.

Contents: what counts as evidence, writing tests, test integrity, the final run, diff review, reporting honestly, when you cannot run anything.

## What counts as evidence

Not evidence:
- "The code looks right" or "I reasoned through it"
- It compiles, or the linter is quiet (necessary, not sufficient)
- Tests passed, but none of them execute the code you changed
- Tests you just wrote against your own implementation, never seen failing
- Exit code 0 with "0 tests collected", or with skipped tests
- Output from a stale build or an old dev server

Evidence:
- A test that failed before the change and passes after it
- The original reproduction, rerun, now behaving correctly
- Command output you read: typecheck, lint, build, test, with counts
- A rendered page you looked at and interacted with
- A script run with real input and with bad input

## Writing tests

- For a bug: write the test first, run it, and confirm it fails for the right reason (the failure message matches the bug). Then fix, then watch it pass.
- Test behavior through the public interface, not the implementation. A test that mirrors the code proves only that the code equals itself.
- Cover the cases agents skip: empty, null or None, zero, one, maximum, duplicates, unicode, invalid input, and the failure path, not only the happy path.
- For validated input, test the boundaries, not only the middle: minimum valid, a normal value, maximum valid, just below the minimum, just above the maximum, malformed, empty, repeated. For a duration flag with a 30 minute to 72 hour range: `30m` and `72h` pass; `29m` and `73h` fail.
- No tautologies (`expect(f(x)).toBe(f(x))`), no assertions on mocks you configured yourself, no mocking the unit under test.
- Deterministic by default: no real network, real clock or unseeded randomness.
- Use the project's test framework, file layout and naming. Do not introduce a new framework.
- Do not test what the framework or language already guarantees.
- Self-check: temporarily break the code or revert the fix. If the test still passes, it tests nothing.

## Test integrity

These moves make a check go green without making the code correct. Never do them:

- Delete, skip or `xfail` a failing test
- Loosen an assertion, widen a tolerance, or change an expected value to match buggy output
- Hardcode return values for the inputs the tests use
- Edit test config, fixtures or CI to avoid the failing path
- Add retries or sleeps so a flaky failure stops appearing

If a test looks wrong, or two tests contradict each other, or the spec and the test disagree: stop, show the user the conflict, and let them decide. A test is only changed when you can demonstrate it is wrong, and then you say so in the report.

## The final run

Before reporting:

1. Run the targeted tests for the change.
2. Run the broader suite, typecheck, lint and build as the project defines them.
3. Compare with the baseline you took before editing. Separate new failures (yours, fix them) from pre-existing ones (report them, do not hide them).
4. Confirm you ran current code: rebuild, restart, clear caches.

## Diff review

Run `git status --short` and `git diff --check` (whitespace errors, conflict markers), re-read the final files, then read `git diff` line by line as if someone else wrote it. Ask:

- Is every hunk needed for the request? Revert the rest.
- Debug leftovers: `console.log`, `print`, `debugger`, temporary files, `.only` in tests
- Commented-out code, TODOs without an owner, narration comments
- Secrets, tokens, personal data, absolute local paths
- New dependencies or changed lockfiles you did not mean to touch
- Formatting noise: whitespace, reordered imports, renames that bury the real change
- Error paths: does each new failure surface visibly?
- Public API, schema or behavior changes that callers need to know about
- Docs or changelog entries, if the project requires them

## Reporting honestly

State what ran and what happened, in plain terms:

- "Ran `pytest tests/test_invoice.py` -> 14 passed. Full suite: 212 passed, 2 failed (both failing before my change: `test_export_pdf`, `test_locale_fallback`)."
- "Not run: browser e2e tests, they need staging credentials. Command: `npm run test:e2e`."
- "Not verified: behavior under concurrent writes. No test or harness exists for it."

Do not write "should work", "this will fix it", "all tests pass" or "verified" for anything you did not see. A report that names its own gaps is more useful than one that sounds finished.

## When you cannot run anything

No runtime, no dependencies, no network, missing credentials, a process that takes an hour: do the static work you can (read the code path, check types by inspection, trace an example by hand), then say clearly that the change is unexecuted, list exactly what is unverified, and give the user the command to run. Do not let a limitation turn into an unstated assumption.

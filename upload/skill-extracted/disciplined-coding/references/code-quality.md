# Code Quality

AI-written code tends to be fluent and wrong in specific ways: it duplicates what already exists, invents what does not, wraps simple things in structure, hides failures, and skips security basics. This file covers how to avoid each.

Contents: scope and minimalism, reuse before writing, over-engineering, naming, error handling, grounding APIs, dependencies, security, async and resources, defaults and fallbacks, examples.

## Scope and minimalism

- The request defines the scope. Everything outside it stays untouched, including code you find ugly.
- No drive-by refactors, renames, reformatting or file moves. They bury the real change and break things nobody was watching.
- Do not add options, parameters, flags, hooks or extension points for needs nobody stated.
- Do not rewrite a file to change a function. Edit in place.
- If a larger refactor is genuinely required for the request, say so first and get agreement.

## Reuse before writing

Models cannot hold a whole codebase in mind, so they re-implement helpers and import a second library for something already solved.

- Before writing a helper, grep for an existing one (`rg -i "format.*date"`, check `utils/`, `lib/`, `common/`).
- Before importing a library, check what the project already uses for that job (HTTP client, date handling, logging, validation, state).
- Copy the shape of the nearest similar code: same error handling style, same naming, same test layout.

## Over-engineering tells

Delete the idea if you catch yourself writing:

- A class where a function is enough, a factory for one product, an interface with one implementation
- A wrapper that only forwards arguments
- A config object, env var or flag with one value and one reader
- Generic parameters, plugin systems or strategy patterns for a single case
- Layers (service, manager, handler, helper) that each contain one call
- "Utility" functions used once
- Retries, caching or batching that no requirement or measurement called for

Abstract on the second or third real use, not the first imagined one.

An abstraction is justified by a real boundary: a security boundary, a storage or transport boundary, a platform-specific implementation, a stable API used by several components, or repeated behavior with shared meaning. Wanting the code to look scalable is not a boundary, and neither is fear of changing it later. The opposite error also exists: when a real boundary is there, refusing to model it is under-engineering. See `systems-design.md` for architecture-level decisions.

## Naming

- Names carry the meaning so comments do not have to: `retryDelayMs`, not `delay`; `isExpired`, not `flag`.
- Follow the repo's casing and vocabulary. Use the domain's words.
- No `data`, `info`, `temp`, `result2`, `handleStuff`, `doProcess`, `Manager`, `Helper`.

## Error handling

Catch an error only when you can do something useful with it at that spot. Otherwise let it propagate.

If you catch, do exactly one of these: handle it with behavior the caller or user can observe; rethrow with added context; or log with enough detail to act on and then fail. Never log and continue as if nothing happened.

- No empty `catch`, no `except: pass`, no `catch { return null }`.
- Catch specific error types, not the base `Exception` / `Error`.
- Validate untrusted input once, at the boundary, and fail fast with a clear message. Inside the system, trust your own types.
- Do not use exceptions for ordinary control flow.
- Errors carry what failed, with which input, and what to do about it. No bare "Something went wrong".
- Do not scatter `?.` and `?? default` to avoid thinking about whether a value can be missing. Decide: can it be missing here? If yes, handle that case on purpose. If no, let it fail where the bug is.

## Grounding APIs

Plausible-looking calls that do not exist, or exist in another version, are the most common AI error.

Verify any API you have not seen in this session:

- JS/TS: read `node_modules/<pkg>/package.json` for the version and the `.d.ts` files for signatures; check the `exports` map for import paths.
- Python: `pip show <pkg>`, then `python -c "import x; help(x.y)"` or read the source in `site-packages`.
- Go: `go doc <pkg>.<Symbol>`. Rust: the crate source or `cargo doc`. Other: the installed source.
- CLIs and tools: run `--help`. Never guess a flag.
- Frameworks: official docs for the installed version. When docs and installed code disagree, the installed code wins.

If you cannot verify, say "I could not verify X" and either ask or write the narrowest thing that works. Do not paper over it.

Prefer current, non-deprecated APIs. If the first thing that comes to mind looks old, check for the current replacement.

## Dependencies

Order of preference: standard library, then a dependency already in the project, then a new one (with the user's approval).

Before proposing a new package:

- Confirm the exact name exists on the registry and is the package you mean. Names that nearly match a famous package are a common attack.
- Check the repository link, maintainers, last release, and usage. Check for install scripts, license compatibility, and how many transitive dependencies it pulls in.
- Add it with the package manager command (`npm install`, `pip install`, `cargo add`) so the version and lockfile are real. Do not hand-write version numbers from memory.

## Security basics

These are the checks AI-generated code fails most often.

- SQL: parameterized queries only. Never build queries with string concatenation or f-strings.
- Shell: pass argument arrays; never interpolate user input into a shell string.
- Output: encode for the context (HTML, URL, SQL, shell). Avoid `innerHTML` / `dangerouslySetInnerHTML` with untrusted data.
- Secrets: from environment or a secret manager. Never in source, logs, error messages or client bundles.
- Authorization: check on the server, for every request and every resource, not only that the user is logged in.
- Crypto: use a vetted library. Passwords with argon2 or bcrypt. No homemade schemes, no MD5 or SHA-1 for security.
- Untrusted input: bound its size and type. Normalize and confine file paths (path traversal). Validate URLs you fetch (SSRF). Do not deserialize untrusted data with unsafe loaders.
- Logging: do not write raw untrusted input or personal data to logs.
- CORS: no `*` together with credentials.

## Async and resources

- Every promise is awaited or deliberately handled. No floating promises.
- Close what you open: files, connections, subscriptions, timers, listeners. Use the language's scoped construct (`with`, `using`, `defer`, `finally`).
- Watch shared mutable state and check-then-act races.
- Do not mutate arguments or global state unless that is the function's job.

## Defaults and fallbacks

- A silent fallback hides the failure that matters. If a required config value is missing, fail at startup with a clear message.
- Magic numbers and strings get a named constant only when they are reused or their meaning is unclear.
- Dead code goes. Do not leave "just in case" branches.

## Examples

Swallowed error with decorative null-safety:

```ts
// Slop
async function getUserName(id: string) {
  try {
    const user = await api.getUser(id);
    return user?.profile?.name ?? "Unknown";
  } catch (e) {
    console.log(e);
    return "Unknown";
  }
}
```

```ts
// Better: a missing user is a real, expected case; a failing API is not hidden
async function getUserName(id: string): Promise<string> {
  const user = await api.getUser(id); // throws on network or server errors
  if (!user) throw new NotFoundError(`user ${id}`);
  return user.profile.name;
}
```

Over-engineering:

```python
# Slop
class UserNameFormatterFactory:
    def create(self, style="default"):
        return UserNameFormatter(style)

class UserNameFormatter:
    def __init__(self, style): self.style = style
    def format(self, user): return f"{user.first} {user.last}"
```

```python
# Better
def display_name(user):
    return f"{user.first} {user.last}"
```

Guessing an API:

```python
# Slop: pandas has no such method; written from a plausible pattern
df.drop_missing(columns=["a"])

# Better: checked with help(pd.DataFrame.dropna) first
df.dropna(subset=["a"])
```

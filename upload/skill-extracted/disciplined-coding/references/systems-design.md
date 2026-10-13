# Systems Design

Read this for backend, network, data, concurrency, migration, deployment or compatibility work, and for any decision with real trade-offs. Most defects in this area live at boundaries and in failure paths, which is exactly where a happy-path demo never looks.

Contents: contracts and invariants, trust boundaries, failure-first questions, concurrency, idempotency and retries, network calls, resource limits, state machines, time, data model, compatibility, migrations, deployment, observability, performance, architecture size, decisions.

## Contracts and invariants

Before changing behavior, write down the contract: what enters, what exits, what must remain true, which errors are expected, what the limits are. A contract can be a CLI, an HTTP API, a file format, a protocol message, a schema, a config shape, a security boundary, or user-visible behavior.

An invariant is a property that must always hold (`expires_at > created_at`, `max_downloads >= 1`, expired items cannot be fetched). Enforce important invariants in validation, database constraints, types, state machines, authorization checks and tests. A comment is not enforcement.

## Trust boundaries

Treat everything from outside as untrusted until validated: CLI arguments, HTTP parameters, bodies, headers, query strings, filenames, file metadata, environment variables, network peers, and stored data that originated from external input.

- Client-side validation improves UX. Server-side validation enforces truth. A CLI rejecting a value does not mean the API cannot receive it.
- Knowing an object's ID is not permission to access it. A hard-to-guess URL is not authorization for a sensitive operation.
- Never trust a client-supplied size, price, role or timestamp for a decision the server owns.

## Failure-first questions

For any feature touching I/O or state, answer these and define the simplest correct behavior for each:

- What if the network dies mid-operation?
- What if the process crashes between two steps?
- What if the client retries, or two requests arrive at once?
- What if the data is malformed, huge, or stale?
- What if a dependency is down or slow?
- What if the operation partially succeeds?

## Concurrency

If two operations can overlap, assume a race. Read, check, then write is not atomic unless the mechanism guarantees it. Use a transaction, an atomic operation, a lock, a unique constraint or serialization. Test the concurrent case when the behavior matters (two claims on the last slot, expiry racing a download).

## Idempotency and retries

Requests get duplicated by client retries, timeouts, reconnects, proxies, lost responses and restarts. For important operations (create, claim, cancel, complete, charge), make it possible to tell whether the action was already applied, for example with an idempotency key or a natural unique key. Retries are bounded, use backoff, and apply only to operations that are safe to repeat. No infinite retries.

## Network calls

The network is not a reliable function call. Use explicit timeouts, cancellation, retry policy, backpressure, connection limits and error classification (retryable or not, client or server fault). Handle slow peers and partial writes.

## Resource limits

Every system should know its limits: request body size, file size, concurrent connections, concurrent jobs, metadata size, filename length, retry count, queue length. If something is intentionally unbounded, say so and understand the risk. "Unlimited" must never mean "attacker-controlled exhaustion". Stream large data through bounded buffers instead of loading it into memory. Consider rate limits for network-facing endpoints.

## State machines

When an operation has a lifecycle, model the states explicitly (`CREATED`, `READY`, `IN_PROGRESS`, `COMPLETED`, `EXPIRED`, `FAILED`, `CANCELLED`) instead of several loosely coordinated booleans. Each transition has a valid source, a valid destination, an owner and defined failure behavior. Impossible states are rejected, not tolerated.

## Time

- Use server-authoritative time for security-sensitive expiry. A client's clock never authorizes anything.
- Store UTC. Use monotonic clocks for measuring durations.
- Consider clock skew, time zones, and races right at expiry.

## Data model

Before adding a field, ask who consumes it, what behavior depends on it, how long it should exist, whether it is sensitive, and whether it can be derived instead. Do not store data because it might be useful someday. Default toward data minimization.

## Compatibility

Before changing a public CLI syntax, API field, URL, protocol message, schema or config format, identify who depends on it. Preserve the old behavior or introduce an explicit version boundary. For protocols and public APIs, answer: what changed, can old and new peers still talk, how is incompatibility detected, what is the migration path. Do not silently change wire formats that live clients use.

## Migrations

Schema changes are explicit, recorded and reversible where practical. Prefer additive changes. For a destructive migration: identify the affected data, decide the recovery strategy, verify backups, test against representative data, then execute. Never hand-edit a production schema without recording it. Migrations need the user's approval.

## Deployment

Deployments should be reproducible from versioned files. Avoid manual production changes nobody can recreate. Before a significant deploy, check: build, configuration, migrations, health checks, rollback path, logs, secrets, compatibility. Production is not a debugging environment.

## Observability and logging

For important workflows, be able to answer: did it start, did it progress, where did it fail, how long did it take, which resource was involved, was the fault client-side or server-side. Log with stable identifiers (request ID, job ID, session ID). Do not log sensitive payloads or whole request bodies by default. A few precise log lines beat a thousand noisy ones. Do not collect telemetry just because it is possible.

## Performance

Measure before optimizing: what is slow, where the time goes, how often, which resource is constrained. Optimize the measured bottleneck. No cache because caches are fast, no queue because queues scale, no CDN because CDNs are good.

## Architecture size

Start with the smallest architecture that meets current requirements. A modular monolith usually beats premature microservices. Split into a separate service only for a real reason: independent scaling, failure isolation, deployment, a different security boundary, different runtime constraints, or ownership. Otherwise keep the boundary logical rather than operational.

Do not worship simplicity either. When a real boundary exists (security, storage, transport, platform), use the abstraction that preserves correctness.

## Decisions

When several designs are plausible, compare them on correctness, complexity, operational cost, security, performance, maintainability, compatibility and reversibility. Name the dominant constraint and choose the simplest option that satisfies it. Do not optimize every axis at once.

When uncertainty is high, prefer reversible choices (config values, feature flags, additive schema changes, isolated adapters). Be most careful with the expensive ones: public protocol formats, irreversible data migrations, permanent data collection, public URL semantics.

Separate in your writing: what the code or system verifiably does (fact), what you believe but have not verified (assumption), and what you are choosing (decision). Do not present an assumption as a fact. If an assumption materially affects the design, verify it or ask.

For a non-obvious decision, record it where the project keeps such records: the decision, the reason, the alternatives considered, the trade-off.

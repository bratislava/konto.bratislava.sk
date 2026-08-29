# openapi-specs

OpenAPI documents, one per service, **committed**.

This package holds data and nothing else — no build, no dependencies. That is deliberate: it
is the leaf of the OpenAPI dependency graph, which is what keeps that graph acyclic.

```
openapi-specs  ←── openapi-cli        (writes specs here)
      ↑
      └────────── openapi-clients  (generates clients from them)
```

Backends import each other's clients, so "spec derived from backend code" and "backend code
imports clients derived from specs" would otherwise be circular. It stays acyclic because
**the specs are committed** — a client is derived from a file, never from a running service.
The clients themselves are a build output and are not committed.

## Regenerating

Each backend owns its spec and writes it with [`openapi-cli`](../openapi-cli):

```sh
pnpm --filter nest-forms-backend run openapi
```

| File | Produced by |
| --- | --- |
| `forms.json` | `nest-forms-backend` |
| `tax.json` | `nest-tax-backend` |
| `city-account.json` | `nest-city-account` |
| `clamav-scanner.json` | `nest-clamav-scanner` |

CI fails the build when a committed spec no longer matches its backend — see each service's
`openapi` Docker stage, which runs `openapi-cli spec:validate`.

When that check fails on a pull request you can regenerate without a local checkout, by
commenting on the pull request:

```
/openapi nest-forms-backend
```

Either the workspace directory name or the spec name (`forms`) identifies the service. The
spec is built in the service's `openapi-generate` Docker stage and committed to the branch —
so it comes out of the same image as the check that failed, not a laptop that may be on
different dependencies. See [openapi-chatops.yml](../.github/workflows/openapi-chatops.yml);
that workflow also notes why the pull request's checks do not re-run by themselves afterwards.

Specs for services outside this repo (`slovensko-sk`, `magproxy`) are not here yet; clients
for those are still generated straight from their upstream URLs.

## Why these are committed

Client generation reads from here rather than from a deployed server, so it is reproducible
offline and does not depend on what happens to be live on staging. It also means an API change
shows up as a reviewable diff in the pull request that causes it — which only works because
the specs are free of run-to-run noise. If you see unrelated churn, that is a bug in the
source, not something to commit around.

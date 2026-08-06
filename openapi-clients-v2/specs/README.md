# specs

OpenAPI documents, one per backend, generated offline and **committed**.

They are produced by [`openapi-cli`](../../openapi-cli), which compiles each backend with the
`@nestjs/swagger` plugin and builds the same document that backend serves at `/api-json`:

```sh
pnpm --filter nest-forms-backend run openapi
```

| File | Backend | Regenerate with |
| --- | --- | --- |
| `forms.json` | `nest-forms-backend` | `pnpm --filter nest-forms-backend run openapi` |

Each backend owns the path it writes to, via the `--out` flag in its own `openapi` script.

## Why these are committed

Client generation reads from here rather than fetching from a deployed server, so it is
reproducible offline and does not depend on what happens to be live on staging. It also means
an API change shows up as a reviewable diff in the pull request that causes it.

A regenerated spec should therefore be **empty of diff noise** when nothing changed. If you
see unrelated churn, that is a bug in the source, not something to commit around.

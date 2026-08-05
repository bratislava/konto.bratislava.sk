# openapi-cli

Builds a NestJS backend's OpenAPI document offline and runs an action over it.

Run it from the backend you want a document for, normally through that backend's own script:

```sh
pnpm --filter nest-forms-backend run openapi
```

Only the action's output is written — the compile happens entirely in memory.

## The per-backend contract

A backend is wired up by exporting two things from `src/openapi.ts`:

```ts
export { default as AppModule } from './app.module'
export { createSwaggerDocument } from './bootstrap'
```

| Export | Purpose |
| --- | --- |
| `AppModule` | The root module. Created in preview mode, so no provider is instantiated. |
| `createSwaggerDocument(app, port?)` | Must return the same document the running server serves at `/api-json`. Taking the port as an argument is what keeps config providers — and therefore instantiation — out of it. |
| `prepareApp?(app)` | Optional. Applied before the document is built, for routes that depend on app-level setup rather than on `DocumentBuilder`. `nest-tax-backend` needs it for `app.enableVersioning()`. |

Backends are then listed in `src/backends.ts`. All of them are listed already; one whose
`src/openapi.ts` does not exist yet fails with a message saying exactly that.

## Adding an action

Actions receive the finished document as plain JSON and know nothing about Nest or
TypeScript. Add a file next to `src/actions/emit.ts` and register it in
`src/actions/register.ts`.

```ts
export const myAction: Action<MyOptions> = {
  name: 'my-action',
  description: '…',
  configureOptions: (command) => command.option('--flag <value>', '…'),
  run: async ({ document, backendDir }, { flag }) => { /* … */ },
}
```

## Why it compiles the backend instead of importing its build output

`@nestjs/swagger` ships a compile-time plugin — a TypeScript `before` transformer that
rewrites `@ApiProperty()` decorator arguments to inject the types it infers from the source.
Without it the document loses type information on most properties.

The runtime alternative (`ReadonlyVisitor` + a generated `metadata.ts` +
`loadPluginMetadata`) is not equivalent: it cannot key `export default class`, silently drops
classes that are not exported, and its metadata factory is attached *after* the decorators
have run, so reflection's erased `Object` wins over the inferred type. Reaching parity that
way needed a re-keying shim and source edits across the backend.

So the CLI runs the real transformer, driven through the TypeScript compiler API, and keeps
the emitted JavaScript in memory. Two consequences worth knowing about:

- **Loading goes through `pirates`**, the same require-hook library `babel-register` uses. It
  registers `.ts` in `Module._extensions`, chains any handler already installed, drives
  `module._compile` and hands back a `revert`. It has to be that mechanism and not the newer
  `module.registerHooks({ load })`: registering the extension is also what adds `.ts` to the
  CJS resolver's extension-probe list, which is what makes extensionless imports
  (`require('./app.module')`) resolve at all. A `load` hook is never consulted, because
  resolution fails first.
- **`typescript` is pinned for `@nestjs/swagger`.** That package declares no dependency on
  `typescript` yet requires it at module scope, so in this workspace it escapes to pnpm's
  hidden hoist directory and can pick up a TypeScript major that has no `ts.factory`. A
  scoped `resolve` hook forces it onto the backend's copy, which also guarantees the plugin
  and the CLI share one instance — necessary, since the `ts.Program` is passed between them.

## The compiler and Nest runtime come from the backend

`typescript`, `@nestjs/core`, `@nestjs/common` and `@nestjs/swagger` are **type-only**
devDependencies here. At runtime every one of them is resolved from the backend's own
directory (`src/host-modules.ts`).

That is deliberate, for two different reasons:

- **`typescript`** compiles the *backend's* source, so it must be the backend's compiler —
  the same one `nest build` uses. A different version could emit differently or infer
  different types, and the whole point is for this document to match what the server serves.
  Same reasoning as reading plugin options from the backend's `nest-cli.json` rather than
  hardcoding them.
- **`@nestjs/*`** must be the exact instances the backend's compiled code requires.
  `NestFactory` has to be the copy whose `@nestjs/common` wrote the decorator metadata it
  reads back; two copies means metadata written by one and read by another.

Never `import` any of them for a value — only `import type`. `commander` and `pirates` are
the CLI's own runtime dependencies and are imported normally.

# Email templates

`@bratislava/email-templates` renders the emails of Bratislavské konto and related city services with
React Email. Today these emails are Mailgun templates (see "Email templates (Mailgun)" in the root
README); they move here one by one, and the services switch to rendering them from this package.

So far the package holds:

- `@bratislava/email-templates/forms/summary-email`: the form summary that nest-forms-backend pastes
  into the Mailgun "new submission" templates (moved here from forms-shared, output unchanged).

## Using the package

The package is native ESM. The CommonJS Nest backends load it through Node's `require(esm)`, so the
sources must not use top-level `await`; `pnpm build` checks that every entry loads with `require()`.

Form emails live under `forms/*` entries and import forms-shared, an optional peer dependency. Nothing
else may import it (also checked by `pnpm build`).

## Tests

`pnpm test` runs the `markup` project: every example's HTML (formatted) and plain text are compared
with the snapshots in `tests/__snapshots__/<product>/<email>/<example>/`. It runs anywhere.

Screenshots are compared only in the Docker test image, because fonts and browser builds differ
between machines:

- `pnpm docker:test` runs all tests there, including the screenshot projects (Chromium and WebKit, 800
  and 360 px wide, light and dark).
- `pnpm docker:test:update` writes new and changed snapshots back into `tests/__snapshots__/`.

CI runs the same image (`email-templates-test` bake target, `.github/workflows/test-email-templates.yml`)
and fails on any missing or changed snapshot.

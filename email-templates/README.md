# Email templates

`@bratislava/email-templates` renders the emails of Bratislavské konto and related city services
(OLO, TSB, PAAS, Kúpaliská) with React Email. Today these emails are Mailgun templates (see "Email
templates (Mailgun)" in the root README); they move here, and the services will switch to rendering
them from this package. [MAPPING.md](MAPPING.md) lists where every Mailgun template goes and what
changed.

## Using the package

Each email has a render function in its product's entry, for example:

```ts
import { renderCityAccountRegistrationSuccessfulEmail } from '@bratislava/email-templates/city-account'

const { subject, html, text } = await renderCityAccountRegistrationSuccessfulEmail(
  { firstName: 'Jana' },
  { assetsBaseUrl: `${frontendUrl}/email-assets` },
)
```

- `subject` already has the product prefix ("Bratislavské konto: …"); emails to staff return the
  subject the caller passes.
- `html` is the whole document; `text` is the plain-text version for the same message.
- `assetsBaseUrl` points at the email assets served by the web app of the environment the email is
  sent from (defaults to production). `now` sets the copyright year.

The package is native ESM. The CommonJS Nest backends load it through Node's `require(esm)`, so the
sources must not use top-level `await`; `pnpm build` checks that every entry loads with `require()`.
Form emails live under `forms/*` entries and import forms-shared, an optional peer dependency.
Nothing else may import it (also checked by `pnpm build`).

`@bratislava/email-templates/forms/summary-email` is the form summary that nest-forms-backend pastes
into the Mailgun "new submission" templates, moved here from forms-shared with unchanged output.

## Writing an email

1. Add `src/emails/<product>/<email>.tsx`: `defineEmail()` with the brand, layout, subject, preview
   text and content, built from `src/components/`. Export the props type and
   `render<Product><Email>Email`, and add both to the product's entry in `src/`.
2. Add `<email>.examples.ts` with `defineExamples()`: one example per visible variant (with and
   without optional data, every value of a choice).
3. Add the examples to `src/registry.ts`. The tests and the preview pick them up from there.
4. Run `pnpm test` to write the HTML and text snapshots, and `pnpm docker:test:update` for the
   screenshots. Add a row to [MAPPING.md](MAPPING.md) when the email replaces a Mailgun template.

## Design system

- **Layout** (`components/EmailLayout.tsx`): a white card up to 584px on a grey page, logos at the
  top. Citizen emails end with the sign-off, a privacy notice and the copyright; staff emails don't.
- **Brands** (`theme/brands.ts`): the city and its partners (OLO, TSB, PAAS, STARZ) share the layout.
  A brand sets the subject prefix, the partner logo next to the city's, the sign-off ("Vaše OLO &
  Hlavné mesto SR Bratislava") and the button colours. City buttons match the web app's primary
  button; partner colours come from their logos. A test checks every pair for WCAG AA contrast.
- **Fonts**: Inter, self-hosted (not Google Fonts), where clients load web fonts; Arial elsewhere.
  Classic Outlook always gets Arial, set on every text element because it doesn't inherit fonts into
  nested tables.
- **Dark mode**: elements carry `ba-*` role classes that `theme/head-styles.ts` recolours for
  `prefers-color-scheme: dark` (Apple Mail, iOS, Outlook for Mac, Thunderbird, new Outlook) and for
  Outlook.com's own dark mode. Logos that disappear on dark backgrounds have a dark variant. Clients
  that invert colours themselves (Gmail apps) still get a readable email.
- **Outlook**: the layout uses tables; an Outlook-only table fixes the card width; buttons are table
  cells with square corners there. `RawHtml` adds conditional comments, which React can't render.
- Only px sizes and hex colours: Outlook ignores `rem`, and email clients don't support OKLCH or CSS
  variables. The tests fail on any of them.

## Assets

Fonts, logos and icons are in `assets/v1/` and are served by the web app at `/email-assets/v1/`:
`next.config.ts` copies them into `next/public/email-assets/` at build time. Sent emails link to these
files for years, so a published file never changes: add a new file (or a `v2` folder) instead, then run
`pnpm update-assets-manifest`. The tests compare the files with `assets/manifest.json`.

## Preview

`pnpm preview` opens the React Email preview at http://localhost:3030 with every example from the
registry, rendered through the package's own pipeline and with live reload. It lives in
`email-templates-preview/`, a separate package, so the preview app is not installed with the packages that use the emails.

## Tests

`pnpm test` runs the `markup` project: every example's HTML (formatted) and plain text (with the
subject) are compared with the snapshots in `tests/__snapshots__/<product>/<email>/<example>/`, and
the markup is checked for email-safe CSS, image attributes, absolute links, existing assets and the
Gmail size limit. It also checks contrast, the registry and the asset manifest. It runs anywhere.

Screenshots are compared only in the Docker test image, because fonts and browser builds differ
between machines:

- `pnpm docker:test` runs all tests there, including the screenshot projects (Chromium and WebKit, 800
  and 360 px wide, light and dark).
- `pnpm docker:test:update` writes new and changed snapshots back into `tests/__snapshots__/`.

CI runs the same image (`email-templates-test` bake target, `.github/workflows/test-email-templates.yml`)
and fails on any missing or changed snapshot.

## Testing in real email clients

`pnpm export-html [--filter <text>] [--assets-base-url <url>]` writes the examples to `export/` exactly
as they would be sent, with a `manifest.json`, for Email on Acid. The assets base URL must be reachable
by the email clients.

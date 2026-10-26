import type { ReactElement } from 'react'

import type { EmailDefinitionResult, RenderedEmail, RenderOptions } from './define-email'

/** Examples render at a fixed time, so the copyright year in snapshots doesn't change. */
export const exampleNow = new Date('2026-01-15T10:00:00+01:00')

/**
 * Images that senders host themselves (Kúpaliská QR codes) come from this host in examples. Tests
 * and the preview serve it from the package's `fixtures/` folder, which is never published.
 */
export const exampleFixturesBaseUrl = 'https://fixtures.email-templates.test'

export type RegisteredExample = {
  name: string
  render: (options?: RenderOptions) => Promise<RenderedEmail>
  element: (options?: RenderOptions) => ReactElement
}

/** An email with its examples, as tests and the preview see it. */
export type RegisteredEmail = {
  /** Folder under `src/emails/`, also the first level of the snapshot directories. */
  product: string
  /** File name without extension. */
  id: string
  examples: RegisteredExample[]
}

/**
 * Example props for an email. Each example is a snapshot in the tests and a page in the preview, so
 * cover every visible variant: with and without optional data, each value of a choice.
 */
export const defineExamples = <Props extends object>({
  product,
  id,
  email,
  examples,
}: {
  product: string
  id: string
  email: EmailDefinitionResult<Props>
  examples: Record<string, Props>
}): RegisteredEmail => ({
  product,
  id,
  examples: Object.entries(examples).map(([name, props]) => ({
    name,
    render: (options) => email.render(props, { now: exampleNow, ...options }),
    element: (options) => email.element(props, { now: exampleNow, ...options }),
  })),
})

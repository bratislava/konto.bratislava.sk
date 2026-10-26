import type { ReactNode } from 'react'
import { render, toPlainText } from 'react-email'

import { EmailLayout, type EmailLayoutVariant } from '../components/EmailLayout'
import type { Locale } from '../i18n/layout-strings'
import { type Brand, brands } from '../theme/brands'
import { EmailDocument } from './EmailDocument'
import { insertRawHtml } from './raw-html'

export type RenderOptions = {
  /**
   * Base URL of the email assets (fonts, logos, icons), served by the konto web app. Pass the
   * frontend of the environment the email is sent from; defaults to production.
   */
  assetsBaseUrl?: string
  /** Time of rendering, for the copyright year. */
  now?: Date
}

export type RenderedEmail = {
  subject: string
  html: string
  text: string
}

export const defaultAssetsBaseUrl = 'https://konto.bratislava.sk/email-assets'

type EmailDefinition<Props extends object> = {
  brand: Brand | ((props: Props) => Brand)
  layout: EmailLayoutVariant
  locale?: (props: Props) => Locale
  /**
   * Citizen emails get the brand's subject prefix ("Bratislavské konto: …"). Staff emails return
   * the caller's subject unchanged, because recipients filter their mailboxes on it.
   */
  subject: (props: Props) => string
  /** Text clients show next to the subject in the inbox. */
  preview: (props: Props) => string
  Content: (props: Props) => ReactNode
}

// The options are html-to-text's, whose types aren't installed, so the formatter is typed by hand.
const plainTextOptions = {
  selectors: [
    // html-to-text upper-cases headings by default.
    { selector: 'h1', options: { uppercase: false } },
    { selector: 'h2', options: { uppercase: false } },
    // Images are skipped, so a linked image would leave a bare URL; these keep their alt text.
    { selector: 'img[data-alt-in-text]', format: 'altText' },
  ],
  formatters: {
    altText: (
      element: { attribs: Record<string, string | undefined> },
      _walk: unknown,
      builder: { addInline: (text: string) => void },
    ) => builder.addInline(element.attribs.alt ?? ''),
  },
}

export const defineEmail = <Props extends object>(definition: EmailDefinition<Props>) => {
  const getBrand = (props: Props) =>
    typeof definition.brand === 'function' ? definition.brand(props) : definition.brand

  const getSubject = (props: Props) => {
    const subject = definition.subject(props)

    return definition.layout.kind === 'citizen'
      ? `${brands[getBrand(props)].subjectPrefix}: ${subject}`
      : subject
  }

  const element = (props: Props, options: RenderOptions = {}) => {
    const { Content } = definition

    return (
      <EmailDocument
        context={{
          brand: getBrand(props),
          locale: definition.locale?.(props) ?? 'sk',
          assetsBaseUrl: options.assetsBaseUrl ?? defaultAssetsBaseUrl,
          now: options.now ?? new Date(),
        }}
        subject={getSubject(props)}
        preview={definition.preview(props)}
      >
        <EmailLayout variant={definition.layout}>
          <Content {...props} />
        </EmailLayout>
      </EmailDocument>
    )
  }

  const renderEmail = async (props: Props, options?: RenderOptions): Promise<RenderedEmail> => {
    const html = insertRawHtml(await render(element(props, options))).replace(
      '<html ',
      '<html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" ',
    )
    return {
      subject: getSubject(props),
      html,
      text: toPlainText(html, plainTextOptions),
    }
  }

  return { render: renderEmail, element }
}

export type EmailDefinitionResult<Props extends object> = ReturnType<typeof defineEmail<Props>>

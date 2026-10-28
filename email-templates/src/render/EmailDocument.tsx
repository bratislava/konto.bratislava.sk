import type { ReactNode } from 'react'
import { Body, Head, Html, Preview, Tailwind } from 'react-email'

import {
  colorSchemeCss,
  darkModeCss,
  getFontFaceCss,
  outlookComDarkModeCss,
  outlookCss,
  responsiveCss,
} from '../theme/head-styles'
import { tailwindConfig } from '../theme/tailwind-config'
import { assetsVersion, EmailContextProvider, type EmailContextValue } from './context'
import { RawHtml } from './raw-html'

/** Lets classic Outlook on high-DPI screens keep image sizes and allow PNGs. */
const outlookDocumentSettings =
  '<!--[if gte mso 9]><xml><o:OfficeDocumentSettings><o:AllowPNG/><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml><![endif]-->'

type EmailDocumentProps = {
  context: EmailContextValue
  /** Also the document title, which some clients show when the email is opened in a browser. */
  subject: string
  /** Text clients show next to the subject in the inbox. */
  preview: string
  children: ReactNode
}

export const EmailDocument = ({ context, subject, preview, children }: EmailDocumentProps) => {
  const assetUrl = (path: string) =>
    `${context.assetsBaseUrl.replace(/\/$/, '')}/${assetsVersion}/${path}`

  return (
    <EmailContextProvider value={context}>
      <Tailwind config={tailwindConfig}>
        <Html lang={context.locale} dir="ltr">
          <Head>
            <title>{subject}</title>
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <meta name="color-scheme" content="light dark" />
            <meta name="supported-color-schemes" content="light dark" />
            <meta
              name="format-detection"
              content="telephone=no, date=no, address=no, email=no, url=no"
            />
            <RawHtml html={outlookDocumentSettings} />
            <RawHtml
              html={`<!--[if !mso]><!--><style>${getFontFaceCss(assetUrl)}</style><!--<![endif]-->`}
            />
            <RawHtml html={`<!--[if mso]><style>${outlookCss}</style><![endif]-->`} />
            <style dangerouslySetInnerHTML={{ __html: colorSchemeCss }} />
            <style dangerouslySetInnerHTML={{ __html: darkModeCss }} />
            <style dangerouslySetInnerHTML={{ __html: outlookComDarkModeCss }} />
            <style dangerouslySetInnerHTML={{ __html: responsiveCss }} />
          </Head>
          <Body lang={context.locale} className="ba-page m-0 bg-page p-0">
            {/* Without `useTitleTag={false}`, the preview text would become the document title. */}
            <Preview useTitleTag={false}>{preview}</Preview>
            {children}
          </Body>
        </Html>
      </Tailwind>
    </EmailContextProvider>
  )
}

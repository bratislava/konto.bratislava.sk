import type { ReactNode } from 'react'

import type { PrivacyNotice as PrivacyNoticeKind } from '../i18n/layout-strings'
import { RawHtml } from '../render/raw-html'
import { colors, contentWidth } from '../theme/tokens'
import { Divider } from './Divider'
import { Copyright, PrivacyNotice, SignOff } from './Footer'
import { Header } from './Header'

export type EmailLayoutVariant =
  /** Emails to citizens: sign-off, privacy notice and copyright after the content. */
  | { kind: 'citizen'; privacyNotice: PrivacyNoticeKind }
  /** Emails to city and partner staff: the content only. */
  | { kind: 'staff' }

type EmailLayoutProps = {
  variant: EmailLayoutVariant
  children: ReactNode
}

/**
 * A white card on a grey page: logos, then the content. The card is fluid up to 584px; classic
 * Outlook 2013/2016 ignore `max-width`, so an Outlook-only table fixes its width there.
 */
export const EmailLayout = ({ variant, children }: EmailLayoutProps) => (
  <table
    role="presentation"
    width="100%"
    cellPadding={0}
    cellSpacing={0}
    border={0}
    className="ba-page bg-page"
  >
    <tbody>
      <tr>
        <td align="center" className="ba-outer px-[16px] py-[32px]">
          <RawHtml
            html={`<!--[if mso]><table role="presentation" width="${contentWidth}" align="center" cellpadding="0" cellspacing="0" border="0"><tr><td><![endif]-->`}
          />
          <table
            role="presentation"
            width="100%"
            cellPadding={0}
            cellSpacing={0}
            border={0}
            className="ba-surface rounded-[16px] bg-surface"
            style={{ maxWidth: contentWidth }}
          >
            <tbody>
              <tr>
                <td
                  className={`ba-divider px-[24px] py-[20px] [border-bottom:2px_solid_${colors.light.divider}]`}
                >
                  <Header />
                </td>
              </tr>
              <tr>
                <td className="ba-content px-[24px] py-[32px] text-left">
                  {children}
                  {variant.kind === 'citizen' && (
                    <>
                      <SignOff />
                      <Divider />
                      <PrivacyNotice notice={variant.privacyNotice} />
                    </>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
          <RawHtml html="<!--[if mso]></td></tr></table><![endif]-->" />
          {variant.kind === 'citizen' && <Copyright />}
        </td>
      </tr>
    </tbody>
  </table>
)

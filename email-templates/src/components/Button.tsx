import type { ReactNode } from 'react'

import { useEmailContext } from '../render/context'
import { brands } from '../theme/brands'

type ButtonProps = {
  href: string
  children: ReactNode
}

/**
 * A link styled as a button, in the brand's colours. The colour sits on a table cell so it also
 * shows in classic Outlook, which gets the padding through `mso-padding-alt` (it ignores padding on
 * links) and shows square corners.
 */
export const Button = ({ href, children }: ButtonProps) => {
  const { brand } = useEmailContext()
  const { background, text } = brands[brand].button.light

  return (
    <table role="presentation" cellPadding={0} cellSpacing={0} border={0} className="mb-[16px]">
      <tbody>
        <tr>
          <td
            className={`ba-button-${brand} rounded-[8px] [mso-padding-alt:12px_24px]`}
            style={{ backgroundColor: background }}
          >
            <a
              href={href}
              className="inline-block rounded-[8px] px-[24px] py-[12px] font-sans text-[16px] leading-[24px] font-semibold no-underline"
              style={{ color: text }}
            >
              {children}
            </a>
          </td>
        </tr>
      </tbody>
    </table>
  )
}

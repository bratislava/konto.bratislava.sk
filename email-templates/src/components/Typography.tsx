import cx from 'classnames'
import type { ReactNode } from 'react'
import { Link } from 'react-email'

import type { RichText } from '../i18n/layout-strings'

/**
 * Text primitives. Every text element sets its font and colour itself: classic Outlook doesn't
 * inherit `font-family` into nested tables, and the `ba-*` role classes let dark mode recolour them.
 */

export const Heading = ({ children }: { children: ReactNode }) => (
  <h1 className="ba-text m-0 mb-[24px] text-center font-sans text-[28px] leading-[36px] font-semibold text-ink">
    {children}
  </h1>
)

export const Subheading = ({ children }: { children: ReactNode }) => (
  <h2 className="ba-text m-0 mb-[16px] font-sans text-[20px] leading-[28px] font-semibold text-ink">
    {children}
  </h2>
)

type ParagraphProps = {
  children: ReactNode
  /** `small` is for secondary information, such as the privacy notice. */
  size?: 'default' | 'small'
  align?: 'left' | 'center'
  className?: string
}

export const Paragraph = ({
  children,
  size = 'default',
  align = 'left',
  className,
}: ParagraphProps) => (
  <p
    className={cx(
      'm-0 font-sans',
      size === 'default'
        ? 'ba-text mb-[16px] text-[16px] leading-[24px] text-ink'
        : 'ba-text-secondary mb-[12px] text-[14px] leading-[20px] text-ink-secondary',
      { 'text-center': align === 'center' },
      className,
    )}
  >
    {children}
  </p>
)

/** Links are underlined in the text colour: partner colours are too light for text on white. */
export const TextLink = ({ href, children }: { href: string; children: ReactNode }) => (
  <Link href={href} className="ba-text font-semibold text-ink underline">
    {children}
  </Link>
)

export const Strong = ({ children }: { children: ReactNode }) => (
  <strong className="font-semibold">{children}</strong>
)

export const RichTextContent = ({ content }: { content: RichText }) =>
  content.map((part, index) =>
    typeof part === 'string' ? (
      part
    ) : (
      <TextLink key={index} href={part.url}>
        {part.label}
      </TextLink>
    ),
  )

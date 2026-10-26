import { type PrivacyNotice as PrivacyNoticeKind, layoutStrings } from '../i18n/layout-strings'
import { useEmailContext } from '../render/context'
import { brands } from '../theme/brands'
import { Paragraph, RichTextContent } from './Typography'

/** "Thank you for using our services" and who the email is from, the partner included. */
export const SignOff = () => {
  const { brand, locale } = useEmailContext()
  const strings = layoutStrings[locale]

  return (
    <p className="ba-text m-0 mt-[16px] font-sans text-[16px] leading-[24px] text-ink">
      {strings.thanks}
      <br />
      {strings.signature(brands[brand].partner)}
    </p>
  )
}

export const PrivacyNotice = ({ notice }: { notice: PrivacyNoticeKind }) => {
  const { brand, locale } = useEmailContext()
  const partnerPrivacy = brands[brand].partner?.privacy?.[locale]

  return (
    <>
      <Paragraph size="small">
        <RichTextContent content={layoutStrings[locale].privacy[notice]} />
      </Paragraph>
      {partnerPrivacy && (
        <Paragraph size="small">
          <RichTextContent content={partnerPrivacy} />
        </Paragraph>
      )}
    </>
  )
}

export const Copyright = () => {
  const { locale, now } = useEmailContext()

  return (
    <p className="ba-text-secondary m-0 pt-[24px] text-center font-sans text-[14px] leading-[20px] text-ink-secondary">
      {layoutStrings[locale].copyright(now.getFullYear())}
    </p>
  )
}

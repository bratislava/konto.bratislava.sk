import { CodeBox } from '../../components/CodeBox'
import { Heading, Paragraph, Strong } from '../../components/Typography'
import type { Locale } from '../../i18n/layout-strings'
import { defineEmail } from '../../render/define-email'

/** BPK: bonus parking card, NPK: visitor parking card. */
export type ParkingCardType = 'BPK' | 'NPK'

export type ParkingEmailVerificationEmailProps = {
  locale: Locale
  /** The cards being loaded; without it the email just says "parking cards". */
  cardType: ParkingCardType | null
  phoneNumber: string
  /** One-time code the user enters in the app. */
  token: string
}

const strings = {
  sk: {
    subject: 'Potvrďte e-mail',
    heading: 'Potvrďte e-mail na načítanie parkovacích kariet',
    cards: { BPK: 'bonusových parkovacích kariet', NPK: 'návštevníckych parkovacích kariet' },
    anyCards: 'parkovacích kariet',
    before: 'Na pokračovanie v načítaní Vašich',
    phone: 'pre telefónne číslo',
    after: 'zadajte v mobilnej aplikácii PAAS tento kód:',
    preview: (token: string) => `Kód na načítanie parkovacích kariet: ${token}`,
  },
  en: {
    subject: 'Confirm your e-mail',
    heading: 'Confirm your e-mail to load parking cards',
    cards: { BPK: 'bonus parking cards', NPK: 'visitor parking cards' },
    anyCards: 'parking cards',
    before: 'To continue loading your',
    phone: 'for the phone number',
    after: 'enter this code in the PAAS mobile app:',
    preview: (token: string) => `Code to load your parking cards: ${token}`,
  },
} satisfies Record<Locale, unknown>

/** From the PAAS parking app: code confirming the e-mail before parking cards are loaded. */
export const parkingEmailVerificationEmail = defineEmail<ParkingEmailVerificationEmailProps>({
  brand: 'paas',
  layout: { kind: 'citizen', privacyNotice: 'city' },
  locale: ({ locale }) => locale,
  subject: ({ locale }) => strings[locale].subject,
  preview: ({ locale, token }) => strings[locale].preview(token),
  Content: ({ locale, cardType, phoneNumber, token }) => {
    const text = strings[locale]

    return (
      <>
        <Heading>{text.heading}</Heading>
        <Paragraph>
          {text.before} {cardType ? text.cards[cardType] : text.anyCards} {text.phone}{' '}
          <Strong>{phoneNumber}</Strong> {text.after}
        </Paragraph>
        <CodeBox code={token} />
      </>
    )
  },
})

export const renderParkingEmailVerificationEmail = parkingEmailVerificationEmail.render

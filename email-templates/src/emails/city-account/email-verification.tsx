import { CodeBox } from '../../components/CodeBox'
import { Heading, Paragraph, Strong } from '../../components/Typography'
import { defineEmail } from '../../render/define-email'

export type CityAccountEmailVerificationEmailProps = {
  verificationCode: string
}

/** One-time code that confirms the user's e-mail address. */
export const cityAccountEmailVerificationEmail =
  defineEmail<CityAccountEmailVerificationEmailProps>({
    brand: 'bratislava',
    layout: { kind: 'citizen', privacyNotice: 'bratislavske-konto' },
    subject: () => 'Overenie e-mailu',
    preview: ({ verificationCode }) => `Váš overovací kód je ${verificationCode}.`,
    Content: ({ verificationCode }) => (
      <>
        <Heading>Overenie e-mailu</Heading>
        <Paragraph>Kód na overenie Vašej e-mailovej adresy je:</Paragraph>
        <CodeBox code={verificationCode} />
        <Paragraph>
          Kód vložte do poľa <Strong>Overovací kód</Strong>. Platnosť kódu je 60 minút.
        </Paragraph>
      </>
    ),
  })

export const renderCityAccountEmailVerificationEmail = cityAccountEmailVerificationEmail.render

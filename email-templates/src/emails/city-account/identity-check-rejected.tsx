import { Greeting } from '../../components/Greeting'
import { StatusIcon } from '../../components/StatusIcon'
import { Heading, MailtoLink, Paragraph, TextLink } from '../../components/Typography'
import { defineEmail } from '../../render/define-email'

export type CityAccountIdentityCheckRejectedEmailProps = {
  /** From the account; without it the greeting has no name. */
  firstName: string | null
  /** Where the user repeats the verification, on the frontend of the sending environment. */
  verificationUrl: string
}

/** After the birth number and ID document number could not be verified. */
export const cityAccountIdentityCheckRejectedEmail =
  defineEmail<CityAccountIdentityCheckRejectedEmailProps>({
    brand: 'bratislava',
    layout: { kind: 'citizen', privacyNotice: 'bratislavske-konto' },
    subject: () => 'Vašu identitu sa nepodarilo overiť',
    preview: () => 'Vaše rodné číslo a číslo dokladu sa nepodarilo overiť.',
    Content: ({ firstName, verificationUrl }) => (
      <>
        <StatusIcon kind="error" />
        <Heading>Vašu identitu sa nepodarilo overiť</Heading>
        <Greeting firstName={firstName} />
        <Paragraph>
          tento e-mail bol odoslaný, aby sme Vás informovali, že Vaše rodné číslo a číslo dokladu sa
          nepodarilo overiť.
        </Paragraph>
        <Paragraph>
          Mohli ste zadať nesprávne údaje, v takom prípade{' '}
          <TextLink href={verificationUrl}>zopakujte overenie</TextLink>.
        </Paragraph>
        <Paragraph>
          Tieto údaje už mohli byť použité na overenie iného konta. Ak o jeho existencii neviete,
          čím skôr sa obráťte na <MailtoLink email="info@bratislava.sk" />.
        </Paragraph>
      </>
    ),
  })

export const renderCityAccountIdentityCheckRejectedEmail =
  cityAccountIdentityCheckRejectedEmail.render

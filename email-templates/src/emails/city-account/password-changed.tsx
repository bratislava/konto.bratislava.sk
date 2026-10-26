import { Greeting } from '../../components/Greeting'
import { StatusIcon } from '../../components/StatusIcon'
import { Heading, MailtoLink, Paragraph } from '../../components/Typography'
import { defineEmail } from '../../render/define-email'

export type CityAccountPasswordChangedEmailProps = {
  /** From the account; without it the greeting has no name. */
  firstName: string | null
}

/** Security notice after the password of the account changed. */
export const cityAccountPasswordChangedEmail = defineEmail<CityAccountPasswordChangedEmailProps>({
  brand: 'bratislava',
  layout: { kind: 'citizen', privacyNotice: 'bratislavske-konto' },
  subject: () => 'Vaše heslo bolo zmenené',
  preview: () => 'Ak ste si heslo nemenili, čo najskôr nás kontaktujte.',
  Content: ({ firstName }) => (
    <>
      <StatusIcon kind="success" />
      <Heading>Vaše heslo bolo úspešne zmenené</Heading>
      <Greeting firstName={firstName} />
      <Paragraph>
        tento e-mail bol odoslaný z bezpečnostných dôvodov, aby sme zabránili neoprávneným zmenám.
      </Paragraph>
      <Paragraph>
        Ak ste si práve nemenili heslo, čo najskôr sa obráťte na{' '}
        <MailtoLink email="info@bratislava.sk" />.
      </Paragraph>
    </>
  ),
})

export const renderCityAccountPasswordChangedEmail = cityAccountPasswordChangedEmail.render

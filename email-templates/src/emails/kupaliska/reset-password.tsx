import { Button } from '../../components/Button'
import { Greeting } from '../../components/Greeting'
import { Heading, MailtoLink, Paragraph } from '../../components/Typography'
import { defineEmail } from '../../render/define-email'

export type KupaliskaResetPasswordEmailProps = {
  /** Page where the user sets a new password, with the reset token. */
  resetPasswordUrl: string
}

/** After the user of a Kúpaliská account asked to reset their password. */
export const kupaliskaResetPasswordEmail = defineEmail<KupaliskaResetPasswordEmailProps>({
  brand: 'kupaliska',
  layout: { kind: 'citizen', privacyNotice: 'city' },
  subject: () => 'Obnovenie hesla',
  preview: () => 'Nové heslo si nastavíte po kliknutí na tlačidlo v e-maile.',
  Content: ({ resetPasswordUrl }) => (
    <>
      <Heading>Zabudli ste heslo?</Heading>
      <Greeting firstName={null} />
      <Paragraph>
        nové heslo si nastavíte po kliknutí na tlačidlo nižšie. Ak ste o zmenu hesla nežiadali,
        tento e-mail ignorujte.
      </Paragraph>
      <Button href={resetPasswordUrl}>Zmeniť heslo</Button>
      <Paragraph>
        V prípade akýchkoľvek otázok nás kontaktujte na adrese{' '}
        <MailtoLink email="kupaliska@bratislava.sk" />.
      </Paragraph>
    </>
  ),
})

export const renderKupaliskaResetPasswordEmail = kupaliskaResetPasswordEmail.render

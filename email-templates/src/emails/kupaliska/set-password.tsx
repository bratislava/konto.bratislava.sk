import { Button } from '../../components/Button'
import { Greeting } from '../../components/Greeting'
import { Heading, MailtoLink, Paragraph } from '../../components/Typography'
import { defineEmail } from '../../render/define-email'

export type KupaliskaSetPasswordEmailProps = {
  /** Page where the user sets their first password, with the token. */
  setPasswordUrl: string
}

/** After a Kúpaliská account was created for the user. */
export const kupaliskaSetPasswordEmail = defineEmail<KupaliskaSetPasswordEmailProps>({
  brand: 'kupaliska',
  layout: { kind: 'citizen', privacyNotice: 'city' },
  subject: () => 'Bol Vám vytvorený účet',
  preview: () => 'Heslo k novému účtu si nastavíte po kliknutí na tlačidlo v e-maile.',
  Content: ({ setPasswordUrl }) => (
    <>
      <Heading>Bol Vám vytvorený účet pre STARZ – Kúpaliská Bratislava</Heading>
      <Greeting firstName={null} />
      <Paragraph>
        heslo si nastavíte po kliknutí na tlačidlo nižšie. Ak ste o vytvorenie účtu nežiadali, tento
        e-mail ignorujte.
      </Paragraph>
      <Button href={setPasswordUrl}>Nastaviť heslo</Button>
      <Paragraph>
        V prípade akýchkoľvek otázok nás kontaktujte na adrese{' '}
        <MailtoLink email="kupaliska@bratislava.sk" />.
      </Paragraph>
    </>
  ),
})

export const renderKupaliskaSetPasswordEmail = kupaliskaSetPasswordEmail.render

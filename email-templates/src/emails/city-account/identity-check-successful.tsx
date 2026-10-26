import { Greeting } from '../../components/Greeting'
import { StatusIcon } from '../../components/StatusIcon'
import { Heading, MailtoLink, Paragraph } from '../../components/Typography'
import { defineEmail } from '../../render/define-email'

export type CityAccountIdentityCheckSuccessfulEmailProps = {
  /** From the account; without it the greeting has no name. */
  firstName: string | null
}

/** After the user's identity was verified with their birth number and ID document number. */
export const cityAccountIdentityCheckSuccessfulEmail =
  defineEmail<CityAccountIdentityCheckSuccessfulEmailProps>({
    brand: 'bratislava',
    layout: { kind: 'citizen', privacyNotice: 'bratislavske-konto' },
    subject: () => 'Vaša identita bola overená',
    preview: () => 'Odteraz môžete plne využívať všetky služby Bratislavského konta.',
    Content: ({ firstName }) => (
      <>
        <StatusIcon kind="success" />
        <Heading>Overenie Vašej identity prebehlo úspešne</Heading>
        <Greeting firstName={firstName} />
        <Paragraph>
          tento e-mail bol odoslaný, aby sme Vás informovali o úspešnom overení Vašej identity
          pomocou rodného čísla a čísla dokladu. Odteraz môžete plne využívať všetky služby
          Bratislavského konta.
        </Paragraph>
        <Paragraph>
          V prípade nejasností sa obráťte na <MailtoLink email="info@bratislava.sk" />.
        </Paragraph>
      </>
    ),
  })

export const renderCityAccountIdentityCheckSuccessfulEmail =
  cityAccountIdentityCheckSuccessfulEmail.render

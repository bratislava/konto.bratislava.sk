import { Greeting } from '../../components/Greeting'
import { StatusIcon } from '../../components/StatusIcon'
import { Heading, MailtoLink, Paragraph } from '../../components/Typography'
import { defineEmail } from '../../render/define-email'

export type CityAccountRegistrationSuccessfulEmailProps = {
  /** From the account; without it the greeting has no name. */
  firstName: string | null
}

/** After the user finishes registering in Bratislavské konto. */
export const cityAccountRegistrationSuccessfulEmail =
  defineEmail<CityAccountRegistrationSuccessfulEmailProps>({
    brand: 'bratislava',
    layout: { kind: 'citizen', privacyNotice: 'bratislavske-konto' },
    subject: () => 'Vitajte',
    preview: () => 'Vaša registrácia do Bratislavského konta prebehla úspešne.',
    Content: ({ firstName }) => (
      <>
        <StatusIcon kind="success" />
        <Heading>Vitajte v Bratislavskom konte</Heading>
        <Greeting firstName={firstName} />
        <Paragraph>
          práve ste sa zaregistrovali do Bratislavského konta. Dúfame, že budete s našimi
          digitálnymi službami spokojní.
        </Paragraph>
        <Paragraph>
          V prípade nejasností sa obráťte na <MailtoLink email="info@bratislava.sk" />.
        </Paragraph>
      </>
    ),
  })

export const renderCityAccountRegistrationSuccessfulEmail =
  cityAccountRegistrationSuccessfulEmail.render

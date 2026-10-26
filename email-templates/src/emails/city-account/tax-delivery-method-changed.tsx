import { Greeting } from '../../components/Greeting'
import { StatusIcon } from '../../components/StatusIcon'
import { Heading, Paragraph, Strong } from '../../components/Typography'
import { defineEmail } from '../../render/define-email'

export type TaxDeliveryMethod = 'email' | 'edesk' | 'postal'

export type CityAccountTaxDeliveryMethodChangedEmailProps = {
  /** From the account; without it the greeting has no name. */
  firstName: string | null
  /**
   * `email`: notifications in Bratislavské konto; the sender attaches the confirmation PDF.
   * `edesk`: set automatically after the user activated their slovensko.sk mailbox.
   * `postal`: paper decisions by post.
   */
  deliveryMethod: TaxDeliveryMethod
}

const methodNames: Record<TaxDeliveryMethod, string> = {
  email: 'Oznámenie v Bratislavskom konte',
  edesk: 'slovensko.sk',
  postal: 'Poštou',
}

/** Daily summary after the user's tax delivery method changed. */
export const cityAccountTaxDeliveryMethodChangedEmail =
  defineEmail<CityAccountTaxDeliveryMethodChangedEmailProps>({
    brand: 'bratislava',
    layout: { kind: 'citizen', privacyNotice: 'bratislavske-konto' },
    subject: () => 'Váš spôsob doručenia sa zmenil',
    preview: ({ deliveryMethod }) =>
      `Nastavený spôsob informovania: ${methodNames[deliveryMethod]}.`,
    Content: ({ firstName, deliveryMethod }) => (
      <>
        <StatusIcon kind="success" />
        <Heading>Nastavený spôsob informovania: {methodNames[deliveryMethod]}</Heading>
        <Greeting firstName={firstName} />
        {deliveryMethod === 'email' && (
          <Paragraph>
            nastavili ste si spôsob informovania o daniach a poplatkoch{' '}
            <Strong>oznámením v Bratislavskom konte</Strong>. Potvrdenie nájdete v prílohe.
          </Paragraph>
        )}
        {deliveryMethod === 'edesk' && (
          <Paragraph>
            aktivovali ste si elektronickú schránku na doručovanie na <Strong>slovensko.sk</Strong>,
            preto Vám bol automaticky nastavený tento spôsob informovania o daniach a poplatkoch.
          </Paragraph>
        )}
        {deliveryMethod === 'postal' && (
          <Paragraph>
            nastavili ste si spôsob informovania o daniach a poplatkoch <Strong>poštou</Strong>.
          </Paragraph>
        )}
      </>
    ),
  })

export const renderCityAccountTaxDeliveryMethodChangedEmail =
  cityAccountTaxDeliveryMethodChangedEmail.render

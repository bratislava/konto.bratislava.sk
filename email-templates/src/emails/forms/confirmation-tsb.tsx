import { MailtoLink, Paragraph, Strong, TextLink } from '../../components/Typography'
import { requestNounForms } from '../../i18n/request-noun'
import {
  defineFormConfirmationEmail,
  type FormConfirmationEmailProps,
  SummaryAttachmentNote,
} from './components/FormConfirmation'

export type FormsConfirmationTsbEmailProps = FormConfirmationEmailProps

/** Confirmation of a TSB form (street lighting and city networks): requests and orders. */
export const formsConfirmationTsbEmail = defineFormConfirmationEmail({
  brand: 'tsb',
  Body: ({ applicationName, requestNoun }) => {
    const noun = requestNounForms[requestNoun]

    return (
      <>
        <Paragraph>
          Vaša {noun.nominative} <Strong>{applicationName}</Strong> bola úspešne odoslaná a prebieha
          jej spracovávanie. V prípade potreby doplnenia podkladov Vás spoločnosť Technické siete
          Bratislava (TSB) bude kontaktovať e-mailom alebo telefonicky v najbližších pracovných
          dňoch.
        </Paragraph>
        <SummaryAttachmentNote requestNoun={requestNoun} />
        <Paragraph>
          Vašu {noun.accusative} nájdete po prihlásení do Bratislavského konta v sekcii Moje
          žiadosti. Sledovanie stavu {noun.genitive} zatiaľ nie je pri službách mestských
          organizácií možné.
        </Paragraph>
        <Paragraph>
          Ak máte otázky týkajúce sa Vašej {noun.genitive} a jej obsahu, obráťte sa na TSB na adrese{' '}
          <MailtoLink email="info@tsb.sk" />. Viac o službách a kontaktné údaje Technických sietí
          Bratislava nájdete na{' '}
          <TextLink href="https://bratislava.sk/mesto-bratislava/technicke-siete-bratislava">
            webovej stránke mestskej organizácie
          </TextLink>
          .
        </Paragraph>
      </>
    )
  },
})

export const renderFormsConfirmationTsbEmail = formsConfirmationTsbEmail.render

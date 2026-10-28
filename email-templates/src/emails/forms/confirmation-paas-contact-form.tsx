import { Paragraph, Strong } from '../../components/Typography'
import { requestNounForms } from '../../i18n/request-noun'
import {
  defineFormConfirmationEmail,
  type FormConfirmationEmailProps,
  SummaryAttachmentNote,
} from './components/FormConfirmation'

export type FormsConfirmationPaasContactFormEmailProps = FormConfirmationEmailProps

/** Confirmation of the PAAS contact form, which is forwarded to PAAS. */
export const formsConfirmationPaasContactFormEmail = defineFormConfirmationEmail({
  brand: 'paas',
  Body: ({ applicationName, requestNoun }) => (
    <>
      <Paragraph>
        Vaša {requestNounForms[requestNoun].nominative} <Strong>{applicationName}</Strong> bola
        úspešne odoslaná do PAAS.
      </Paragraph>
      <SummaryAttachmentNote requestNoun={requestNoun} />
    </>
  ),
})

export const renderFormsConfirmationPaasContactFormEmail =
  formsConfirmationPaasContactFormEmail.render

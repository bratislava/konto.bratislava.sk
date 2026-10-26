import { Paragraph, Strong } from '../../components/Typography'
import { requestNounForms } from '../../i18n/request-noun'
import {
  defineFormConfirmationEmail,
  type FormConfirmationEmailProps,
  SummaryAttachmentNote,
} from './components/FormConfirmation'

export type FormsConfirmationOloEmailProps = FormConfirmationEmailProps

/** Confirmation of an OLO form (waste collection and disposal). */
export const formsConfirmationOloEmail = defineFormConfirmationEmail({
  brand: 'olo',
  Body: ({ applicationName, requestNoun }) => (
    <>
      <Paragraph>
        Vaša {requestNounForms[requestNoun].nominative} <Strong>{applicationName}</Strong> bola
        úspešne odoslaná a aktuálne ju spracovávame. Ohľadom ďalších krokov Vás budeme kontaktovať
        e-mailom alebo telefonicky v najbližších pracovných dňoch.
      </Paragraph>
      <SummaryAttachmentNote requestNoun={requestNoun} />
    </>
  ),
})

export const renderFormsConfirmationOloEmail = formsConfirmationOloEmail.render

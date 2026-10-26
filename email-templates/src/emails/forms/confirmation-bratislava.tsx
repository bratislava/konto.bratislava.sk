import { Paragraph, Strong } from '../../components/Typography'
import { requestNounForms } from '../../i18n/request-noun'
import {
  defineFormConfirmationEmail,
  type FormConfirmationEmailProps,
  SummaryAttachmentNote,
} from './components/FormConfirmation'

export type FormsConfirmationBratislavaEmailProps = FormConfirmationEmailProps

/** Confirmation of a city form handled by e-mail (not sent to GINIS). */
export const formsConfirmationBratislavaEmail = defineFormConfirmationEmail({
  brand: 'bratislava',
  Body: ({ applicationName, requestNoun }) => (
    <>
      <Paragraph>
        Vaša {requestNounForms[requestNoun].nominative} <Strong>{applicationName}</Strong> bola
        úspešne odoslaná a aktuálne ju spracovávame.
      </Paragraph>
      <SummaryAttachmentNote requestNoun={requestNoun} />
    </>
  ),
})

export const renderFormsConfirmationBratislavaEmail = formsConfirmationBratislavaEmail.render

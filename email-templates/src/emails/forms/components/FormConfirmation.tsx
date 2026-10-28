import type { ReactNode } from 'react'

import { Greeting } from '../../../components/Greeting'
import { StatusIcon } from '../../../components/StatusIcon'
import { Heading, Paragraph } from '../../../components/Typography'
import { type RequestNoun, requestNounForms } from '../../../i18n/request-noun'
import { defineEmail } from '../../../render/define-email'
import type { Brand } from '../../../theme/brands'
import { FeedbackRequest } from './FeedbackRequest'

/** Confirmation to the user after a form was sent by e-mail to the city or a city organisation. */
export type FormConfirmationEmailProps = {
  /** From the account or the form; without it the greeting has no name. */
  firstName: string | null
  /** The submission as the user knows it: the subject extracted from it, or the form title. */
  applicationName: string
  /** What the form calls the submission, e.g. `objednavka` for TSB orders. */
  requestNoun: RequestNoun
  /** Questionnaire of the form, from Strapi; without it there's no questionnaire block. */
  feedbackUrl: string | null
}

/** The sender attaches the summary PDF to every confirmation. */
export const SummaryAttachmentNote = ({ requestNoun }: { requestNoun: RequestNoun }) => (
  <Paragraph>
    V prílohe e-mailu nájdete sumár odoslanej {requestNounForms[requestNoun].genitive}.
  </Paragraph>
)

export const defineFormConfirmationEmail = ({
  brand,
  Body,
}: {
  brand: Brand
  /** The paragraphs after the greeting, specific to who handles the submission. */
  Body: (props: FormConfirmationEmailProps) => ReactNode
}) =>
  defineEmail<FormConfirmationEmailProps>({
    brand,
    layout: { kind: 'citizen', privacyNotice: 'bratislavske-konto' },
    subject: ({ requestNoun }) => `Vaša ${requestNounForms[requestNoun].nominative} bola odoslaná`,
    preview: ({ requestNoun, applicationName }) =>
      `${applicationName}: ${requestNounForms[requestNoun].nominative} bola úspešne odoslaná.`,
    Content: (props) => (
      <>
        <StatusIcon kind="success" />
        <Heading>Vaša {requestNounForms[props.requestNoun].nominative} bola odoslaná</Heading>
        <Greeting firstName={props.firstName} />
        <Body {...props} />
        {props.feedbackUrl && <FeedbackRequest url={props.feedbackUrl} />}
      </>
    ),
  })

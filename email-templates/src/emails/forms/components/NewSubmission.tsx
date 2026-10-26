import { Divider } from '../../../components/Divider'
import { KeyValueTable } from '../../../components/KeyValueTable'
import { Heading } from '../../../components/Typography'
import {
  FormSummarySection,
  type FormSummarySectionProps,
} from '../../../form-summary/FormSummarySection'
import { formatDateTime } from '../../../i18n/format'
import { defineEmail } from '../../../render/define-email'
import type { Brand } from '../../../theme/brands'

/** A submitted form, sent to the staff of the city or a city organisation who handle it. */
export type NewSubmissionEmailProps = FormSummarySectionProps & {
  /** Used unchanged: staff filter their mailboxes on it. */
  subject: string
  /** The submission as the user named it: the subject extracted from it, or the form title. */
  applicationName: string
  formId: string
  sentAt: Date | null
}

export const defineNewSubmissionEmail = (brand: Brand) =>
  defineEmail<NewSubmissionEmailProps>({
    brand,
    layout: { kind: 'staff' },
    subject: ({ subject }) => subject,
    preview: ({ applicationName }) => `Nové podanie: ${applicationName}`,
    Content: ({ applicationName, formId, sentAt, formSummary, serverFiles, fileIdInfoMap }) => (
      <>
        <Heading>Nové podanie</Heading>
        <KeyValueTable
          rows={[
            { label: 'Názov', value: applicationName },
            { label: 'Odoslané', value: sentAt ? formatDateTime(sentAt, 'sk') : '-' },
            { label: 'ID podania', value: formId },
          ]}
        />
        <Divider />
        <FormSummarySection
          formSummary={formSummary}
          serverFiles={serverFiles}
          fileIdInfoMap={fileIdInfoMap}
        />
      </>
    ),
  })

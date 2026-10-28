import { KeyValueTable } from '../../components/KeyValueTable'
import { MultilineText } from '../../components/MultilineText'
import { Heading, Paragraph } from '../../components/Typography'
import { defineEmail } from '../../render/define-email'

export type ParkingFeedbackEmailProps = {
  /** Used unchanged, so the team can filter on it. */
  subject: string
  userEmail: string
  userId: string
  appVersion: string
  feedbackType: string
  feedbackValue: string
}

/** Feedback a user sent from the PAAS parking app, to the PAAS team. */
export const parkingFeedbackEmail = defineEmail<ParkingFeedbackEmailProps>({
  brand: 'paas',
  layout: { kind: 'staff' },
  subject: ({ subject }) => subject,
  preview: ({ feedbackType }) => `Spätná väzba z aplikácie: ${feedbackType}`,
  Content: ({ userEmail, userId, appVersion, feedbackType, feedbackValue }) => (
    <>
      <Heading>Spätná väzba z aplikácie</Heading>
      <Paragraph>Používateľ poslal túto spätnú väzbu:</Paragraph>
      <KeyValueTable
        rows={[
          { label: 'Typ', value: feedbackType },
          { label: 'Správa', value: <MultilineText value={feedbackValue} /> },
          { label: 'E-mail', value: userEmail },
          { label: 'ID používateľa', value: userId },
          { label: 'Verzia aplikácie', value: appVersion },
        ]}
      />
    </>
  ),
})

export const renderParkingFeedbackEmail = parkingFeedbackEmail.render

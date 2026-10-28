import type { ReactNode } from 'react'

import { Greeting } from '../../../components/Greeting'
import { StatusIcon, type StatusIconKind } from '../../../components/StatusIcon'
import { Heading, TextLink } from '../../../components/Typography'
import { defineEmail } from '../../../render/define-email'
import { FeedbackRequest } from './FeedbackRequest'

/** What every application status email gets: who, which application, and where to look. */
export type ApplicationStatusEmailProps = {
  /** From the account; without it the greeting has no name. */
  firstName: string | null
  /** The application as the user knows it: the subject extracted from it, or the form title. */
  applicationName: string
  /** Frontend of the sending environment; the links lead to its "Moje žiadosti" page. */
  frontendUrl: string
}

/** Statuses after which the user is asked to rate the service. */
export type ApplicationStatusWithFeedbackProps = ApplicationStatusEmailProps & {
  /** Questionnaire of the form, from Strapi; without it there's no questionnaire block. */
  feedbackUrl: string | null
}

/** Statuses after which the user has to fix the application. */
export type ApplicationStatusWithEditProps = ApplicationStatusEmailProps & {
  /** The application in the form, where the user fixes it. */
  editUrl: string
}

type MyApplicationsSection = 'odoslane' | 'odosiela-sa'

export const getMyApplicationsUrl = (frontendUrl: string, section: MyApplicationsSection) =>
  `${frontendUrl.replace(/\/$/, '')}/moje-ziadosti?sekcia=${section}`

/** "v sekcii Moje žiadosti, v časti Odoslané" with the part linked. */
export const MyApplicationsSectionLink = ({
  frontendUrl,
  section,
}: {
  frontendUrl: string
  section: MyApplicationsSection
}) => (
  <>
    v sekcii Moje žiadosti, v časti{' '}
    <TextLink href={getMyApplicationsUrl(frontendUrl, section)}>
      {section === 'odoslane' ? 'Odoslané' : 'Odosiela sa'}
    </TextLink>
  </>
)

type ApplicationStatusDefinition<Props extends ApplicationStatusEmailProps> = {
  icon: StatusIconKind
  heading: string
  subject: string
  preview: (props: Props) => string
  /** The paragraphs and the call to action after the greeting. */
  Body: (props: Props) => ReactNode
}

/**
 * Status emails of applications sent through Bratislavské konto (to GINIS). They share the icon,
 * heading, greeting and, where the status has one, the questionnaire.
 */
export const defineApplicationStatusEmail = <Props extends ApplicationStatusEmailProps>({
  icon,
  heading,
  subject,
  preview,
  Body,
}: ApplicationStatusDefinition<Props>) =>
  defineEmail<Props>({
    brand: 'bratislava',
    layout: { kind: 'citizen', privacyNotice: 'bratislavske-konto' },
    subject: () => subject,
    preview,
    Content: (props) => (
      <>
        <StatusIcon kind={icon} />
        <Heading>{heading}</Heading>
        <Greeting firstName={props.firstName} />
        <Body {...props} />
        {'feedbackUrl' in props && typeof props.feedbackUrl === 'string' && (
          <FeedbackRequest url={props.feedbackUrl} />
        )}
      </>
    ),
  })

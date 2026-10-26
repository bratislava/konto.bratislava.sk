import { Paragraph, Strong } from '../../components/Typography'
import {
  type ApplicationStatusWithFeedbackProps,
  defineApplicationStatusEmail,
  MyApplicationsSectionLink,
} from './components/ApplicationStatus'

export type FormsApplicationStatusSentEmailProps = ApplicationStatusWithFeedbackProps

/** After the application was sent to the city. */
export const formsApplicationStatusSentEmail =
  defineApplicationStatusEmail<FormsApplicationStatusSentEmailProps>({
    icon: 'sent',
    heading: 'Vaša žiadosť bola odoslaná',
    subject: 'Vaša žiadosť bola odoslaná',
    preview: ({ applicationName }) => `Žiadosť ${applicationName} bola odoslaná.`,
    Body: ({ applicationName, frontendUrl }) => (
      <>
        <Paragraph>
          ďakujeme, že ste sa rozhodli podať žiadosť <Strong>{applicationName}</Strong> cez
          Bratislavské konto.
        </Paragraph>
        <Paragraph>
          Žiadosť bola odoslaná a akonáhle ju doručíme našim kolegom a kolegyniam, budú sa venovať
          jej vybaveniu. Detaily si môžete pozrieť vo svojom Bratislavskom konte{' '}
          <MyApplicationsSectionLink frontendUrl={frontendUrl} section="odoslane" />. O ďalšom
          postupe Vás budeme informovať.
        </Paragraph>
      </>
    ),
  })

export const renderFormsApplicationStatusSentEmail = formsApplicationStatusSentEmail.render

import { Paragraph, Strong } from '../../components/Typography'
import {
  type ApplicationStatusWithFeedbackProps,
  defineApplicationStatusEmail,
  MyApplicationsSectionLink,
} from './components/ApplicationStatus'

export type FormsApplicationStatusDeliveredEmailProps = ApplicationStatusWithFeedbackProps

/** After the application was assigned to the department that handles it. */
export const formsApplicationStatusDeliveredEmail =
  defineApplicationStatusEmail<FormsApplicationStatusDeliveredEmailProps>({
    icon: 'sent',
    heading: 'Vaša žiadosť bola doručená',
    subject: 'Vaša žiadosť bola doručená',
    preview: ({ applicationName }) => `Žiadosť ${applicationName} bola doručená.`,
    Body: ({ applicationName, frontendUrl }) => (
      <>
        <Paragraph>
          ďakujeme, že ste sa rozhodli podať žiadosť <Strong>{applicationName}</Strong> cez
          Bratislavské konto.
        </Paragraph>
        <Paragraph>
          Žiadosť bola doručená našim kolegom a kolegyniam, ktorí sa budú odteraz venovať jej
          vybaveniu. Detaily si môžete pozrieť vo svojom Bratislavskom konte{' '}
          <MyApplicationsSectionLink frontendUrl={frontendUrl} section="odoslane" />. O ďalšom
          postupe Vás budeme informovať.
        </Paragraph>
      </>
    ),
  })

export const renderFormsApplicationStatusDeliveredEmail =
  formsApplicationStatusDeliveredEmail.render

import { Paragraph, Strong } from '../../components/Typography'
import {
  type ApplicationStatusWithFeedbackProps,
  defineApplicationStatusEmail,
  MyApplicationsSectionLink,
} from './components/ApplicationStatus'

export type FormsApplicationStatusSuccessEmailProps = ApplicationStatusWithFeedbackProps

/** After the application was resolved. */
export const formsApplicationStatusSuccessEmail =
  defineApplicationStatusEmail<FormsApplicationStatusSuccessEmailProps>({
    icon: 'success',
    heading: 'Vaša žiadosť bola úspešne vybavená',
    subject: 'Vaša žiadosť bola vybavená',
    preview: ({ applicationName }) => `Žiadosť ${applicationName} bola úspešne vybavená.`,
    Body: ({ applicationName, frontendUrl }) => (
      <>
        <Paragraph>
          ďakujeme, že ste sa rozhodli podať žiadosť <Strong>{applicationName}</Strong> cez
          Bratislavské konto.
        </Paragraph>
        <Paragraph>
          Žiadosť bola úspešne vybavená. Výsledok a detaily Vašej žiadosti nájdete vo svojom
          Bratislavskom konte{' '}
          <MyApplicationsSectionLink frontendUrl={frontendUrl} section="odoslane" /> po kliknutí na
          konkrétnu žiadosť.
        </Paragraph>
      </>
    ),
  })

export const renderFormsApplicationStatusSuccessEmail = formsApplicationStatusSuccessEmail.render

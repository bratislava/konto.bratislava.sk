import { Paragraph, Strong } from '../../components/Typography'
import {
  type ApplicationStatusWithFeedbackProps,
  defineApplicationStatusEmail,
  MyApplicationsSectionLink,
} from './components/ApplicationStatus'

export type FormsApplicationStatusDeniedEmailProps = ApplicationStatusWithFeedbackProps

/** After the application was denied; the sender attaches the decision. */
export const formsApplicationStatusDeniedEmail =
  defineApplicationStatusEmail<FormsApplicationStatusDeniedEmailProps>({
    icon: 'error',
    heading: 'Vaša žiadosť bola zamietnutá',
    subject: 'Vaša žiadosť bola zamietnutá',
    preview: ({ applicationName }) => `Žiadosť ${applicationName} bola zamietnutá.`,
    Body: ({ applicationName, frontendUrl }) => (
      <>
        <Paragraph>
          ďakujeme, že ste sa rozhodli podať žiadosť <Strong>{applicationName}</Strong> cez
          Bratislavské konto.
        </Paragraph>
        <Paragraph>
          Žiadosť bola zamietnutá. V prílohe nájdete právoplatné rozhodnutie s odôvodnením
          zamietnutia. Detaily žiadosti si môžete pozrieť aj vo svojom Bratislavskom konte{' '}
          <MyApplicationsSectionLink frontendUrl={frontendUrl} section="odoslane" /> po kliknutí na
          konkrétnu žiadosť.
        </Paragraph>
      </>
    ),
  })

export const renderFormsApplicationStatusDeniedEmail = formsApplicationStatusDeniedEmail.render

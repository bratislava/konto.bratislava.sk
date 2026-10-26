import { Button } from '../../components/Button'
import { Paragraph, Strong } from '../../components/Typography'
import {
  type ApplicationStatusWithEditProps,
  defineApplicationStatusEmail,
  MyApplicationsSectionLink,
} from './components/ApplicationStatus'

export type FormsApplicationStatusErrorTryAgainEmailProps = ApplicationStatusWithEditProps

/** When sending failed and the user has to fix the application. */
export const formsApplicationStatusErrorTryAgainEmail =
  defineApplicationStatusEmail<FormsApplicationStatusErrorTryAgainEmailProps>({
    icon: 'warning',
    heading: 'Chyba pri odosielaní Vašej žiadosti',
    subject: 'Chyba pri odosielaní Vašej žiadosti',
    preview: ({ applicationName }) => `Žiadosť ${applicationName} je potrebné upraviť.`,
    Body: ({ applicationName, frontendUrl, editUrl }) => (
      <>
        <Paragraph>
          pri odosielaní Vašej žiadosti <Strong>{applicationName}</Strong> nastala neočakávaná
          chyba. Prosíme, vráťte sa do svojho Bratislavského konta a upravte žiadosť. Bez toho sa
          jej žiaľ nevieme venovať. Rozpracovanú žiadosť nájdete{' '}
          <MyApplicationsSectionLink frontendUrl={frontendUrl} section="odosiela-sa" />.
        </Paragraph>
        <Button href={editUrl}>Upraviť žiadosť</Button>
      </>
    ),
  })

export const renderFormsApplicationStatusErrorTryAgainEmail =
  formsApplicationStatusErrorTryAgainEmail.render

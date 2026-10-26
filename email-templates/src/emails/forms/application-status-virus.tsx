import { Button } from '../../components/Button'
import { Paragraph, Strong } from '../../components/Typography'
import {
  type ApplicationStatusWithEditProps,
  defineApplicationStatusEmail,
  MyApplicationsSectionLink,
} from './components/ApplicationStatus'

export type FormsApplicationStatusVirusEmailProps = ApplicationStatusWithEditProps

/** When the virus scan found a virus in an attachment of the application. */
export const formsApplicationStatusVirusEmail =
  defineApplicationStatusEmail<FormsApplicationStatusVirusEmailProps>({
    icon: 'warning',
    heading: 'Vo Vašej žiadosti sme našli vírus',
    subject: 'Vo Vašej žiadosti sa nachádza vírus',
    preview: ({ applicationName }) => `V prílohe žiadosti ${applicationName} sme našli vírus.`,
    Body: ({ applicationName, frontendUrl, editUrl }) => (
      <>
        <Paragraph>
          v prílohe, ktorú ste nahrali k žiadosti <Strong>{applicationName}</Strong>, sme našli
          vírus. Prosíme, vráťte sa do svojho Bratislavského konta a nahrajte správne prílohy. Bez
          nich nie je možné žiadosť odoslať a my sa jej žiaľ nebudeme vedieť venovať. Rozpracovanú
          žiadosť nájdete{' '}
          <MyApplicationsSectionLink frontendUrl={frontendUrl} section="odosiela-sa" />.
        </Paragraph>
        <Button href={editUrl}>Nahrať nové prílohy</Button>
      </>
    ),
  })

export const renderFormsApplicationStatusVirusEmail = formsApplicationStatusVirusEmail.render

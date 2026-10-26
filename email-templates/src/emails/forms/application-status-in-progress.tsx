import { Button } from '../../components/Button'
import { Paragraph, Strong } from '../../components/Typography'
import {
  type ApplicationStatusEmailProps,
  defineApplicationStatusEmail,
  getMyApplicationsUrl,
  MyApplicationsSectionLink,
} from './components/ApplicationStatus'

export type FormsApplicationStatusInProgressEmailProps = ApplicationStatusEmailProps

/** When sending the application to the city keeps failing and is retried. */
export const formsApplicationStatusInProgressEmail =
  defineApplicationStatusEmail<FormsApplicationStatusInProgressEmailProps>({
    icon: 'pending',
    heading: 'Na odoslaní Vašej žiadosti usilovne pracujeme',
    subject: 'Na odoslaní Vašej žiadosti pracujeme',
    preview: ({ applicationName }) =>
      `Odoslanie žiadosti ${applicationName} trvá dlhšie než zvyčajne.`,
    Body: ({ applicationName, frontendUrl }) => (
      <>
        <Paragraph>
          ospravedlňujeme sa, že odoslanie Vašej žiadosti <Strong>{applicationName}</Strong> v
          Bratislavskom konte trvá dlhšie než zvyčajne. Chceme Vás však uistiť, že na jej úspešnom
          odoslaní usilovne pracujeme a akonáhle sa tak stane, budeme Vás informovať. Detaily si
          môžete pozrieť vo svojom Bratislavskom konte{' '}
          <MyApplicationsSectionLink frontendUrl={frontendUrl} section="odosiela-sa" />.
        </Paragraph>
        <Button href={getMyApplicationsUrl(frontendUrl, 'odosiela-sa')}>
          Prejsť na Moje žiadosti
        </Button>
      </>
    ),
  })

export const renderFormsApplicationStatusInProgressEmail =
  formsApplicationStatusInProgressEmail.render

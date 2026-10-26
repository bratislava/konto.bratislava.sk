import { Button } from '../../components/Button'
import { Paragraph, Strong } from '../../components/Typography'
import {
  type ApplicationStatusEmailProps,
  defineApplicationStatusEmail,
  getMyApplicationsUrl,
  MyApplicationsSectionLink,
} from './components/ApplicationStatus'

export type FormsApplicationStatusErrorNotSpecifiedEmailProps = ApplicationStatusEmailProps

/** When sending failed for a reason the user cannot fix; the city resolves it. */
export const formsApplicationStatusErrorNotSpecifiedEmail =
  defineApplicationStatusEmail<FormsApplicationStatusErrorNotSpecifiedEmailProps>({
    icon: 'warning',
    heading: 'Chyba pri odosielaní Vašej žiadosti',
    subject: 'Chyba pri odosielaní Vašej žiadosti',
    preview: ({ applicationName }) => `Pri odosielaní žiadosti ${applicationName} nastala chyba.`,
    Body: ({ applicationName, frontendUrl }) => (
      <>
        <Paragraph>
          pri odosielaní Vašej žiadosti <Strong>{applicationName}</Strong> nastala neočakávaná
          chyba. Chceme Vás však uistiť, že na jej úspešnom odoslaní usilovne pracujeme a akonáhle
          žiadosť doručíme našim kolegom a kolegyniam, budú sa venovať jej vybaveniu. Žiadosť
          nájdete <MyApplicationsSectionLink frontendUrl={frontendUrl} section="odosiela-sa" />. O
          ďalšom postupe Vás budeme informovať.
        </Paragraph>
        <Button href={getMyApplicationsUrl(frontendUrl, 'odosiela-sa')}>
          Prejsť na Moje žiadosti
        </Button>
      </>
    ),
  })

export const renderFormsApplicationStatusErrorNotSpecifiedEmail =
  formsApplicationStatusErrorNotSpecifiedEmail.render

import { Button } from '../../../components/Button'
import { Divider } from '../../../components/Divider'
import { Subheading } from '../../../components/Typography'

/** Questionnaire after a submission. Emails show it only when the form has a questionnaire link. */
export const FeedbackRequest = ({ url }: { url: string }) => (
  <>
    <Divider />
    <Subheading>Prosíme, ohodnoťte Vašu skúsenosť a pomôžte nám zlepšovať naše služby.</Subheading>
    <Button href={url}>Vyplniť dotazník</Button>
  </>
)

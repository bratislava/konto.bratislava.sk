import { layoutStrings } from '../i18n/layout-strings'
import { useEmailContext } from '../render/context'
import { Paragraph } from './Typography'

/** "Dobrý deň, Jana," or, without a name, "Dobrý deň,". */
export const Greeting = ({ firstName }: { firstName: string | null }) => {
  const { locale } = useEmailContext()

  return <Paragraph>{layoutStrings[locale].greeting(firstName?.trim() || null)}</Paragraph>
}

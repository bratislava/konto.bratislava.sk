import { Button } from '../../components/Button'
import { CodeBox } from '../../components/CodeBox'
import { Divider } from '../../components/Divider'
import { Greeting } from '../../components/Greeting'
import { StatusIcon } from '../../components/StatusIcon'
import { Heading, Paragraph, Strong, Subheading, TextLink } from '../../components/Typography'
import { defineEmail } from '../../render/define-email'
import type { Brand } from '../../theme/brands'

/**
 * Not sent to anyone: every component in every brand, for reviewing the design system in the
 * preview, the screenshots and Email on Acid.
 */
type LayoutShowcaseProps = { brand: Brand }

const ShowcaseContent = () => (
  <>
    <StatusIcon kind="success" />
    <Heading>Ukážka rozloženia e-mailu</Heading>
    <Greeting firstName="Jana" />
    <Paragraph>
      takto vyzerá bežný odsek textu s <Strong>dôležitou časťou</Strong> a{' '}
      <TextLink href="https://bratislava.sk">odkazom</TextLink>. Text je zarovnaný vľavo a
      riadkovanie zodpovedá webu Bratislavského konta.
    </Paragraph>
    <Button href="https://konto.bratislava.sk">Prejsť do Bratislavského konta</Button>
    <Divider />
    <Subheading>Podnadpis sekcie</Subheading>
    <Paragraph>Jednorazový kód:</Paragraph>
    <CodeBox code="482913" />
    <Paragraph size="small">Menší sekundárny text, napríklad doplňujúce informácie.</Paragraph>
  </>
)

export const layoutShowcaseEmail = defineEmail<LayoutShowcaseProps>({
  brand: ({ brand }) => brand,
  layout: { kind: 'citizen', privacyNotice: 'bratislavske-konto' },
  subject: () => 'Ukážka rozloženia',
  preview: () => 'Všetky komponenty e-mailu na jednom mieste.',
  Content: ShowcaseContent,
})

export const staffLayoutShowcaseEmail = defineEmail<LayoutShowcaseProps & { subject: string }>({
  brand: ({ brand }) => brand,
  layout: { kind: 'staff' },
  subject: ({ subject }) => subject,
  preview: () => 'Rozloženie e-mailov pre zamestnancov.',
  Content: ShowcaseContent,
})

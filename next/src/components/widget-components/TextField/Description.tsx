import { Text } from 'react-aria-components'

import FormMarkdown from '@/src/components/formatting/FormMarkdown/FormMarkdown'

type DescriptionProps = {
  helptext: string
  isMarkdownHelptext?: boolean
}

const Description = ({ helptext, isMarkdownHelptext }: DescriptionProps) => {
  if (isMarkdownHelptext) {
    // TODO add slot="description", use ConditionalFormMarkdown
    return <FormMarkdown>{helptext}</FormMarkdown>
  }

  return <Text slot="description">{helptext}</Text>
}

export default Description

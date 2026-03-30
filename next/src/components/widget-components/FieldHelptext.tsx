import React, { DOMAttributes } from 'react'

import ConditionalFormMarkdown from '@/src/components/formatting/FormMarkdown/ConditionalFormMarkdown'

export type FieldHelptextProps = {
  helptext?: string
  helptextMarkdown?: boolean
  descriptionProps?: DOMAttributes<never>
}

const FieldHelptext = ({
  helptext,
  helptextMarkdown,
  descriptionProps = {},
}: FieldHelptextProps) => {
  if (!helptext) {
    return null
  }

  return (
    <div className="w-full">
      <div {...descriptionProps} className="mt-1 text-16 whitespace-pre-wrap text-gray-700">
        <ConditionalFormMarkdown isMarkdown={helptextMarkdown}>{helptext}</ConditionalFormMarkdown>
      </div>
    </div>
  )
}

export default FieldHelptext

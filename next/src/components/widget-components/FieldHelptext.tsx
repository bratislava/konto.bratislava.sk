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
      <div
        {...descriptionProps}
        className="mt-1 text-size-p-small-r whitespace-pre-wrap text-gray-700 lg:text-size-p-small"
      >
        <ConditionalFormMarkdown isMarkdown={helptextMarkdown}>{helptext}</ConditionalFormMarkdown>
      </div>
    </div>
  )
}

export default FieldHelptext

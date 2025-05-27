import React, { DOMAttributes } from 'react'

import ConditionalFormMarkdown from './ConditionalFormMarkdown'

type FieldHelptextProps = {
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
        className="mt-1 text-p3 whitespace-pre-wrap text-gray-700 sm:text-16"
      >
        <ConditionalFormMarkdown isMarkdown={helptextMarkdown}>{helptext}</ConditionalFormMarkdown>
      </div>
    </div>
  )
}

export default FieldHelptext

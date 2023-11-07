import React, { DOMAttributes } from 'react'

import FormMarkdown from './FormMarkdown'

type FieldHelptextProps = {
  helptext?: string
  descriptionProps?: DOMAttributes<never>
}

const FieldHelptext = ({ helptext, descriptionProps = {} }: FieldHelptextProps) => {
  if (!helptext) {
    return null
  }

  return (
    <div className="w-full">
      <div
        {...descriptionProps}
        className="text-p3 sm:text-16 mt-1 whitespace-pre-wrap text-gray-700"
      >
        <FormMarkdown>{helptext}</FormMarkdown>
      </div>
    </div>
  )
}

export default FieldHelptext

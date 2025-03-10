import React from 'react'

import cn from '../../../frontend/cn'

interface UploadFieldHeaderProps {
  label: string
  htmlFor?: string
  required?: boolean
  helptext?: string
}

const UploadFieldHeader = (props: UploadFieldHeaderProps) => {
  const { label, htmlFor, required, helptext = '' } = props

  // STYLES
  const labelStyle = cn('relative text-p3-semibold text-gray-800 sm:text-16-semibold', {
    'after:absolute after:bottom-0.5 after:ml-0.5 after:text-16-semibold after:text-main-700 after:content-["*"]':
      required,
  })

  const helptextHandler = () =>
    helptext
      .trim()
      .split('\n')
      .map((sentence, i) => <span key={i}>{sentence}</span>)

  return (
    <div className="mb-2 flex flex-col gap-1">
      <div className="flex">
        <label htmlFor={htmlFor} className={labelStyle}>
          {label}
        </label>
        {!required && (
          <span className="ml-2 flex items-center text-p3 leading-5 sm:text-16 sm:leading-6">
            (optional)
          </span>
        )}
      </div>
      {helptext && (
        <div className="flex flex-col text-p3 text-gray-700 sm:text-16">{helptextHandler()}</div>
      )}
    </div>
  )
}

export default UploadFieldHeader

import cx from 'classnames'
import React from 'react'

interface UploadFieldHeaderProps {
  label: string
  htmlFor?: string
  required?: boolean
  helptext?: string
}

const UploadFieldHeader = (props: UploadFieldHeaderProps) => {
  const { label, htmlFor, required, helptext = '' } = props

  // STYLES
  const labelStyle = cx('text-p3-semibold sm:text-16-semibold relative text-gray-800', {
    'after:text-16-semibold after:absolute after:bottom-0.5 after:ml-0.5 after:text-main-700 after:content-["*"]':
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
          <span className="text-p3 sm:text-16 ml-2 flex items-center leading-5 sm:leading-6">
            (optional)
          </span>
        )}
      </div>
      {helptext && (
        <div className="text-p3 sm:text-16 flex flex-col text-gray-700">{helptextHandler()}</div>
      )}
    </div>
  )
}

export default UploadFieldHeader

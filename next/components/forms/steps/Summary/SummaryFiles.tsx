import React from 'react'

import { useFormFileUpload } from '../../useFormFileUpload'

type SummaryFileProps = {
  file: string
}

const SummaryFile = ({ file }: SummaryFileProps) => {
  const { getFileInfoById } = useFormFileUpload()
  const fileInfo = getFileInfoById(file)

  return <>{fileInfo.fileName}</>
}

type SummaryFilesProps = {
  files: string | string[]
}

const SummaryFiles = ({ files }: SummaryFilesProps) => {
  const filesArray = Array.isArray(files) ? files : [files]

  return (
    <>
      {filesArray.map((file) => (
        <SummaryFile file={file} />
      ))}
    </>
  )
}

export default SummaryFiles

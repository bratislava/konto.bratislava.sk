import React from 'react'
import { VisuallyHidden } from 'react-aria'
import { Button as ReactAriaButton, FileTrigger } from 'react-aria-components'

import { useFormExportImport } from '@/frontend/hooks/useFormExportImport'

const FormUploadXmlJson = () => {
  const { importXmlButtonRef, handleImportXml, importJsonButtonRef, handleImportJson } =
    useFormExportImport()

  return (
    <VisuallyHidden>
      <FileTrigger onSelect={handleImportXml} acceptedFileTypes={['.xml']} allowsMultiple={false}>
        <ReactAriaButton ref={importXmlButtonRef} />
      </FileTrigger>
      <FileTrigger onSelect={handleImportJson} acceptedFileTypes={['.json']} allowsMultiple={false}>
        <ReactAriaButton ref={importJsonButtonRef} />
      </FileTrigger>
    </VisuallyHidden>
  )
}

export default FormUploadXmlJson

import React from 'react'
import { VisuallyHidden } from 'react-aria/VisuallyHidden'
import { Button as ReactAriaButton } from 'react-aria-components/Button'
import { FileTrigger } from 'react-aria-components/FileTrigger'

import { useFormExportImport } from '@/src/frontend/hooks/useFormExportImport'

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

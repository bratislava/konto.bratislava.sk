import React from 'react'
import { VisuallyHidden } from 'react-aria'
import { Button as ReactAriaButton, FileTrigger } from 'react-aria-components'

import { useFormExportImport } from '../../frontend/hooks/useFormExportImport'

const FormUploadXml = () => {
  const { importXmlButtonRef, handleImportXml } = useFormExportImport()

  return (
    <VisuallyHidden>
      <FileTrigger onSelect={handleImportXml} acceptedFileTypes={['.xml']} allowsMultiple={false}>
        <ReactAriaButton ref={importXmlButtonRef} />
      </FileTrigger>
    </VisuallyHidden>
  )
}

export default FormUploadXml

import React, { useRef } from 'react'
import { VisuallyHidden } from 'react-aria'
import { Button as ReactAriaButton, FileTrigger } from 'react-aria-components'

import { useFormExportImport } from '../../frontend/hooks/useFormExportImport'

const FormUploadXml = () => {
  const fileTriggerRef = useRef<HTMLInputElement>(null)
  const { importXmlButtonRef, handleImportXml } = useFormExportImport()

  const handleOnChange = (files: FileList | null) => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    handleImportXml(files)

    // If this is not done, selecting the same file again after the first upload will not trigger the onChange event,
    // as the browser does not consider this a change in the input field's state.
    // https://stackoverflow.com/a/60887378
    if (fileTriggerRef.current) {
      fileTriggerRef.current.value = ''
    }
  }

  return (
    <VisuallyHidden>
      <FileTrigger
        onChange={handleOnChange}
        acceptedFileTypes={['.xml']}
        allowsMultiple={false}
        ref={fileTriggerRef}
      >
        <ReactAriaButton ref={importXmlButtonRef} />
      </FileTrigger>
    </VisuallyHidden>
  )
}

export default FormUploadXml

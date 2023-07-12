import React, { ComponentProps, useState } from 'react'
import { v4 as createUuid } from 'uuid'

import {
  FormFileUploadFileInfo,
  FormFileUploadStatusEnum,
} from '../../../frontend/types/formFileUploadTypes'
import Checkbox from '../../forms/widget-components/Checkbox/Checkbox'
import CheckboxGroup from '../../forms/widget-components/Checkbox/CheckboxGroup'
import Upload from '../../forms/widget-components/Upload/Upload'
import UploadFileCard from '../../forms/widget-components/Upload/UploadFileCard'
import { Stack } from '../Stack'
import { Wrapper } from '../Wrapper'

const UploadWrapped = ({
  multiple,
  ...props
}: Omit<ComponentProps<typeof Upload>, 'getFileInfoById'>) => {
  const [value, setValue] = useState<string[]>([])
  const [filesMap, setFilesMap] = useState<Record<string, File>>({})
  const handleUpload = (newFiles: File[]) => {
    newFiles.forEach((file) => {
      const id = createUuid()
      setFilesMap((prev) => ({ ...prev, [id]: file }))

      if (multiple) {
        setValue((prev) => (prev ? [...prev, id] : [id]))
      } else {
        setValue([id])
      }
    })
  }

  const [prevMultiple, setPrevMultiple] = useState(multiple)
  if (prevMultiple !== multiple) {
    setPrevMultiple(multiple)
    setValue([])
  }

  const valueMapped = multiple ? value : value?.[0] ?? null

  const getFileInfoById = (id: string) => {
    const file = filesMap[id]
    if (!file) {
      return {
        status: { type: FormFileUploadStatusEnum.UnknownFile },
        fileName: id,
      } as FormFileUploadFileInfo
    }

    return {
      status: { type: FormFileUploadStatusEnum.ScanDone },
      fileName: file.name,
    } as FormFileUploadFileInfo
  }

  const handleFileRemove = (id: string) => {
    setValue((prev) => prev?.filter((item) => item !== id) ?? null)
  }

  return (
    <Upload
      {...props}
      multiple={multiple}
      value={valueMapped}
      onUpload={handleUpload}
      onFileRemove={handleFileRemove}
      getFileInfoById={getFileInfoById}
    />
  )
}

/**
 * Size limit doesn't do anything in showcase as it's handled by upload service.
 */
const UploadShowCase = () => {
  const [checkboxValue, setCheckboxValue] = useState<string[]>([])
  const multiple = checkboxValue.includes('multiple')

  return (
    <Wrapper title="Upload" direction="column">
      <Stack direction="column">
        <UploadFileCard
          fileInfo={{
            fileName: 'test.jpg',
            status: { type: FormFileUploadStatusEnum.UploadQueued },
          }}
        />

        <UploadFileCard
          fileInfo={{
            fileName: 'test.jpg',
            status: { type: FormFileUploadStatusEnum.Uploading, progress: 50 },
          }}
        />
        <UploadFileCard
          fileInfo={{
            fileName: 'test.jpg',
            status: {
              type: FormFileUploadStatusEnum.UploadError,
              error: 'Retryable error',
              canRetry: true,
            },
          }}
        />
        <UploadFileCard
          fileInfo={{
            fileName: 'test.jpg',
            status: {
              type: FormFileUploadStatusEnum.UploadError,
              error: 'Nonretryable error',
              canRetry: false,
            },
          }}
        />
        <UploadFileCard
          fileInfo={{
            fileName: 'test.jpg',
            status: { type: FormFileUploadStatusEnum.UploadDone },
          }}
        />
        <UploadFileCard
          fileInfo={{
            fileName: 'test.jpg',
            status: { type: FormFileUploadStatusEnum.UnknownFile },
          }}
        />
        <UploadFileCard
          fileInfo={{
            fileName: 'test.jpg',
            status: { type: FormFileUploadStatusEnum.Scanning },
          }}
        />
        <UploadFileCard
          fileInfo={{
            fileName: 'test.jpg',
            status: { type: FormFileUploadStatusEnum.ScanError },
          }}
        />
        <UploadFileCard
          fileInfo={{
            fileName: 'test.jpg',
            status: { type: FormFileUploadStatusEnum.ScanDone },
          }}
        />
        <UploadFileCard
          fileInfo={{
            fileName: 'test.jpg',
            status: { type: FormFileUploadStatusEnum.ScanInfected },
          }}
        />
      </Stack>
      <Stack>
        <CheckboxGroup value={checkboxValue} onChange={setCheckboxValue} label="Is multiple?">
          <Checkbox value="multiple">Multiple</Checkbox>
        </CheckboxGroup>
      </Stack>
      <Stack>
        <UploadWrapped type="button" multiple={multiple} />
        <UploadWrapped type="button" disabled multiple={multiple} />
      </Stack>
      <Stack direction="column">
        <UploadWrapped
          type="button"
          sizeLimit={5}
          supportedFormats={['.jpg', '.png', '.pdf']}
          multiple={multiple}
        />
        <UploadWrapped type="button" sizeLimit={5} multiple={multiple} />
        <UploadWrapped
          type="button"
          supportedFormats={['.jpg', '.png', '.pdf']}
          multiple={multiple}
        />
        <UploadWrapped
          type="button"
          sizeLimit={5}
          supportedFormats={['.jpg', '.png', '.pdf']}
          disabled
          multiple={multiple}
        />
      </Stack>
      <Stack direction="column">
        <UploadWrapped type="dragAndDrop" multiple={multiple} />
        <UploadWrapped type="dragAndDrop" disabled multiple={multiple} />
      </Stack>
      <Stack direction="column">
        <UploadWrapped
          type="dragAndDrop"
          sizeLimit={5}
          supportedFormats={['.jpg', '.png', '.pdf']}
          multiple={multiple}
        />
        <UploadWrapped type="dragAndDrop" sizeLimit={5} multiple={multiple} />
        <UploadWrapped
          type="dragAndDrop"
          supportedFormats={['.jpg', '.png', '.pdf']}
          multiple={multiple}
        />
        <UploadWrapped
          type="dragAndDrop"
          sizeLimit={5}
          supportedFormats={['.jpg', '.png', '.pdf']}
          disabled
          multiple={multiple}
        />
      </Stack>
    </Wrapper>
  )
}

export default UploadShowCase

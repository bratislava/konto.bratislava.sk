import prettyBytes from 'pretty-bytes'
import React, { ComponentProps, useState } from 'react'
import { v4 as createUuid } from 'uuid'

import {
  FormFileUploadFileInfo,
  FormFileUploadStatusEnum,
  UploadErrors,
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
            canDownload: false,
            fileSize: 5_000_000,
          }}
        />

        <UploadFileCard
          fileInfo={{
            fileName: 'test.jpg',
            status: { type: FormFileUploadStatusEnum.Uploading, progress: 50 },
            canDownload: false,
            fileSize: 5_000_000,
          }}
        />
        <UploadFileCard
          fileInfo={{
            fileName: 'test.jpg',
            status: { type: FormFileUploadStatusEnum.Uploading, progress: 1 },
            canDownload: false,
            fileSize: 5_000_000,
          }}
        />
        <UploadFileCard
          fileInfo={{
            fileName: 'test.jpg',
            status: { type: FormFileUploadStatusEnum.Uploading, progress: 100 },
            canDownload: false,
            fileSize: 5_000_000,
          }}
        />
        <UploadFileCard
          fileInfo={{
            fileName: 'test.jpg',
            status: {
              type: FormFileUploadStatusEnum.UploadServerError,
              error: { rawError: 'Retryable error' },
              canRetry: true,
            },
            canDownload: false,
            fileSize: 5_000_000,
          }}
        />
        <UploadFileCard
          fileInfo={{
            fileName: 'test.jpg',
            status: {
              type: FormFileUploadStatusEnum.UploadServerError,
              error: { rawError: 'Nonretryable error' },
              canRetry: false,
            },
            canDownload: false,
            fileSize: 5_000_000,
          }}
        />
        <UploadFileCard
          fileInfo={{
            fileName: 'test.jpg',
            status: { type: FormFileUploadStatusEnum.UploadDone },
            canDownload: true,
            fileSize: 5_000_000,
          }}
        />
        <UploadFileCard
          fileInfo={{
            fileName: 'test.jpg',
            status: { type: FormFileUploadStatusEnum.UnknownFile },
            canDownload: false,
            fileSize: null,
          }}
        />
        <UploadFileCard
          fileInfo={{
            fileName: 'test.jpg',
            status: { type: FormFileUploadStatusEnum.Scanning },
            canDownload: true,
            fileSize: 5_000_000,
          }}
        />
        <UploadFileCard
          fileInfo={{
            fileName: 'test.jpg',
            status: { type: FormFileUploadStatusEnum.ScanError },
            canDownload: false,
            fileSize: 5_000_000,
          }}
        />
        <UploadFileCard
          fileInfo={{
            fileName: 'test.jpg',
            status: { type: FormFileUploadStatusEnum.ScanDone },
            canDownload: true,
            fileSize: 5_000_000,
          }}
        />
        <UploadFileCard
          fileInfo={{
            fileName: 'test.jpg',
            status: { type: FormFileUploadStatusEnum.ScanInfected },
            canDownload: false,
            fileSize: 5_000_000,
          }}
        />
        <UploadFileCard
          fileInfo={{
            fileName: 'test.jpg',
            status: {
              type: FormFileUploadStatusEnum.UploadError,
              error: { translationKey: UploadErrors.LargeFile, additionalParam: prettyBytes(1000) },
              canRetry: false,
            },
            canDownload: false,
            fileSize: 5_000_000,
          }}
        />
        <UploadFileCard
          fileInfo={{
            fileName: 'test.jpg',
            status: {
              type: FormFileUploadStatusEnum.UploadError,
              error: {
                translationKey: UploadErrors.InvalidFileType,
                additionalParam: ['.jpg', '.png', '.wtf'].join(', '),
              },
              canRetry: false,
            },
            canDownload: false,
            fileSize: 5_000_000,
          }}
        />
      </Stack>
      <Stack>
        <CheckboxGroup value={checkboxValue} onChange={setCheckboxValue} label="Is multiple?">
          <Checkbox value="multiple">Multiple</Checkbox>
        </CheckboxGroup>
      </Stack>
      <Stack>
        <UploadWrapped label="Upload" type="button" multiple={multiple} />
        <UploadWrapped label="Upload" type="button" disabled multiple={multiple} />
      </Stack>
      <Stack direction="column">
        <UploadWrapped
          label="Upload"
          type="button"
          sizeLimit={5}
          supportedFormats={['.jpg', '.png', '.pdf']}
          multiple={multiple}
        />
        <UploadWrapped label="Upload" type="button" sizeLimit={5} multiple={multiple} />
        <UploadWrapped
          label="Upload"
          type="button"
          supportedFormats={['.jpg', '.png', '.pdf']}
          multiple={multiple}
        />
        <UploadWrapped
          label="Upload"
          type="button"
          sizeLimit={5}
          supportedFormats={['.jpg', '.png', '.pdf']}
          disabled
          multiple={multiple}
        />
      </Stack>
      <Stack direction="column">
        <UploadWrapped label="Upload" type="dragAndDrop" multiple={multiple} />
        <UploadWrapped label="Upload" type="dragAndDrop" disabled multiple={multiple} />
      </Stack>
      <Stack direction="column">
        <UploadWrapped
          label="Upload"
          type="dragAndDrop"
          sizeLimit={5}
          supportedFormats={['.jpg', '.png', '.pdf']}
          multiple={multiple}
        />
        <UploadWrapped label="Upload" type="dragAndDrop" sizeLimit={5} multiple={multiple} />
        <UploadWrapped
          label="Upload"
          type="dragAndDrop"
          supportedFormats={['.jpg', '.png', '.pdf']}
          multiple={multiple}
        />
        <UploadWrapped
          label="Upload"
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

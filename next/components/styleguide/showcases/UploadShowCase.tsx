import {
  FileInfo,
  FileStatusType,
  UploadClientErrorReasonType,
} from 'forms-shared/form-files/fileStatus'
import React, { ComponentProps, useState } from 'react'
import { v4 as createUuid } from 'uuid'

import Checkbox from '../../forms/widget-components/Checkbox/Checkbox'
import CheckboxGroup from '../../forms/widget-components/Checkbox/CheckboxGroup'
import Upload from '../../forms/widget-components/Upload/Upload'
import UploadFileCard from '../../forms/widget-components/Upload/UploadFileCard'
import { Stack } from '../Stack'
import { Wrapper } from '../Wrapper'

const mockAbortController = new AbortController()

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
        status: { type: FileStatusType.UnknownFile },
        fileName: id,
      } as FileInfo
    }

    return {
      status: { type: FileStatusType.ScanDone },
      fileName: file.name,
    } as FileInfo
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
            status: { type: FileStatusType.UploadQueued },
            fileSize: 5_000_000,
          }}
        />

        <UploadFileCard
          fileInfo={{
            fileName: 'test.jpg',
            status: {
              type: FileStatusType.Uploading,
              progress: 50,
              abortController: mockAbortController,
            },
            fileSize: 5_000_000,
          }}
        />
        <UploadFileCard
          fileInfo={{
            fileName: 'test.jpg',
            status: {
              type: FileStatusType.Uploading,
              progress: 1,
              abortController: mockAbortController,
            },
            fileSize: 5_000_000,
          }}
        />
        <UploadFileCard
          fileInfo={{
            fileName: 'test.jpg',
            status: {
              type: FileStatusType.Uploading,
              progress: 100,
              abortController: mockAbortController,
            },
            fileSize: 5_000_000,
          }}
        />
        <UploadFileCard
          fileInfo={{
            fileName: 'test.jpg',
            status: {
              type: FileStatusType.UploadServerError,
              error: new Error('Retryable error'),
              canRetry: true,
            },
            fileSize: 5_000_000,
          }}
        />
        <UploadFileCard
          fileInfo={{
            fileName: 'test.jpg',
            status: {
              type: FileStatusType.UploadServerError,
              error: new Error('Non-retryable error'),
              canRetry: false,
            },
            fileSize: 5_000_000,
          }}
        />
        <UploadFileCard
          fileInfo={{
            fileName: 'test.jpg',
            status: { type: FileStatusType.WaitingForScan },
            fileSize: 5_000_000,
          }}
        />
        <UploadFileCard
          fileInfo={{
            fileName: 'test.jpg',
            status: { type: FileStatusType.UnknownFile },
            fileSize: null,
          }}
        />
        <UploadFileCard
          fileInfo={{
            fileName: 'test.jpg',
            status: { type: FileStatusType.Scanning },
            fileSize: 5_000_000,
          }}
        />
        <UploadFileCard
          fileInfo={{
            fileName: 'test.jpg',
            status: { type: FileStatusType.ScanError },
            fileSize: 5_000_000,
          }}
        />
        <UploadFileCard
          fileInfo={{
            fileName: 'test.jpg',
            status: { type: FileStatusType.ScanDone },
            fileSize: 5_000_000,
          }}
        />
        <UploadFileCard
          fileInfo={{
            fileName: 'test.jpg',
            status: { type: FileStatusType.ScanInfected },
            fileSize: 5_000_000,
          }}
        />
        <UploadFileCard
          fileInfo={{
            fileName: 'test.jpg',
            status: {
              type: FileStatusType.UploadClientError,
              reason: { type: UploadClientErrorReasonType.LargeFile, maxFileSize: 1000 },
              canRetry: false,
            },
            fileSize: 5_000_000,
          }}
        />
        <UploadFileCard
          fileInfo={{
            fileName: 'test.jpg',
            status: {
              type: FileStatusType.UploadClientError,
              reason: {
                type: UploadClientErrorReasonType.InvalidFileType,
                supportedFormats: ['.jpg', '.png', '.wtf'],
              },
              canRetry: false,
            },
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

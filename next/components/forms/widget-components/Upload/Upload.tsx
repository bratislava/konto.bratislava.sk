import { UploadMinioFile } from '@backend/dtos/minio/upload-minio-file.dto'
import cx from 'classnames'
import FieldErrorMessage from 'components/forms/info-components/FieldErrorMessage'
import React, { ForwardedRef, forwardRef, ForwardRefRenderFunction, useEffect, useState } from 'react'
import { v4 as createUuid } from 'uuid'

import { deleteFileFromBucket, scanFile, uploadFileToBucket } from '../../../../frontend/api/api'
import { FileScan } from '../../../../frontend/dtos/formStepperDto'
import logger from '../../../../frontend/utils/logger'
import UploadBrokenMessages, { MINIO_ERROR } from '../../info-components/UploadBrokenMessages'
import UploadFieldHeader from '../../info-components/UploadFieldHeader'
import UploadButton from './UploadButton'
import UploadDropArea from './UploadDropArea'
import UploadedFilesList from './UploadedFilesList'



interface UploadProps {
  type: 'button' | 'dragAndDrop'
  label?: string
  required?: boolean
  multiple?: boolean
  value?: UploadMinioFile[]
  helptext?: string
  disabled?: boolean
  sizeLimit?: number
  supportedFormats?: string[]
  className?: string
  onChange?: (value: UploadMinioFile[]) => void
  errorMessage?: string[]
  // info for uploading, if not set it will be parsed from bucketFolderName
  formId?: string
  pospId?: string
  // name of folder in Bucket where files will be saved
  bucketFolderName?: string
  // file info for Summary
  fileScans?: FileScan[]
  onChangeFileScans?: (newFileScans: FileScan[], removeFileScans: FileScan[]) => void
}

const getBucketFileName = (file: File, folderName?: string) => {
  const extension = file.type.split("/").pop()
  const newName = folderName ? `${folderName}/${createUuid()}.${extension || ''}` : `${createUuid()}.${extension || ''}`
  return new File([file], newName, {
    type: file.type,
    lastModified: file.lastModified,
  })
}

const UploadComponent: ForwardRefRenderFunction<HTMLDivElement, UploadProps> = (
  props: UploadProps,
  ref: ForwardedRef<HTMLDivElement>,
) => {
  const {
    type,
    label,
    required,
    multiple,
    value,
    helptext,
    disabled,
    sizeLimit,
    supportedFormats,
    className,
    onChange,
    errorMessage,
    pospId,
    formId,
    bucketFolderName,
    fileScans,
    onChangeFileScans
  }: UploadProps = props

  const [fileBrokenMessages, setFileBrokenMessages] = useState<string[]>([])

  const startScanFiles = async (newFileScans: FileScan[]) => {
    const parsedBucketName: string[]|undefined = bucketFolderName?.split("/")
    const requestPospId: string|undefined = pospId ?? parsedBucketName?.[1]
    const requestFormId: string|undefined = formId ?? parsedBucketName?.[2]
    return Promise.all(
      newFileScans.map(async (scan) => {
        await scanFile(requestPospId, requestFormId, "a", scan.fileName)
      })
    )
  }

  useEffect(() => {
    const newFileScans: FileScan[] = value
      ? value.map(minioFile => {
        const oldFileScan = fileScans?.find(fileScan => fileScan.fileName === minioFile.file.name)
        return {
          originalName: minioFile.originalName,
          fileName: minioFile.file.name,
          fileState: oldFileScan ? oldFileScan.fileState : "scan"
        }})
      : []
    const removeFileScans: FileScan[] = fileScans
      ? fileScans.filter(oldScan => newFileScans?.every(newScan => newScan.fileName !== oldScan.fileName))
      : []

    startScanFiles(newFileScans)
      .finally(() => {
        onChangeFileScans?.(newFileScans, removeFileScans)
      })
      .catch((error) => {
        logger.error(error)
      })

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  const emitOnChange = (newFiles: UploadMinioFile[], oldFiles?: UploadMinioFile[]) => {
    const changedValue = multiple && oldFiles ? [...oldFiles, ...newFiles] : [...newFiles]
    onChange?.(changedValue)
  }

  const removeFileOnClient = (fileName: string) => {
    const updatedFiles = value ? value.filter((minioFile) => minioFile.file.name !== fileName) : []
    emitOnChange(updatedFiles)
  }

  const setMinioError = () => {
    if (fileBrokenMessages.includes(String(MINIO_ERROR))) {
      setFileBrokenMessages([...fileBrokenMessages, MINIO_ERROR])
    }
  }

  const removeFirstFile = () => {
    if (!value) return
    const fileName = value[0].file.name

    removeFileOnClient(fileName)
    deleteFileFromBucket(fileName)
      .catch((error) => {
        setMinioError()
        logger.error(error)
      })
  }

  const isFileInSizeLimit = (file: File) => {
    const mbSize = file.size / (1024 * 1024)
    return !(sizeLimit && mbSize > sizeLimit)
  }

  const isFileInSupportedFormats = (file: File) => {
    if (!supportedFormats) return true

    const lastIndex = file.name.lastIndexOf('.')
    if (!lastIndex) return false

    const fileExtension = file.name.slice(lastIndex)
    return supportedFormats.includes(fileExtension)
  }

  const sanitizeClientFiles = (minioFiles: UploadMinioFile[]) => {
    const messages: string[] = []
    const chosenFiles: UploadMinioFile[] = []

    minioFiles.forEach((minioFile) => {
      if (!isFileInSupportedFormats(minioFile.file)) {
        messages.push(`${minioFile.file.name} has wrong extension.`)
      } else if (!isFileInSizeLimit(minioFile.file)) {
        messages.push(`${minioFile.file.name} is too large.`)
      } else {
        const sanitizedFile: UploadMinioFile = {
          file: getBucketFileName(minioFile.file, bucketFolderName),
          isUploading: true,
          originalName: minioFile.originalName,
        }
        chosenFiles.push(sanitizedFile)
      }
    })

    setFileBrokenMessages(messages)
    return chosenFiles
  }

  const addNewFiles = (newFiles: UploadMinioFile[]) => {
    const sanitizedFiles = sanitizeClientFiles(newFiles)
    if (multiple && value && value[0]) {
      removeFirstFile()
    }
    emitOnChange(sanitizedFiles, value)

    sanitizedFiles.forEach((minioFile, id) => {
      uploadFileToBucket(minioFile.file)
        .catch((error) => {
          setMinioError()
          logger.error(error)
          sanitizedFiles[id].errorMessage = 'File not uploaded'
        })
        .finally(() => {
          sanitizedFiles[id].isUploading = false
          emitOnChange(sanitizedFiles, value)
        })
        // finally can throw error
        .catch((error) => {
          setMinioError()
          logger.error(error)
        })
    })
  }

  const handleOnClickUpload = () => {
    if (disabled) return

    const uploadInput = document.createElement('input')
    uploadInput.type = 'file'
    uploadInput.multiple = multiple === undefined ? false : multiple
    uploadInput.accept = supportedFormats?.toString() || ''

    uploadInput.addEventListener('change', () => {
      if (!uploadInput.files) return
      const newFiles = Array.from(uploadInput.files, (file) => {
        return { file, originalName: file.name }
      })
      addNewFiles(newFiles)
    })

    uploadInput.click()
  }

  const handleOnDrop = (newFiles: UploadMinioFile[]) => {
    addNewFiles(newFiles)
  }

  const handleOnRemoveFile = (id: number) => {
    if (!value) return
    const fileName = value[id].file.name

    removeFileOnClient(fileName)
    deleteFileFromBucket(fileName)
      .catch((error) => {
        setMinioError()
        logger.error(error)
      })
  }

  // RENDER
  return (
    <section
      className={cx('select-none w-fit h-fit', className)}
      style={{ transition: '0.2 all linear' }}
    >
      <UploadFieldHeader label={label ?? ''} required={required} helptext={helptext} />
      {
        /* UPLOAD AREA */
        type === 'button' ? (
          <UploadButton
            ref={ref}
            value={value}
            sizeLimit={sizeLimit}
            supportedFormats={supportedFormats}
            disabled={disabled}
            fileBrokenMessage={fileBrokenMessages}
            onClick={handleOnClickUpload}
          />
        ) : type === 'dragAndDrop' ? (
          <UploadDropArea
            ref={ref}
            multiple={multiple}
            value={value}
            sizeLimit={sizeLimit}
            supportedFormats={supportedFormats}
            disabled={disabled}
            fileBrokenMessage={fileBrokenMessages}
            onClick={handleOnClickUpload}
            onDrop={handleOnDrop}
          />
        ) : null
      }
      <UploadBrokenMessages fileBrokenMessages={fileBrokenMessages} />
      <UploadedFilesList allFiles={value} handleOnRemoveFile={handleOnRemoveFile} />
      {!disabled && <FieldErrorMessage errorMessage={errorMessage} />}
    </section>
  )
}

const Upload = forwardRef<HTMLDivElement, UploadProps>(UploadComponent)

export default Upload

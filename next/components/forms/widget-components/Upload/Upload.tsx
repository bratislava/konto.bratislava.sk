import { filesApi } from '@backend/client/client-forms'
import { UploadMinioFile } from '@backend/dtos/minio/upload-minio-file.dto'
import cx from 'classnames'
import FieldErrorMessage from 'components/forms/info-components/FieldErrorMessage'
import React, { ForwardedRef, forwardRef, ForwardRefRenderFunction, useState } from 'react'
import { v4 as createUuid } from 'uuid'

import { deleteFileFromBucket, uploadFileToBucket } from '../../../../frontend/api/api'
import { FileScan } from '../../../../frontend/dtos/formStepperDto'
import useAccount from '../../../../frontend/hooks/useAccount'
import logger, { developmentLog } from '../../../../frontend/utils/logger'
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
  errorMessage?: string[]
  isScanningAllowed?: boolean
  // info for file scanning, if not set it will throw error later
  userExternalId?: string
  // info for file scanning, if not set it will be parsed from bucketFolderName
  formId?: string
  pospId?: string
  // name of folder in Bucket where files will be saved
  bucketFolderName?: string
  // file info for Summary
  fileScans?: FileScan[]
  onChange?: (value: UploadMinioFile[]) => void
  onUpdateFileScans?: (newFileScans: FileScan[], removeFileScan?: FileScan | null) => void
  onRemoveFileScan?: (removeScan?: FileScan) => void
}

const getBucketFileName = (file: File, folderName?: string) => {
  const extension = file.type.split('/').pop()
  const newName = folderName
    ? `${folderName}/${createUuid()}.${extension || ''}`
    : `${createUuid()}.${extension || ''}`
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
    isScanningAllowed = true,
    userExternalId,
    pospId,
    formId,
    bucketFolderName,
    fileScans,
    onUpdateFileScans,
    onRemoveFileScan,
  }: UploadProps = props

  const [fileBrokenMessages, setFileBrokenMessages] = useState<string[]>([])
  const { getAccessToken } = useAccount()

  const startScanFiles = async (newFileScans: FileScan[]): Promise<FileScan[]> => {
    const token = await getAccessToken()
    const parsedBucketName: string[] | undefined = bucketFolderName?.split('/')

    const updatedFileScans: FileScan[] = await Promise.all(
      newFileScans.map(async (scan) => {
        return filesApi
          .filesControllerPostFileToScanner(
            {
              pospId: pospId ?? (parsedBucketName?.[1] as string),
              formId: formId ?? (parsedBucketName?.[2] as string),
              userExternalId: userExternalId as string,
              fileUid: scan.fileName.split('/').pop() as string,
            },
            { accessToken: token },
          )
          .then((response) => {
            developmentLog('SCAN', scan)
            developmentLog('SCAN RESPONSE', response.data)
            return { ...scan, fileStateStatus: response.data.status, scanId: response.data.id }
          })
          .catch((error) => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            logger.error('Failed /scan/file:', error, error.message, error.error, error.statusCode)
            return { ...scan, fileState: 'error' }
          })
      }),
    )

    return updatedFileScans.filter((scan) => scan.fileState !== 'error' || !scan.scanId)
  }

  const scanAllNewFiles = (
    newFiles: UploadMinioFile[],
    currentFileScans: FileScan[],
    removeFileScan?: FileScan | null,
  ) => {
    if (!isScanningAllowed) return

    const newFileScans: FileScan[] = newFiles.map((minioFile) => {
      const oldFileScan = currentFileScans?.find(
        (fileScan) => fileScan.fileName === minioFile.file.name,
      )
      return {
        originalName: minioFile.originalName,
        fileName: minioFile.file.name,
        fileState: oldFileScan ? oldFileScan.fileState : 'scan',
      }
    })

    startScanFiles(newFileScans)
      .then((scannedNewFiles: FileScan[]) => {
        onUpdateFileScans?.(scannedNewFiles, removeFileScan)
        return true
      })
      .catch((error) => {
        logger.error(error)
      })
  }

  const emitOnChange = (newFiles: UploadMinioFile[], oldFiles?: UploadMinioFile[]) => {
    const changedValue = multiple && oldFiles ? [...oldFiles, ...newFiles] : [...newFiles]
    onChange?.(changedValue)
  }

  const removeFileOnClient = (fileName: string) => {
    const updatedFiles = value ? value.filter((minioFile) => minioFile.file.name !== fileName) : []
    emitOnChange(updatedFiles)
    const removeScan = fileScans?.find((fileScan) => fileScan.fileName === fileName)
    onRemoveFileScan?.(removeScan)
  }

  const setMinioError = () => {
    if (fileBrokenMessages.includes(String(MINIO_ERROR))) {
      setFileBrokenMessages([...fileBrokenMessages, MINIO_ERROR])
    }
  }

  const removeFileOnServer = async (fileName: string, scanId: string) => {
    const token = await getAccessToken()

    const fileStateStatus = await filesApi
      .filesControllerGetFileScanStatus(scanId, { accessToken: token })
      .then((response) => response.data.status)
      .catch((error) => {
        logger.error('Fetch scan file statuses failed', error)
        return 'NOT FOUND' as const
      })

    await deleteFileFromBucket(fileName, fileStateStatus).catch((error) => {
      setMinioError()
      logger.error('Delete from bucket failed', error)
    })

    await filesApi.filesControllerDeleteFile(fileName, { accessToken: token }).catch((error) => {
      setMinioError()
      logger.error('Delete file scan from server failed', error)
    })
  }

  const handleOnRemoveFile = async (id: number) => {
    const valueFileName = value?.[id].file.name
    const fileScan = fileScans?.[id]
    if (!valueFileName || !fileScan || fileScan.fileName !== valueFileName || !fileScan.scanId)
      return null

    removeFileOnClient(valueFileName)
    await removeFileOnServer(valueFileName, fileScan.scanId)

    return valueFileName
  }

  const removeFirstFile = async () => {
    const valueFileName = value?.[0].file.name
    const fileScan = fileScans?.[0]
    if (!valueFileName || !fileScan || fileScan.fileName !== valueFileName || !fileScan.scanId)
      return null

    await removeFileOnServer(valueFileName, fileScan.scanId)

    return fileScan
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

  const addNewFiles = async (newFiles: UploadMinioFile[]) => {
    const sanitizedFiles = sanitizeClientFiles(newFiles)
    let oldFiles = value ? [...value] : []
    let currentFileScans: FileScan[] = fileScans ?? []
    let removeFileScan: FileScan | undefined | null
    if (!multiple && oldFiles.length === 1) {
      oldFiles = []
      emitOnChange(sanitizedFiles, oldFiles)
      removeFileScan = await removeFirstFile()
      currentFileScans = currentFileScans.filter(
        (fileScan) => fileScan.fileName !== removeFileScan?.fileName,
      )
    } else {
      emitOnChange(sanitizedFiles, oldFiles)
    }

    const uploadFiles = await Promise.all(
      sanitizedFiles.map((minioFile: UploadMinioFile) => {
        return uploadFileToBucket(minioFile.file)
          .then(() => {
            return { ...minioFile, isUploading: false } as UploadMinioFile
          })
          .catch((error) => {
            setMinioError()
            logger.error(error)
            return {
              ...minioFile,
              errorMessage: 'File not uploaded',
              isUploading: false,
            } as UploadMinioFile
          })
      }),
    )

    emitOnChange(uploadFiles, oldFiles)
    scanAllNewFiles(uploadFiles, currentFileScans, removeFileScan)
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
      addNewFiles(newFiles).catch((error) => logger.error('ADD NEW FILES FAILED', error))
    })

    uploadInput.click()
  }

  const handleOnDrop = async (newFiles: UploadMinioFile[]) => {
    await addNewFiles(newFiles)
  }

  // RENDER
  return (
    <section
      className={cx('select-none w-full h-fit', className)}
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

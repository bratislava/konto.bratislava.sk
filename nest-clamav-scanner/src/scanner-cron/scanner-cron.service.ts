import { Injectable, Logger, PreconditionFailedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Cron } from '@nestjs/schedule'
import { Files, FileStatus } from '@prisma/client'
import { Readable as ReadableStream } from 'stream'

import { ClamavClientService } from '../clamav-client/clamav-client.service'
import {
  chunkArray,
  isValidScanStatus,
  listOfStatuses,
  timeout,
} from '../common/utils/helpers'
import { FormsClientService } from '../forms-client/forms-client.service'
import { MinioClientService } from '../minio-client/minio-client.service'
import { PrismaService } from '../prisma/prisma.service'
import { ScannerService } from '../scanner/scanner.service'
import { UpdateScanStatusDto } from './scanner-cron.dto'

@Injectable()
export class ScannerCronService {
  private readonly logger = new Logger('ScannerCronService')

  constructor(
    private scannerService: ScannerService,
    private minioClientService: MinioClientService,
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
    private readonly clamavClientService: ClamavClientService,
    private readonly formsClientService: FormsClientService,
  ) {}

  //set cron service every 20 seconds
  @Cron('*/20 * * * * *', {
    name: 'cronStart',
    timeZone: 'Europe/Berlin',
  })
  // eslint-disable-next-line sonarjs/cognitive-complexity
  async cronStart(): Promise<void> {
    //check if cron is already running
    this.logger.log('CronScan waking up...')
    if (globalThis.cronRunning) {
      this.logger.log(
        'CronScan another process is already running. Sleeping...',
      )
      return
    }
    globalThis.cronRunning = true

    //check if clamav is running
    const clamavRunning = await this.clamavClientService.isRunning()
    if (!clamavRunning) {
      globalThis.cronRunning = false
      throw new PreconditionFailedException(
        'Clamav is not running! Sleeping...',
      )
    }
    this.logger.log('Clamav is running...')

    //check if forms is running
    const formsRunning = await this.formsClientService.isRunning()
    if (!formsRunning) {
      globalThis.formsRunning = false
      this.logger.error('Forms are not running!')
    } else {
      globalThis.formsRunning = true
      this.logger.log('Forms are running...')
    }

    //check if we have some files which where not notified to forms client. If yes, try to notify them.
    if (globalThis.formsRunning) {
      try {
        await this.fixUnnotifiedFiles()
      } catch (error) {
        globalThis.cronRunning = false
        const errString =
          error instanceof Error
            ? error.message
            : `throwing non Error: ${String(error)}`
        throw new PreconditionFailedException(
          `Unable to send statuses of unnotified files. Sleeping. Error: ${errString}`,
        )
      }
    }

    try {
      await this.fixUnsuccessfulScanFiles()
    } catch (error) {
      globalThis.cronRunning = false
      const errString =
        error instanceof Error
          ? error.message
          : `throwing non Error: ${String(error)}`
      throw new PreconditionFailedException(
        `Unable to fix files with multiple unsuccessful scans. Error: ${errString}`,
      )
    }

    //check if we have some stacked files when process was stopped and fix them
    try {
      await this.fixStackedFiles()
    } catch (error) {
      globalThis.cronRunning = false
      const errString =
        error instanceof Error
          ? error.message
          : `throwing non Error: ${String(error)}`
      throw new PreconditionFailedException(
        `Unable to fix stacked files. Error: ${errString}`,
      )
    }

    await this.mainScanBatchProcess()
    this.logger.log('CronScan sleeping...')
    this.logger.log('----------------------------------------')
    globalThis.cronRunning = false
  }

  async mainScanBatchProcess() {
    //get all files which are in state ACCEPTED
    const files = await this.prismaService.files.findMany({
      where: {
        status: FileStatus.ACCEPTED,
      },
      take: 80,
      orderBy: {
        createdAt: 'asc',
      },
    })

    //if no files are found, return
    if (files.length === 0) {
      this.logger.log('No files found to scan (searching for ACCEPTED state).')
      return
    }
    this.logger.log(`Found ${files.length} files to scan.`)

    //update status of array files to QUEUED
    const updateStatus = await this.updateScanStatusBatch(
      files,
      FileStatus.QUEUED,
    )
    if (!updateStatus) {
      throw new PreconditionFailedException(
        'Could not update status QUEUED of files.',
      )
    }

    //split files into batches of 4 elements
    const filesBatches = chunkArray(files, 4)

    //scan batch of files
    let j = 1
    for (const fileBatch of filesBatches) {
      this.logger.debug(`Scanning ${j}. batch of ${fileBatch.length} files.`)

      globalThis.formsRunning = await this.formsClientService.isRunning()

      const promiseQueue = []
      for (const file of fileBatch) {
        promiseQueue.push(this.scanFileProcess(file))
      }

      //wait for all promises to be resolved
      let results: FileStatus[]
      try {
        results = await Promise.all(promiseQueue)
        this.logger.log(
          `Batch scan finished with results: ${results.join(', ')}`,
        )
      } catch (error) {
        this.logger.error(error)
      }
      j++
    }
    this.logger.log(`All batches scanned. Sleeping.`)
  }

  async scanFileProcess(file: Files): Promise<FileStatus> {
    try {
      await this.updateScanStatusWithNotify(file, FileStatus.SCANNING)
    } catch {
      throw new Error(
        `${file.fileUid} could not be updated to SCANNING status.`,
      )
    }

    let fileStream
    try {
      fileStream = await this.minioClientService.loadFileStream(
        file.bucketUid,
        file.fileUid,
      )
    } catch {
      await this.updateScanStatusWithNotify(file, FileStatus.NOT_FOUND)

      this.logger.error(`${file.fileUid} not found in minio bucket.`)
      return FileStatus.NOT_FOUND
    }
    this.logger.debug(`${file.fileUid} is in Minio`)

    //scan file in clamav
    let scanStatus: FileStatus
    try {
      scanStatus = await this.scanFileInClamav(file, fileStream)
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(
          `${file.fileUid} could not be scanned. Error: ${error}`,
        )
      } else {
        this.logger.error(
          `scanFileProcess throwing non Error: ${String(error)}`,
        )
      }

      await this.updateScanStatusWithNotify(file, FileStatus.SCAN_ERROR)
      return FileStatus.SCAN_ERROR
    }

    //move file to safe or infected bucket if scan status is SAFE or INFECTED
    if (scanStatus === FileStatus.SAFE || scanStatus === FileStatus.INFECTED) {
      const destinationBucket: string = this.configService.get(
        `CLAMAV_${scanStatus}_BUCKET`,
        '',
      )
      const moveStatus = await this.minioClientService.moveFileBetweenBuckets(
        file.bucketUid,
        file.fileUid,
        destinationBucket,
        file.fileUid,
      )
      if (!moveStatus) {
        let moveErrorStatus: FileStatus = FileStatus.MOVE_ERROR_SAFE

        if (scanStatus === FileStatus.INFECTED) {
          moveErrorStatus = FileStatus.MOVE_ERROR_INFECTED
        }

        await this.updateScanStatusWithNotify(file, moveErrorStatus)

        throw new Error(
          `${file.fileUid} could not be moved to ${scanStatus} bucket.`,
        )
      }
    }

    //update scan status of file
    try {
      await this.updateScanStatusWithNotify(file, scanStatus)
    } catch {
      throw new Error(
        `${file.fileUid} could not be updated to ${scanStatus} status.`,
      )
    }

    return scanStatus
  }

  async scanFileInClamav(
    file: Files,
    fileStream: ReadableStream,
  ): Promise<FileStatus> {
    const startTime = Date.now()
    this.logger.debug(`${file.fileUid} scanning started`)
    let response: string
    try {
      response = await Promise.race([
        timeout(this.configService.get('MAX_FILE_SCAN_RUNS_TIMEOUT', 0)),
        this.clamavClientService.scanStream(fileStream),
      ])
      this.logger.debug(
        `${file.fileUid} scanning response from clamav: ${response}`,
      )
    } finally {
      //stream is destroyed in all situations to prevent any resource leaks.
      fileStream.destroy()
    }
    const result: FileStatus = this.clamavClientService.getScanStatus(response)
    const scanDuration = Date.now() - startTime
    this.logger.log(
      `${file.fileUid} was scanned in: ${scanDuration}ms with result: ${result}`,
    )
    return result
  }

  async updateScanStatusBatch(
    files: Files[],
    to: FileStatus,
  ): Promise<boolean> {
    //check if from and to status are valid
    if (!isValidScanStatus(to)) {
      throw new Error(
        `Please provide a valid scan status. Available options are:${listOfStatuses()}`,
      )
    }

    //update scan status of files
    try {
      await this.prismaService.files.updateMany({
        where: {
          id: {
            in: files.map((file) => file.id),
          },
        },
        data: {
          status: to,
        },
      })
      return true
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(error.message)
      } else {
        this.logger.error(
          `updateScanStatusBatch throwing non Error: ${String(error)}`,
        )
      }

      return false
    }
  }

  async updateScanStatusWithNotify(file: Files, status: FileStatus) {
    if (!isValidScanStatus(status)) {
      throw new Error(
        `Please provide a valid scan status. Available options are:${listOfStatuses()}`,
      )
    }

    //if forms are running, update the status of the file
    let notifiedStatus = false

    //if state is SAFE, INFECTED, MOVE ERROR INFECTED, MOVE ERROR SAFE or NOT FOUND, update the status of the file in forms
    if (
      globalThis.formsRunning &&
      (status === FileStatus.SAFE ||
        status === FileStatus.INFECTED ||
        status === FileStatus.NOT_FOUND ||
        status === FileStatus.MOVE_ERROR_SAFE ||
        status === FileStatus.MOVE_ERROR_INFECTED ||
        status === FileStatus.SCAN_NOT_SUCCESSFUL)
    ) {
      notifiedStatus = true
      let responseStatus = 404
      this.logger.debug(`Notifying forms about file id: ${file.id}`)
      try {
        const response = await this.formsClientService.updateFileStatus(
          file.id,
          status,
        )
        this.logger.debug(
          `Forms response for file id: ${file.id} is: ${JSON.stringify(response.data)}`,
        )
        responseStatus = response.status
      } catch {
        notifiedStatus = false
      }

      if (responseStatus === 404) {
        await this.prismaService.files.update({
          data: {
            status: FileStatus.FORM_ID_NOT_FOUND,
          },
          where: {
            id: file.id,
          },
        })
        this.logger.warn(
          `File id: ${file.id} not existing in forms, setting up state to FILE ID NOT EXISTING IN FORMS. Please check the file in forms.`,
        )
        notifiedStatus = false
      }
    }

    const updateScanStatusDto: UpdateScanStatusDto = {
      status,
      notified: notifiedStatus,
    }

    //if state is SCANNING, increase the number of runs

    if (status === FileStatus.SCANNING) {
      //add the number of runs to the data object
      updateScanStatusDto.runs = file.runs + 1
      this.logger.debug(
        `Number of runs for ${file.fileUid} is increasing to ${file.runs + 1}`,
      )
    }

    //update scan status of files which are in state ACCEPTED to new state which is QUEUE
    const updateScanStatus = await this.prismaService.files.update({
      data: updateScanStatusDto,
      where: {
        id: file.id,
      },
    })

    return updateScanStatus
  }

  //function which search for files which have 3 or more runs and are in state SCAN TIMEOUT or SCAN ERROR and changes their state to SCAN NOT SUCCESSFUL
  async fixUnsuccessfulScanFiles(): Promise<void> {
    //get all files which are in state SCAN TIMEOUT or SCAN ERROR
    const scanNotSuccessfulFiles = await this.prismaService.files.findMany({
      where: {
        OR: [
          {
            status: FileStatus.SCAN_TIMEOUT,
          },
          {
            status: FileStatus.SCAN_ERROR,
          },
        ],
        runs: {
          gte: parseInt(this.configService.get('MAX_FILE_SCAN_RUNS', '1')),
        },
      },
      take: 200,
    })

    //if no files are found, return
    if (scanNotSuccessfulFiles.length === 0) {
      this.logger.log('No files found with multiple unsuccessful scans.')
      return
    }

    this.logger.log(
      `Found ${scanNotSuccessfulFiles.length} files with multiple unsuccessful scans.`,
    )

    for (const file of scanNotSuccessfulFiles) {
      this.logger.log(
        `Changing state of ${file.fileUid} from ${file.status} to SCAN NOT SUCCESSFUL.`,
      )
      await this.updateScanStatusWithNotify(
        file,
        FileStatus.SCAN_NOT_SUCCESSFUL,
      )
    }
  }

  //function which checks if some files are in state QUEUED or SCANNING and if so, it starts the scan process
  async fixStackedFiles(): Promise<void> {
    //get all files which are in state QUEUED or SCANNING
    const stackedFiles = await this.prismaService.files.findMany({
      where: {
        OR: [
          {
            status: FileStatus.QUEUED,
          },
          {
            status: FileStatus.SCANNING,
          },
          {
            status: FileStatus.SCAN_ERROR,
          },
          {
            status: FileStatus.SCAN_TIMEOUT,
          },
        ],
      },
      take: 200,
    })

    //if no files are found, return
    if (stackedFiles.length === 0) {
      this.logger.log('No stacked files found.')
      return
    }
    this.logger.debug(
      `Found ${stackedFiles.length} stacked files from unfinished runs. Changing state status to ACCEPTED.`,
    )

    //update status of array files to ACCEPTED
    const updateStatus = await this.updateScanStatusBatch(
      stackedFiles,
      FileStatus.ACCEPTED,
    )
    if (!updateStatus) {
      throw new PreconditionFailedException(
        'Could not update status ACCEPTED of stacked files.',
      )
    }
  }

  //fix unnotified files  which are in state SAFE, INFECTED, MOVE ERROR INFECTED, MOVE ERROR SAFE, NOT FOUND or SCAN NOT SUCCESSFUL and are not notified
  async fixUnnotifiedFiles(): Promise<void> {
    //get all files which are in state SAFE, INFECTED, MOVE ERROR INFECTED, MOVE ERROR SAFE, NOT FOUND or SCAN NOT SUCCESSFUL and are not notified
    //all states are in finished state
    const unnotifiedFiles = await this.prismaService.files.findMany({
      where: {
        OR: [
          {
            status: FileStatus.SAFE,
          },
          {
            status: FileStatus.INFECTED,
          },
          {
            status: FileStatus.MOVE_ERROR_INFECTED,
          },
          {
            status: FileStatus.MOVE_ERROR_SAFE,
          },
          {
            status: FileStatus.NOT_FOUND,
          },
          {
            status: FileStatus.SCAN_NOT_SUCCESSFUL,
          },
        ],
        notified: false,
      },
      take: 200,
    })

    //if no files are found, return
    if (unnotifiedFiles.length === 0) {
      this.logger.log(
        'No unnotified files found. Every change was send to forms backend.',
      )
      return
    }

    this.logger.log(
      `Found ${unnotifiedFiles.length} unnotified files which were not notified to forms backend. Starting notification process.`,
    )

    //notify forms backend about the status of the files
    for (const file of unnotifiedFiles) {
      try {
        await this.updateScanStatusWithNotify(file, file.status)
      } catch {
        this.logger.error(
          `Could not notify forms backend about file ${file.fileUid} with status ${file.status}.`,
        )
      }
    }
  }
}

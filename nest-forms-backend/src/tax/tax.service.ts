/* eslint-disable @typescript-eslint/explicit-function-return-type,sonarjs/cognitive-complexity,eslint-comments/disable-enable-pair */
import { InjectQueue } from '@nestjs/bull'
import { Injectable } from '@nestjs/common'
import { Job, JobId, Queue } from 'bull'
import { GenerateTaxPdfPayload } from 'forms-shared/tax-form/generateTaxPdf'
import { TaxFormData } from 'forms-shared/tax-form/types'

import BaConfigService from '../config/ba-config.service'
import { ErrorsEnum } from '../utils/global-enums/errors.enum'
import ThrowerErrorGuard from '../utils/guards/thrower-error.guard'

@Injectable()
export default class TaxService {
  constructor(
    @InjectQueue('tax') private readonly taxQueue: Queue,
    private readonly baConfigService: BaConfigService,
    private readonly throwerErrorGuard: ThrowerErrorGuard,
  ) {}

  /**
   * As the default use case of Bull is not to wait for the job to finish, we need to implement this ourselves.
   */
  private async waitForJobResult(jobId: JobId): Promise<string> {
    return new Promise((resolve, reject) => {
      let handleCompleted: (job: Job, result: string) => void
      let handleFailed: (job: Job, error: Error) => void
      let handleError: (error: Error) => void

      const cleanup = () => {
        this.taxQueue.off('completed', handleCompleted)
        this.taxQueue.off('failed', handleFailed)
        this.taxQueue.off('error', handleError)
      }

      handleCompleted = (job: Job, result: string) => {
        if (job.id === jobId) {
          cleanup()
          resolve(result)
        }
      }

      handleFailed = (job: Job, error: Error) => {
        if (job.id === jobId) {
          cleanup()
          reject(error)
        }
      }

      handleError = (error: Error) => {
        cleanup()
        reject(error)
      }

      this.taxQueue.on('completed', handleCompleted)
      this.taxQueue.on('failed', handleFailed)
      this.taxQueue.on('error', handleError)
    })
  }

  async getFilledInPdfBase64(
    formData: PrismaJson.FormDataJson,
    formId?: string,
  ): Promise<string> {
    // NestJS adapter for Bull doesn't implement `enableOfflineQueue`, therefore if we are not connected to Redis,
    // `add` method never finishes.
    // https://docs.bullmq.io/patterns/failing-fast-when-redis-is-down
    // https://stackoverflow.com/a/74533038
    if (this.taxQueue.client.status !== 'ready') {
      // TODO improve error handling
      throw this.throwerErrorGuard.InternalServerErrorException(
        ErrorsEnum.INTERNAL_SERVER_ERROR,
        'Tax queue is not ready',
      )
    }

    // If Redis disconnects during task execution, it won't always throw an error, but sometimes it will just wait for
    // it to reconnect. Therefore also an endpoint using this service needs an timeout.
    // TODO: Implement timeout
    const job = (await this.taxQueue.add(
      'generate_pdf',
      {
        formData: formData as TaxFormData,
        formId,
      } satisfies GenerateTaxPdfPayload,
      {
        removeOnComplete: true,
        removeOnFail: true,
        timeout: this.baConfigService.redis.taxJob.timeout,
      },
    )) as Job<GenerateTaxPdfPayload>

    return this.waitForJobResult(job.id)
  }
}

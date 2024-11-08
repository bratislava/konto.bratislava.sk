/* eslint-disable @typescript-eslint/explicit-function-return-type,sonarjs/cognitive-complexity,eslint-comments/disable-enable-pair */
import { InjectQueue } from '@nestjs/bull'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Prisma } from '@prisma/client'
import { Job, JobId, Queue } from 'bull'
import { FormDefinitionType } from 'forms-shared/definitions/formDefinitionTypes'
import { getFormDefinitionBySlug } from 'forms-shared/definitions/getFormDefinitionBySlug'
import { GenerateTaxPdfPayload } from 'forms-shared/tax-form/generateTaxPdf'
import { generateTaxXml } from 'forms-shared/tax-form/generateTaxXml'
import { TaxFormData } from 'forms-shared/tax-form/types'
import validateSchema from 'xsd-validator'

import { ErrorsEnum } from '../utils/global-enums/errors.enum'
import ThrowerErrorGuard from '../utils/guards/thrower-error.guard'
import { getTaxXsd, getTaxXslt } from '../utils/tax-xml-files'
import { TaxSignerDataResponseDto } from './dtos/tax.dto'

@Injectable()
export default class TaxService {
  constructor(
    @InjectQueue('tax') private readonly taxQueue: Queue,
    private readonly configService: ConfigService,
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
    formData: Prisma.JsonValue,
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
        timeout: parseInt(
          <string>this.configService.get('TAX_PDF_JOB_TIMEOUT') ?? '30000',
          10,
        ),
      },
    )) as Job<GenerateTaxPdfPayload>

    return this.waitForJobResult(job.id)
  }

  // TODO tests
  convertJsonToXml(
    data: Prisma.JsonValue,
    pospID: string,
    version: string,
  ): string {
    if (typeof data !== 'object' || Array.isArray(data) || !data)
      throw this.throwerErrorGuard.BadRequestException(
        ErrorsEnum.BAD_REQUEST_ERROR,
        'Form data are empty or invalid',
      )
    return generateTaxXml(data, false, pospID, version)
  }

  // apart from getting tax specific xml data this might work for other signed forms - change this when accommodating those
  getSignerData(
    formDataJson: Prisma.JsonObject,
    formSlug: string,
  ): TaxSignerDataResponseDto {
    const formDefinition = getFormDefinitionBySlug(formSlug)
    if (formDefinition?.type !== FormDefinitionType.SlovenskoSkTax) {
      throw this.throwerErrorGuard.BadRequestException(
        ErrorsEnum.BAD_REQUEST_ERROR,
        'Not yet implemented for non-tax forms',
      )
    }
    const xmlData = this.convertJsonToXml(
      formDataJson,
      formDefinition.pospID,
      formDefinition.pospVersion,
    )
    const xsd = getTaxXsd(formDefinition.pospID, formDefinition.pospVersion)
    const xslt = getTaxXslt(formDefinition.pospID, formDefinition.pospVersion)

    // TODO today we don't check against xsd when sending non-signed data, consider adding in the future if this part is getting refactored
    // TODO console.log vs Logger
    const result = validateSchema(xmlData, xsd)
    if (result === true) {
      console.log('Tax XSD validation successful')
    } else {
      console.log(result)
      // logging error 500 so that we get updated
      console.error(
        this.throwerErrorGuard.InternalServerErrorException(
          ErrorsEnum.INTERNAL_SERVER_ERROR,
          'Failed to validate XML against XSD',
        ),
      )
      // throwing error 400 so that FE gets feedback
      throw this.throwerErrorGuard.BadRequestException(
        ErrorsEnum.BAD_REQUEST_ERROR,
        `Failed to validate XML against XSD, with following errors: ${result
          .map((e) => e.message)
          .join(', ')}`,
      )
    }

    return {
      objectId: 'signed_form',
      objectDescription: '',
      objectFormatIdentifier: `http://schemas.gov.sk/form/${formDefinition.pospID}/${formDefinition.pospVersion}`,
      xdcXMLData: xmlData,
      xdcIdentifier: '',
      xdcVersion: '',
      xslMediaDestinationTypeDescription: 'TXT',
      xslTargetEnvironment: '',
      xdcIncludeRefs: true,
      xdcNamespaceURI:
        'http://data.gov.sk/def/container/xmldatacontainer+xml/1.0',

      // all of these are hardcoded for tax form - get it from forms/schema/schema-files when doing this for other forms
      xdcUsedXSD: xsd,
      xsdReferenceURI: `http://schemas.gov.sk/form/${formDefinition.pospID}/${formDefinition.pospVersion}`,
      xdcUsedXSLT: xslt,
      xslReferenceURI: `http://schemas.gov.sk/form/${formDefinition.pospID}/${formDefinition.pospVersion}/form.xslt`,
      xslXSLTLanguage: 'sk',
    }
  }
}

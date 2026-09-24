import { ErrorFactoryService } from '@bratislava/log-nest'
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  PayloadTooLargeException,
} from '@nestjs/common'
import { Request, Response } from 'express'
import { getFormDefinitionBySlug } from 'forms-shared/definitions/getFormDefinitionBySlug'
import multer from 'multer'

import BaConfigService from '../config/ba-config.service'
import {
  FormsErrorsEnum,
  FormsErrorsResponseEnum,
} from '../forms/forms.errors.enum'
import FormsService from '../forms/forms.service'
import { FilesErrorsEnum, FilesErrorsResponseEnum } from './files.errors.enum'

/**
 * Conservative overhead allowance for multipart boundaries, headers, and the other form fields (filename, id).
 */
const MULTIPART_OVERHEAD_BYTES = 10_000

/**
 * File upload interceptor that handles both early rejection and stream-level enforcement of file size limits.
 *
 * 1. Checks the Content-Length header — rejects obviously oversized requests before body parsing
 * 2. Configures multer with a dynamic fileSize limit — aborts the stream mid-upload if exceeded
 *
 * Both checks enforce the per-file size limit, resolved as the min of the per-slot, per-form-definition,
 * and global limits.
 *
 * Cumulative (maxTotalFileSize) limits are NOT checked here — they are enforced at form submission time in
 * NasesService.sendForm, because the set of active files is not final until the user submits.
 *
 * When the feature toggle is disabled, the limit falls back to the global limit (files.maxSingleSizeGlobal).
 * Otherwise the form is looked up to resolve the limit, and a missing form or form definition throws an error.
 */
@Injectable()
export class FileUploadInterceptor implements NestInterceptor {
  constructor(
    private readonly formsService: FormsService,
    private readonly baConfigService: BaConfigService,
    private readonly errorFactoryService: ErrorFactoryService,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<ReturnType<CallHandler['handle']>> {
    const ctx = context.switchToHttp()
    const req = ctx.getRequest<Request>()
    const res = ctx.getResponse<Response>()

    const effectiveMax = await this.resolveLimit(req)

    this.checkContentLength(req, effectiveMax)

    const upload = multer({ limits: { fileSize: effectiveMax } })

    await new Promise<void>((resolve, reject) => {
      upload.single('file')(req, res, (err: unknown) => {
        if (err) {
          if (
            err instanceof multer.MulterError &&
            err.code === 'LIMIT_FILE_SIZE'
          ) {
            reject(
              new PayloadTooLargeException(
                `File size exceeded. Maximum allowed: ${effectiveMax} bytes.`,
              ),
            )
            return
          }
          if (err instanceof Error) {
            reject(err)
          } else {
            try {
              reject(new Error(JSON.stringify(err)))
            } catch {
              reject(new Error('Unknown multer error'))
            }
          }
          return
        }
        resolve()
      })
    })

    return next.handle()
  }

  private checkContentLength(req: Request, effectiveMax: number): void {
    const contentLength = Number(req.headers['content-length'])
    if (!contentLength || Number.isNaN(contentLength)) {
      return
    }

    if (contentLength > effectiveMax + MULTIPART_OVERHEAD_BYTES) {
      throw this.errorFactoryService.BadRequestException({
        errorEnum: FilesErrorsEnum.TOTAL_FILE_SIZE_EXCEEDED_ERROR,
        message: `${FilesErrorsResponseEnum.TOTAL_FILE_SIZE_EXCEEDED_ERROR} Content-Length: ${contentLength}, remaining budget: ${effectiveMax}`,
      })
    }
  }

  private async resolveLimit(req: Request): Promise<number> {
    const globalMax = this.baConfigService.files.maxSingleSizeGlobal

    if (!this.baConfigService.featureToggles.fileSizeLimits) {
      return globalMax
    }

    const { formId } = req.params
    if (!formId || typeof formId !== 'string') {
      throw this.errorFactoryService.BadRequestException({
        errorEnum: FormsErrorsEnum.FORM_NOT_FOUND_ERROR,
        message: FormsErrorsResponseEnum.FORM_NOT_FOUND_ERROR,
      })
    }

    const form = await this.formsService.getUniqueForm(formId)
    if (!form) {
      throw this.errorFactoryService.NotFoundException({
        errorEnum: FormsErrorsEnum.FORM_NOT_FOUND_ERROR,
        message: FormsErrorsResponseEnum.FORM_NOT_FOUND_ERROR,
      })
    }

    const formDefinition = getFormDefinitionBySlug(form.formDefinitionSlug)
    if (!formDefinition) {
      throw this.errorFactoryService.UnprocessableEntityException({
        errorEnum: FormsErrorsEnum.FORM_DEFINITION_NOT_FOUND,
        message: FormsErrorsResponseEnum.FORM_DEFINITION_NOT_FOUND,
      })
    }

    if (!formDefinition.files) {
      return globalMax
    }

    const slotId = req.query.slotId
    if (!slotId || typeof slotId !== 'string') {
      throw this.errorFactoryService.BadRequestException({
        errorEnum: FilesErrorsEnum.MISSING_SLOT_ID_ERROR,
        message: FilesErrorsResponseEnum.MISSING_SLOT_ID_ERROR,
      })
    }

    const slot = formDefinition.files.slots.find((s) => s.slotId === slotId)

    return Math.min(
      slot?.maxFileSize ?? Infinity,
      formDefinition.files.maxFileSize ?? Infinity,
      globalMax,
    )
  }
}

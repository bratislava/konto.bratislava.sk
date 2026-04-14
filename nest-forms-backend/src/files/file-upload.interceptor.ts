import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  PayloadTooLargeException,
} from '@nestjs/common'
import { Request, Response } from 'express'
import { getFormDefinitionBySlug } from 'forms-shared/definitions/getFormDefinitionBySlug'
import { getPerFieldFileLimit } from 'forms-shared/form-utils/getFieldFileSizeLimit'
import multer from 'multer'
import { Observable } from 'rxjs'

import FormsService from '../forms/forms.service'
import ThrowerErrorGuard from '../utils/guards/thrower-error.guard'
import { FilesErrorsEnum, FilesErrorsResponseEnum } from './files.errors.enum'
import FilesHelper from './files.helper'
import BaConfigService from '../config/ba-config.service'
/**
 * Conservative overhead allowance for multipart boundaries, headers, and the other form fields
 * (filename, id).
 */
const MULTIPART_OVERHEAD_BYTES = 10_000

/**
 * File upload interceptor that handles both early rejection and stream-level enforcement
 * of file size limits.
 *
 * 1. Checks the Content-Length header — rejects obviously oversized requests before body parsing
 * 2. Configures multer with a dynamic fileSize limit — aborts the stream mid-upload if exceeded
 *
 * Both checks enforce per-file (maxFileSize) and cumulative (maxTotalFileSize) limits.
 * The effective limit is min(maxFileSize, remaining cumulative budget).
 *
 * WARNING: If the form or form definition is not found (invalid formId, missing slug),
 * the limit falls back to the global MAX_FILE_SIZE. This interceptor does NOT validate
 * that the form exists — ensure a guard (e.g. FormAccessGuard) runs before this
 * interceptor to reject requests with invalid formIds.
 */
@Injectable()
export class FileUploadInterceptor implements NestInterceptor {
  constructor(
    private readonly formsService: FormsService,
    private readonly baConfigService: BaConfigService,
    private readonly throwerErrorGuard: ThrowerErrorGuard,
    private readonly filesHelper: FilesHelper,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<unknown>> {
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
          reject(err)
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
      throw this.throwerErrorGuard.BadRequestException(
        FilesErrorsEnum.TOTAL_FILE_SIZE_EXCEEDED_ERROR,
        `${FilesErrorsResponseEnum.TOTAL_FILE_SIZE_EXCEEDED_ERROR} Content-Length: ${contentLength}, remaining budget: ${effectiveMax}`,
      )
    }
  }

  private async resolveLimit(req: Request): Promise<number> {
    const globalMax = this.baConfigService.fileLimits.maxSingleSizeGlobal
    const globalCumulativeMax =
      this.baConfigService.fileLimits.maxCumulativeSizeGlobal

    const { formId } = req.params
    if (!formId) {
      return globalMax
    }

    const form = await this.formsService.getUniqueForm(formId)
    if (!form) {
      return globalMax
    }

    const formDefinition = getFormDefinitionBySlug(form.formDefinitionSlug)
    const formPerFileMax = formDefinition?.maxFileSize ?? globalMax

    // Per-field file size enforcement: when the form defines `fileLimits`, the frontend
    // must send a `fieldId` query param so the backend can look up the field-specific limit.
    const fieldId = req.query.fieldId as string | undefined
    const hasPerFieldLimits =
      formDefinition?.fileLimits &&
      Object.keys(formDefinition.fileLimits).length > 0
    if (!fieldId && hasPerFieldLimits) {
      throw this.throwerErrorGuard.BadRequestException(
        FilesErrorsEnum.MISSING_FIELD_ID_ERROR,
        FilesErrorsResponseEnum.MISSING_FIELD_ID_ERROR,
      )
    }

    // Use the per-field limit if available, but never exceed the form-level max.
    const fieldLimit = fieldId
      ? getPerFieldFileLimit(formDefinition?.fileLimits, fieldId)
      : null
    const perFileMax =
      fieldLimit != null ? Math.min(fieldLimit, formPerFileMax) : formPerFileMax

    const currentTotal = await this.filesHelper.getActiveFilesTotalSize(formId)
    const remainingBudget =
      formDefinition?.maxTotalFileSize ?? globalCumulativeMax - currentTotal

    return Math.max(0, Math.min(perFileMax, remainingBudget))
  }
}

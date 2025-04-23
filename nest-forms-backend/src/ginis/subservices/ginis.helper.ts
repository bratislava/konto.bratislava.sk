import { Injectable } from '@nestjs/common'
import { FormError, FormState } from '@prisma/client'

import {
  FormFilesWithMinio,
  GetFileResponseReducedDto,
} from '../../files/files.dto'
import FormsService from '../../forms/forms.service'
import { GinisUploadInfo } from '../dtos/ginis.response.dto'

@Injectable()
export default class GinisHelper {
  constructor(private readonly formsService: FormsService) {}

  areAllFilesInGinisResponse(
    files: FormFilesWithMinio[],
    ginisResponse: GinisUploadInfo[],
  ): boolean {
    const fileNamesInGinis = new Set(
      ginisResponse.map((response) => response['Súbor']),
    )

    return files.every((file) => fileNamesInGinis.has(file.fileName))
  }

  allFilesUploadedToGinis(files: GetFileResponseReducedDto[]): boolean {
    return files.every((file) => file.ginisUploaded)
  }

  async setFormToError(formId: string): Promise<void> {
    try {
      await this.formsService.updateForm(formId, {
        state: FormState.ERROR,
        error: FormError.GINIS_SEND_ERROR,
      })
    } catch (error) {
      // ignore
    }
  }

  async retryWithDelay<T>(
    fn: () => Promise<T>,
    retries = 1,
    delayMs = 10_000,
  ): Promise<T> {
    try {
      return await fn()
    } catch (error) {
      if (retries <= 0) {
        throw error
      }
      await new Promise((resolve) => {
        setTimeout(resolve, delayMs)
      })
      return this.retryWithDelay(fn, retries - 1, delayMs)
    }
  }
}

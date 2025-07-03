import { GinDetailReferentaDetailReferenta } from '@bratislava/ginis-sdk'
import { Injectable } from '@nestjs/common'
import { FormError, FormState } from '@prisma/client'

import FormsService from '../../forms/forms.service'

@Injectable()
export default class GinisHelper {
  constructor(private readonly formsService: FormsService) {}

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

  private stripNumbersWithDash(name?: string): string {
    if (!name) {
      return ''
    }
    return name.replaceAll(/(^\d+-|-\d+$)/g, '')
  }

  /**
   * Sanitize owner name and surname from GINIS, as they might contain some internal
   * identifiers consisting of digits and a dash (e.g. 23-Peter).
   * @param ownerDetail detail information about owner from ginis
   * @returns sanitized first name and last name of the owner delimited by a space
   */
  extractSanitizeGinisOwnerFullName(
    ownerDetail: GinDetailReferentaDetailReferenta,
  ): string {
    const name = this.stripNumbersWithDash(ownerDetail.Jmeno)
    const surname = this.stripNumbersWithDash(ownerDetail.Prijmeni)
    return `${name} ${surname}`
  }
}

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

  /**
   * @param pospId posp id of form definition, the id by which the form is registered in NASES.
   * @returns properties for ginis-automation register submission - determines the official who processes the form further
   */
  getReferentForPospID(pospId: string): {
    organization: string
    person: string
  } {
    // for now, all of the forms are processed by the same person, but this person isn't available in 'vyvoj' GINIS
    // later change this for a map between pospId's and referents and their sub-organizations
    const stagingEnvOverride =
      process.env.GINIS_TEMP_REFERENT_OVERRIDE === 'true'
    console.log(
      `Referent info is static! Generating for ${pospId}, staging override: ${
        stagingEnvOverride ? 'true' : 'false'
      }`,
    )
    return stagingEnvOverride
      ? {
          organization: 'OUIC',
          person: 'Martančík Ľudmila',
        }
      : {
          organization: 'OUIC',
          person: 'Simeunovičová Ľudmila',
        }
  }
}

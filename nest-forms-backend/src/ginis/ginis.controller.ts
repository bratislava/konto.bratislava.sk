import {
  GinDetailReferentaDetailReferenta,
  GinisError,
  SslDetailDokumentuWflDokument,
} from '@bratislava/ginis-sdk'
import { Controller, Get, Param, UseGuards } from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger'

import { AllowedUserTypes } from '../auth-v2/decorators/allowed-user-types.decorator'
import { UserAuthGuard } from '../auth-v2/guards/user-auth.guard'
import { UserType } from '../auth-v2/types/user'
import {
  FormsErrorsEnum,
  FormsErrorsResponseEnum,
} from '../forms/forms.errors.enum'
import FormsService from '../forms/forms.service'
import { FormAccessGuard } from '../forms-v2/guards/form-access.guard'
import {
  mapGinisHistory,
  MappedDocumentHistory,
} from '../utils/ginis/ginis-api-helper'
import { ErrorsEnum } from '../utils/global-enums/errors.enum'
import ThrowerErrorGuard from '../utils/guards/thrower-error.guard'
import GinisDocumentDetailResponseDto from './dtos/ginis-api.response.dto'
import GinisHelper from './subservices/ginis.helper'
import GinisAPIService from './subservices/ginis-api.service'

@ApiTags('ginis')
@ApiBearerAuth()
@Controller('ginis')
export default class GinisController {
  constructor(
    private readonly ginisAPIService: GinisAPIService,
    private readonly ginisHelper: GinisHelper,
    private readonly formsService: FormsService,
    private readonly throwerErrorGuard: ThrowerErrorGuard,
  ) {}

  @ApiOperation({
    summary: '',
    description: 'Return GINIS document by ID',
  })
  @ApiOkResponse({
    description: '',
    type: GinisDocumentDetailResponseDto,
  })
  @ApiBearerAuth()
  @AllowedUserTypes([UserType.Auth])
  @UseGuards(UserAuthGuard, FormAccessGuard)
  @Get(':formId')
  async getGinisDocumentByFormId(
    @Param('formId') formId: string,
  ): Promise<GinisDocumentDetailResponseDto> {
    const form = await this.formsService.getUniqueForm(formId)
    if (!form) {
      throw this.throwerErrorGuard.NotFoundException(
        FormsErrorsEnum.FORM_NOT_FOUND_ERROR,
        FormsErrorsResponseEnum.FORM_NOT_FOUND_ERROR,
      )
    }
    const { ginisDocumentId } = form
    if (!ginisDocumentId) {
      throw this.throwerErrorGuard.NotFoundException(
        ErrorsEnum.NOT_FOUND_ERROR,
        `Form with id ${formId} does not have a ginisDocumentId`,
      )
    }
    let wflDocument: SslDetailDokumentuWflDokument | null = null
    let ownerDetail: GinDetailReferentaDetailReferenta | null = null
    let documentHistory: MappedDocumentHistory = []
    try {
      const document =
        await this.ginisAPIService.getDocumentDetail(ginisDocumentId)
      wflDocument = document['Wfl-dokument']
      const owner = await this.ginisAPIService.getOwnerDetail(
        wflDocument['Id-funkce-vlastnika'],
      )
      ownerDetail = owner['Detail-referenta']
      documentHistory = mapGinisHistory(document)
    } catch (error) {
      const errorToThrow =
        error instanceof GinisError && error.axiosError?.status === 404
          ? this.throwerErrorGuard.NotFoundException(
              ErrorsEnum.NOT_FOUND_ERROR,
              `Document or document owner not found in GINIS - document id, if available: ${
                wflDocument?.['Id-dokumentu'] ||
                'unavailable - document not found or invalid'
              }`,
            )
          : this.throwerErrorGuard.InternalServerErrorException(
              ErrorsEnum.INTERNAL_SERVER_ERROR,
              `Error while getting document or owner from GINIS: ${<string>(
                error
              )}`,
            )
      throw errorToThrow
    }
    return {
      id: wflDocument['Id-dokumentu'],
      dossierId: wflDocument['Id-spisu'],
      ownerName:
        this.ginisHelper.extractSanitizeGinisOwnerFullName(ownerDetail),
      ownerEmail: ownerDetail.Mail || '',
      ownerPhone: ownerDetail.Telefon || '',
      documentHistory,
    }
  }
}

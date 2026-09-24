import {
  GinDetailReferentaDetailReferenta,
  GinisError,
  SslDetailDokumentuWflDokument,
} from '@bratislava/ginis-sdk'
import { AllowList, ErrorEnum, ErrorFactoryService } from '@bratislava/log-nest'
import { Controller, Get, HttpStatus, Param, UseGuards } from '@nestjs/common'
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
    private readonly errorFactoryService: ErrorFactoryService,
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
  @AllowList({ id: true, dossierId: true })
  @Get(':formId')
  async getGinisDocumentByFormId(
    @Param('formId') formId: string,
  ): Promise<GinisDocumentDetailResponseDto> {
    const form = await this.formsService.getUniqueForm(formId)
    if (!form) {
      throw this.errorFactoryService.NotFoundException({
        errorEnum: FormsErrorsEnum.FORM_NOT_FOUND_ERROR,
        message: FormsErrorsResponseEnum.FORM_NOT_FOUND_ERROR,
      })
    }
    const { ginisDocumentId } = form
    if (!ginisDocumentId) {
      throw this.errorFactoryService.NotFoundException({
        errorEnum: ErrorEnum.NOT_FOUND_ERROR,
        message: `Form with id ${formId} does not have a ginisDocumentId`,
      })
    }

    let wflDocument: SslDetailDokumentuWflDokument | null = null
    let ownerDetail: GinDetailReferentaDetailReferenta | null
    let documentHistory: MappedDocumentHistory
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
      if (error instanceof GinisError && error.axiosError) {
        throw this.errorFactoryService.fromAxiosError(error.axiosError, {
          statusOverrides: {
            [HttpStatus.NOT_FOUND]: {
              status: HttpStatus.NOT_FOUND,
              errorEnum: ErrorEnum.NOT_FOUND_ERROR,
              message: `Document or document owner not found in GINIS - document id, if available: ${
                wflDocument?.['Id-dokumentu'] ||
                'unavailable - document not found or invalid'
              }`,
            },
          },
        })
      }
      throw this.errorFactoryService.InternalServerErrorException({
        errorEnum: ErrorEnum.INTERNAL_SERVER_ERROR,
        message: 'Error while getting document or owner from GINIS:',
        error,
      })
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

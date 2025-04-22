import {
  GinDetailReferentaDetailReferenta,
  GinisError,
  SslDetailDokumentuWflDokument,
} from '@bratislava/ginis-sdk'
import { Controller, Get, Param, UseGuards } from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'

import {
  UserInfo,
  UserInfoResponse,
} from '../auth/decorators/user-info.decorator'
import { CognitoGetUserData } from '../auth/dtos/cognito.dto'
import CognitoGuard from '../auth/guards/cognito.guard'
import {
  FormIsOwnedBySomeoneElseErrorDto,
  FormNotFoundErrorDto,
} from '../forms/forms.errors.dto'
import FormsService from '../forms/forms.service'
import { User } from '../utils/decorators/request.decorator'
import {
  mapGinisHistory,
  MappedDocumentHistory,
} from '../utils/ginis/ginis-api-helper'
import {
  DatabaseErrorDto,
  UnauthorizedErrorDto,
} from '../utils/global-dtos/errors.dto'
import { ErrorsEnum } from '../utils/global-enums/errors.enum'
import ThrowerErrorGuard from '../utils/guards/thrower-error.guard'
import GinisDocumentDetailResponseDto from './dtos/ginis-api.response.dto'
import GinisHelper from './subservices/ginis.helper'
import GinisAPIService from './subservices/ginis-api.service'

@ApiTags('ginis')
@ApiBearerAuth()
@ApiUnauthorizedResponse({
  description: 'Unauthorized.',
  type: UnauthorizedErrorDto,
})
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
  @ApiForbiddenResponse({
    description: 'Form is Forbidden.',
    type: FormIsOwnedBySomeoneElseErrorDto,
  })
  @ApiNotFoundResponse({
    description: 'Form not found.',
    type: FormNotFoundErrorDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error.',
    type: DatabaseErrorDto,
  })
  @UseGuards(CognitoGuard)
  @Get(':formId')
  async getGinisDocumentByFormId(
    @Param('formId') formId: string,
    @User() user: CognitoGetUserData | undefined,
    @UserInfo() userInfo: UserInfoResponse,
  ): Promise<GinisDocumentDetailResponseDto> {
    const form = await this.formsService.getFormWithAccessCheck(
      formId,
      user ? user.sub : null,
      userInfo?.ico ?? null,
    )
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

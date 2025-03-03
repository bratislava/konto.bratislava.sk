import { AxiosError } from '@bratislava/ginis-sdk'
import { Controller, Get, Param, UseGuards } from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'

import { CognitoGetUserData } from '../auth/dtos/cognito.dto'
import CognitoGuard from '../auth/guards/cognito.guard'
import {
  FormIsOwnedBySomeoneElseErrorDto,
  FormNotFoundErrorDto,
} from '../forms/forms.errors.dto'
import FormsService from '../forms/forms.service'
import {
  User,
  UserInfo,
  UserInfoResponse,
} from '../utils/decorators/request.decorator'
import {
  DetailDokumentu,
  DetailReferenta,
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
  @ApiNotFoundResponse({
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
    @User() user?: CognitoGetUserData,
    @UserInfo() userInfo?: UserInfoResponse,
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
    let document: DetailDokumentu | null = null
    let owner: DetailReferenta | null = null
    let documentHistory: MappedDocumentHistory = []
    try {
      document = await this.ginisAPIService.getDocumentDetail(ginisDocumentId)
      owner = await this.ginisAPIService.getOwnerDetail(
        document?.WflDokument[0]?.IdFunkceVlastnika,
      )
      documentHistory = mapGinisHistory(document)
    } catch (error) {
      const errorToThrow =
        error instanceof AxiosError && error.status === 404
          ? this.throwerErrorGuard.NotFoundException(
              ErrorsEnum.NOT_FOUND_ERROR,
              `Document or document owner not found in GINIS - document id, if available: ${
                document?.WflDokument[0]?.IdDokumentu ||
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
      id: document?.WflDokument[0]?.IdDokumentu || '',
      dossierId: document?.WflDokument[0]?.IdSpisu || '',
      ownerName: `${owner?.DetailReferenta[0]?.Jmeno || ''} ${
        owner?.DetailReferenta[0]?.Prijmeni || ''
      }`,
      ownerEmail: owner?.DetailReferenta[0]?.Mail || '',
      ownerPhone: owner?.DetailReferenta[0]?.Telefon || '',
      documentHistory,
    }
  }
}

import { Injectable, Logger } from '@nestjs/common'
import { isAxiosError } from 'axios'
import { isSlovenskoSkFormDefinition } from 'forms-shared/definitions/formDefinitionTypes'
import { getFormDefinitionBySlug } from 'forms-shared/definitions/getFormDefinitionBySlug'
import { getSignerData } from 'forms-shared/signer/signerData'
import {
  formatValidateXmlResultErrors,
  validateXml,
} from 'forms-shared/slovensko-sk/validateXml'

import ApiJwtTokensService from '../api-jwt-tokens/api-jwt-tokens.service'
import ClientsService from '../clients/clients.service'
import BaConfigService from '../config/ba-config.service'
import FormValidatorRegistryService from '../form-validator-registry/form-validator-registry.service'
import {
  FormsErrorsEnum,
  FormsErrorsResponseEnum,
} from '../forms/forms.errors.enum'
import FormsService from '../forms/forms.service'
import PrismaService from '../prisma/prisma.service'
import {
  ErrorsEnum,
  ErrorsResponseEnum,
} from '../utils/global-enums/errors.enum'
import ThrowerErrorGuard from '../utils/guards/thrower-error.guard'
import {
  SignerDataRequestDto,
  SignerDataResponseDto,
  VerifySignatureRequestDto,
  VerifySignatureResponseDto,
} from './signer.dto'
import {
  SignerErrorsEnum,
  SignerErrorsResponseEnum,
} from './signer.errors.enum'

@Injectable()
export default class SignerService {
  private readonly logger: Logger

  constructor(
    private readonly throwerErrorGuard: ThrowerErrorGuard,
    private readonly formsService: FormsService,
    private readonly prismaService: PrismaService,
    private readonly formValidatorRegistryService: FormValidatorRegistryService,
    private readonly clientsService: ClientsService,
    private readonly apiJwtTokensService: ApiJwtTokensService,
    private readonly baConfigService: BaConfigService,
  ) {
    this.logger = new Logger('SignerService')
  }

  private async validateXml(xmlData: string, xsd: string): Promise<void> {
    const result = await validateXml(xmlData, xsd)
    if (result.success) {
      return
    }

    throw this.throwerErrorGuard.BadRequestException(
      SignerErrorsEnum.XML_VALIDATION_ERROR,
      result.errors
        ? `${SignerErrorsResponseEnum.XML_VALIDATION_ERROR} Errors: ${formatValidateXmlResultErrors(result.errors)}`
        : SignerErrorsResponseEnum.XML_VALIDATION_ERROR,
    )
  }

  async getSignerData(
    formId: string,
    data: SignerDataRequestDto,
  ): Promise<SignerDataResponseDto> {
    const form = await this.formsService.getUniqueForm(formId)
    if (!form) {
      throw this.throwerErrorGuard.NotFoundException(
        FormsErrorsEnum.FORM_NOT_FOUND_ERROR,
        FormsErrorsResponseEnum.FORM_NOT_FOUND_ERROR,
      )
    }

    const formDefinition = getFormDefinitionBySlug(form.formDefinitionSlug)
    if (formDefinition === null) {
      throw this.throwerErrorGuard.NotFoundException(
        FormsErrorsEnum.FORM_DEFINITION_NOT_FOUND,
        `getSignerData: ${FormsErrorsResponseEnum.FORM_DEFINITION_NOT_FOUND} ${form.formDefinitionSlug}`,
      )
    }
    if (!isSlovenskoSkFormDefinition(formDefinition)) {
      throw this.throwerErrorGuard.UnprocessableEntityException(
        FormsErrorsEnum.FORM_DEFINITION_NOT_SUPPORTED_TYPE,
        FormsErrorsResponseEnum.FORM_DEFINITION_NOT_SUPPORTED_TYPE,
        {
          formDefinitionType: formDefinition.type,
          slug: form.formDefinitionSlug,
        },
      )
    }

    const files = await this.prismaService.files.findMany({
      where: {
        formId: form.id,
      },
    })

    const signerData = await getSignerData({
      formDefinition,
      formId,
      formData: data.formDataJson,
      jsonVersion: form.jsonVersion,
      validatorRegistry: this.formValidatorRegistryService.getRegistry(),
      serverFiles: files,
    })

    await this.validateXml(signerData.xdcXMLData, signerData.xdcUsedXSD)

    return signerData
  }

  /**
   * Passthrough to the Slovensko.sk `POST /api/cep/verify` endpoint, which informatively verifies the signatures on
   * the given object.
   */
  async verifySignature(
    data: VerifySignatureRequestDto,
  ): Promise<VerifySignatureResponseDto> {
    const jwtToken = this.apiJwtTokensService.createTechnicalAccountJwtToken(
      this.baConfigService.slovenskoSk.subNasesTechnicalAccount,
      this.baConfigService.slovenskoSk.apiTokenPrivate,
    )

    return this.clientsService.slovenskoSkApi
      .apiCepVerifyPost(
        { content: data.content },
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        },
      )
      .then((response) => response.data)
      .catch((error: unknown) => {
        if (!isAxiosError(error)) {
          throw this.throwerErrorGuard.InternalServerErrorException(
            ErrorsEnum.INTERNAL_SERVER_ERROR,
            ErrorsResponseEnum.INTERNAL_SERVER_ERROR,
            'Failed to verify signature in Slovensko.sk',
            error,
          )
        }
        throw this.throwerErrorGuard.fromAxiosError(error, {
          console: 'Failed to verify signature in Slovensko.sk',
        })
      })
  }
}

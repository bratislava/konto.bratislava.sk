import { Injectable, Logger } from '@nestjs/common'
import { GenericObjectType } from '@rjsf/utils'
import { isSlovenskoSkFormDefinition } from 'forms-shared/definitions/formDefinitionTypes'
import { getFormDefinitionBySlug } from 'forms-shared/definitions/getFormDefinitionBySlug'
import { getSignerData } from 'forms-shared/signer/signerData'
import validateSchema from 'xsd-validator'

import { CognitoGetUserData } from '../auth/dtos/cognito.dto'
import FormValidatorRegistryService from '../form-validator-registry/form-validator-registry.service'
import {
  FormsErrorsEnum,
  FormsErrorsResponseEnum,
} from '../forms/forms.errors.enum'
import FormsService from '../forms/forms.service'
import PrismaService from '../prisma/prisma.service'
import ThrowerErrorGuard from '../utils/guards/thrower-error.guard'
import { SignerDataRequestDto, SignerDataResponseDto } from './signer.dto'
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
  ) {
    this.logger = new Logger('SignerService')
  }

  private validateXml(xmlData: string, xsd: string): void {
    const result = validateSchema(xmlData, xsd)
    if (result === true) {
      return
    }

    throw this.throwerErrorGuard.BadRequestException(
      SignerErrorsEnum.XML_VALIDATION_ERROR,
      `${SignerErrorsResponseEnum.XML_VALIDATION_ERROR} Errors: ${result
        .map((e) => e.message)
        .join(', ')}`,
    )
  }

  async getSignerData(
    data: SignerDataRequestDto,
    ico: string | null,
    user?: CognitoGetUserData,
  ): Promise<SignerDataResponseDto> {
    const form = await this.formsService.getFormWithAccessCheck(
      data.formId,
      user?.sub ?? null,
      ico,
    )

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
        `getSignerData: ${FormsErrorsResponseEnum.FORM_DEFINITION_NOT_SUPPORTED_TYPE}: ${formDefinition.type}, slug: ${form.formDefinitionSlug}`,
      )
    }

    const files = await this.prismaService.files.findMany({
      where: {
        formId: form.id,
      },
    })

    const signerData = await getSignerData({
      formDefinition,
      formId: data.formId,
      formData: data.formDataJson as GenericObjectType,
      validatorRegistry: this.formValidatorRegistryService.getRegistry(),
      serverFiles: files,
    })

    this.validateXml(signerData.xdcXMLData, signerData.xdcUsedXSD)

    return signerData
  }
}

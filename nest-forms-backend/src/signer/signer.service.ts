import { Injectable, Logger } from '@nestjs/common'
import { isSlovenskoSkFormDefinition } from 'forms-shared/definitions/formDefinitionTypes'
import { getFormDefinitionBySlug } from 'forms-shared/definitions/getFormDefinitionBySlug'
import { getSignerData } from 'forms-shared/signer/signerData'
import {
  formatValidateXmlResultErrors,
  validateXml,
} from 'forms-shared/slovensko-sk/validateXml'

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
}

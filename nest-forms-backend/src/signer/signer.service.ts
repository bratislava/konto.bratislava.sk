import { ErrorFactoryService } from '@bratislava/log-nest'
import { Injectable, Logger } from '@nestjs/common'
import { isSlovenskoSkFormDefinition } from 'forms-shared/definitions/formDefinitionTypes'
import { getFormDefinitionBySlug } from 'forms-shared/definitions/getFormDefinitionBySlug'
import { getSignerData } from 'forms-shared/signer/signerData'
import { validateXml } from 'forms-shared/slovensko-sk/validateXml'

import FormValidatorRegistryService from '../form-validator-registry/form-validator-registry.service'
import {
  FormsErrorsEnum,
  FormsErrorsResponseEnum,
} from '../forms/forms.errors.enum'
import FormsService from '../forms/forms.service'
import PrismaService from '../prisma/prisma.service'
import { SignerDataRequestDto, SignerDataResponseDto } from './signer.dto'
import {
  SignerErrorsEnum,
  SignerErrorsResponseEnum,
} from './signer.errors.enum'

@Injectable()
export default class SignerService {
  private readonly logger: Logger

  constructor(
    private readonly errorFactoryService: ErrorFactoryService,
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

    throw this.errorFactoryService.BadRequestException({
      errorEnum: SignerErrorsEnum.XML_VALIDATION_ERROR,
      message: SignerErrorsResponseEnum.XML_VALIDATION_ERROR,
      // Only positions: libxml error messages can quote the offending (user-entered) value
      console: {
        errorPositions: result.errors?.map(({ line, col }) => ({ line, col })),
      },
    })
  }

  async getSignerData(
    formId: string,
    data: SignerDataRequestDto,
  ): Promise<SignerDataResponseDto> {
    const form = await this.formsService.getUniqueForm(formId)
    if (!form) {
      throw this.errorFactoryService.NotFoundException({
        errorEnum: FormsErrorsEnum.FORM_NOT_FOUND_ERROR,
        message: FormsErrorsResponseEnum.FORM_NOT_FOUND_ERROR,
      })
    }

    const formDefinition = getFormDefinitionBySlug(form.formDefinitionSlug)
    if (formDefinition === null) {
      throw this.errorFactoryService.NotFoundException({
        errorEnum: FormsErrorsEnum.FORM_DEFINITION_NOT_FOUND,
        message: `getSignerData: ${FormsErrorsResponseEnum.FORM_DEFINITION_NOT_FOUND} ${form.formDefinitionSlug}`,
      })
    }
    if (!isSlovenskoSkFormDefinition(formDefinition)) {
      throw this.errorFactoryService.UnprocessableEntityException({
        errorEnum: FormsErrorsEnum.FORM_DEFINITION_NOT_SUPPORTED_TYPE,
        message: FormsErrorsResponseEnum.FORM_DEFINITION_NOT_SUPPORTED_TYPE,
        console: {
          formDefinitionType: formDefinition.type,
          slug: form.formDefinitionSlug,
        },
      })
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

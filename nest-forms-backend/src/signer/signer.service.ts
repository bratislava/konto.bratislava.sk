import { Injectable, Logger } from '@nestjs/common'
import { GenericObjectType } from '@rjsf/utils'
import { isSlovenskoSkFormDefinition } from 'forms-shared/definitions/formDefinitionTypes'
import { getFormDefinitionBySlug } from 'forms-shared/definitions/getFormDefinitionBySlug'
import { getSignerData } from 'forms-shared/signer/signerData'

import { CognitoGetUserData } from '../auth/dtos/cognito.dto'
import FormValidatorRegistryService from '../form-validator-registry/form-validator-registry.service'
import {
  FormsErrorsEnum,
  FormsErrorsResponseEnum,
} from '../forms/forms.errors.enum'
import FormsService from '../forms/forms.service'
import PrismaService from '../prisma/prisma.service'
import ThrowerErrorGuard from '../utils/guards/thrower-error.guard'
import { FormWithFiles } from '../utils/types/prisma'
import { SignerDataRequestDto, SignerDataResponseDto } from './signer.dto'

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

    // Find a better way how to get the form with files
    const formWithFiles = (await this.prismaService.forms.findUnique({
      where: {
        id: form.id,
      },
      include: {
        files: true,
      },
    })) as FormWithFiles

    const signerData = await getSignerData({
      formDefinition,
      formId: data.formId,
      formData: form.formDataJson as GenericObjectType,
      validatorRegistry: this.formValidatorRegistryService.getRegistry(),
      serverFiles: formWithFiles.files,
    })

    return signerData
  }
}

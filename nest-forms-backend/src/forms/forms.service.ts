import { forwardRef, Inject, Injectable } from '@nestjs/common'
import { Forms, FormState, Prisma } from '@prisma/client'
import { getFormDefinitionBySlug } from 'forms-shared/definitions/getFormDefinitionBySlug'
import { extractFormSubjectPlain } from 'forms-shared/form-utils/formDataExtractors'
import { omitExtraData } from 'forms-shared/form-utils/omitExtraData'
import { versionCompareRequiresBumpToContinue } from 'forms-shared/versioning/version-compare'

import { AuthUser, User } from '../auth-v2/types/user'
import { getUserIco } from '../auth-v2/utils/user-utils'
// eslint-disable-next-line import/no-cycle
import FilesService from '../files/files.service'
import FormValidatorRegistryService from '../form-validator-registry/form-validator-registry.service'
import { FormAccessService } from '../forms-v2/services/form-access.service'
import {
  GetFormResponseSimpleDto,
  GetFormsRequestDto,
  GetFormsResponseDto,
} from '../nases/dtos/requests.dto'
import PrismaService from '../prisma/prisma.service'
import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  EDITABLE_ERRORS,
} from '../utils/constants'
import {
  ErrorsEnum,
  ErrorsResponseEnum,
} from '../utils/global-enums/errors.enum'
import ThrowerErrorGuard from '../utils/guards/thrower-error.guard'
import { LineLoggerSubservice } from '../utils/subservices/line-logger.subservice'
import { FormUpdateBodyDto } from './dtos/forms.requests.dto'
import { FormsErrorsEnum, FormsErrorsResponseEnum } from './forms.errors.enum'
import FormsHelper from './forms.helper'

@Injectable()
export default class FormsService {
  private readonly logger: LineLoggerSubservice

  constructor(
    private readonly prisma: PrismaService,
    private readonly formsHelper: FormsHelper,
    private throwerErrorGuard: ThrowerErrorGuard,
    @Inject(forwardRef(() => FilesService))
    private filesService: FilesService,
    private readonly formValidatorRegistryService: FormValidatorRegistryService,
    private readonly formAccessService: FormAccessService,
  ) {
    this.logger = new LineLoggerSubservice('FormsService')
  }

  async createForm(data: Prisma.FormsUncheckedCreateInput): Promise<Forms> {
    try {
      return await this.prisma.forms.create({
        data,
      })
    } catch (error) {
      throw this.throwerErrorGuard.InternalServerErrorException(
        ErrorsEnum.INTERNAL_SERVER_ERROR,
        'There was an error when creating form.',
        undefined,
        error,
      )
    }
  }

  async updateForm(id: string, data: FormUpdateBodyDto): Promise<Forms> {
    // Try if this form with such id exists and is not archived
    const form = await this.getUniqueForm(id)
    if (form === null) {
      throw this.throwerErrorGuard.NotFoundException(
        FormsErrorsEnum.FORM_NOT_FOUND_ERROR,
        `${FormsErrorsResponseEnum.FORM_NOT_FOUND_ERROR} Received form id: ${id}`,
      )
    }

    /* check if form contains file ids and if so, check if they are valid with this form. */
    if (data.formDataJson) {
      await this.filesService.checkFilesAttachmentsInJson(id, data.formDataJson)
    }

    let formsResult: Forms
    try {
      formsResult = await this.prisma.forms.update({
        where: { id },
        data,
      })
    } catch (error) {
      throw this.throwerErrorGuard.NotFoundException(
        FormsErrorsEnum.FORM_NOT_FOUND_ERROR,
        `${FormsErrorsResponseEnum.FORM_NOT_FOUND_ERROR} Received form id: ${id}`,
        undefined,
        error,
      )
    }
    return formsResult
  }

  async archiveForm(id: string, user: User): Promise<void> {
    const form = await this.getFormWithAccessCheck(id, user)
    if (!FormsHelper.isEditable(form)) {
      throw this.throwerErrorGuard.BadRequestException(
        FormsErrorsEnum.FORM_NOT_EDITABLE_ERROR,
        FormsErrorsResponseEnum.FORM_NOT_EDITABLE_ERROR,
      )
    }

    try {
      await this.prisma.forms.update({
        where: {
          id,
        },
        data: {
          archived: true,
        },
      })
    } catch (error) {
      throw this.throwerErrorGuard.BadRequestException(
        ErrorsEnum.DATABASE_ERROR,
        ErrorsResponseEnum.DATABASE_ERROR,
        undefined,
        error,
      )
    }
  }

  async getUniqueForm(id: string): Promise<Forms | null> {
    const form = await this.prisma.forms.findUnique({
      where: { id },
    })

    // This is needed because in findUnique only unique fields can be used in the where clause, so not 'archived'
    if (form && form.archived) return null

    return form
  }

  async getForm(id: string, user: User): Promise<Forms> {
    let form: Forms
    try {
      form = await this.prisma.forms.findUniqueOrThrow({
        where: { id },
      })
    } catch (error) {
      throw this.throwerErrorGuard.NotFoundException(
        FormsErrorsEnum.FORM_OR_USER_NOT_FOUND_ERROR,
        `Form with formId: ${id} does not exist`,
        `Form ${id} does not exist`,
        error,
      )
    }

    const { hasAccess } = await this.formAccessService.checkAccessByInstance(
      form,
      user,
    )
    if (!hasAccess || form.archived) {
      throw this.throwerErrorGuard.ForbiddenException(
        FormsErrorsEnum.FORM_IS_OWNED_BY_SOMEONE_ELSE_ERROR,
        FormsErrorsResponseEnum.FORM_IS_OWNED_BY_SOMEONE_ELSE_ERROR,
      )
    }

    const formDefinition = getFormDefinitionBySlug(form.formDefinitionSlug)
    if (!formDefinition) {
      throw this.throwerErrorGuard.NotFoundException(
        FormsErrorsEnum.FORM_DEFINITION_NOT_FOUND,
        `${FormsErrorsResponseEnum.FORM_DEFINITION_NOT_FOUND} ${form.formDefinitionSlug}`,
      )
    }

    return form
  }

  async getForms(
    query: GetFormsRequestDto,
    user: AuthUser,
  ): Promise<GetFormsResponseDto> {
    const { formDefinitionSlug, currentPage, pagination, states, userCanEdit } =
      query
    const take = +(pagination ?? DEFAULT_PAGE_SIZE)
    const skip = (+(currentPage ?? DEFAULT_PAGE) - 1) * take

    const editableStates = [
      { state: FormState.DRAFT },
      { state: FormState.ERROR, error: { in: EDITABLE_ERRORS } },
    ]

    const statesFilter =
      typeof states === 'string'
        ? {
            state: {
              in: [states],
            },
          }
        : !states || states.length === 0
          ? {}
          : {
              state: {
                in: states,
              },
            }

    const where: Prisma.FormsWhereInput = {
      ...statesFilter,
      userExternalId: user.cognitoJwtPayload.sub,
      archived: false,
      formDefinitionSlug,
      formDataJson: {
        not: {
          equals: null,
        },
      },
      updatedAt: {
        not: {
          equals: this.prisma.forms.fields.createdAt,
        },
      },
      OR:
        userCanEdit === undefined
          ? undefined
          : userCanEdit
            ? editableStates
            : [
                {
                  NOT: editableStates,
                },
              ],
    }

    const ico = getUserIco(user)
    if (ico != null) {
      where.userExternalId = undefined
      where.ico = ico
    }

    const data = await this.prisma.forms.findMany({
      where,
      orderBy: [
        {
          createdAt: 'desc',
        },
      ],
      take,
      skip,
      select: {
        id: true,
        updatedAt: true,
        createdAt: true,
        state: true,
        error: true,
        formDataJson: true,
        formDefinitionSlug: true,
      },
    })

    const dataWithLatestFlag: GetFormResponseSimpleDto[] = []
    Object.values(data).forEach((form) => {
      const formDefinition = getFormDefinitionBySlug(form.formDefinitionSlug)
      if (!formDefinition) {
        throw this.throwerErrorGuard.NotFoundException(
          FormsErrorsEnum.FORM_DEFINITION_NOT_FOUND,
          `${FormsErrorsResponseEnum.FORM_DEFINITION_NOT_FOUND} ${form.formDefinitionSlug}`,
        )
      }

      dataWithLatestFlag.push({
        ...form,
        formSubject: extractFormSubjectPlain(formDefinition, form.formDataJson),
        formDefinitionSlug: formDefinition.slug,
      })
    })

    const total = await this.prisma.forms.count({
      where,
    })
    return {
      countPages: Math.ceil(total / take),
      items: dataWithLatestFlag,
      currentPage: +(currentPage ?? DEFAULT_PAGE),
      pagination: take,
      meta: {
        countByState: await this.getFormsCount(where),
      },
    }
  }

  async getFormsCount(
    where: Prisma.FormsWhereInput,
  ): Promise<Record<FormState, number>> {
    const total = await this.prisma.forms.groupBy({
      where,
      _count: {
        _all: true,
      },
      by: ['state'],
    })

    const result: Record<FormState, number> = {} as Record<FormState, number>
    Object.values(FormState).forEach((state) => {
      result[state] = 0
    })

    total.forEach((rec) => {
      // eslint-disable-next-line no-underscore-dangle
      result[rec.state] = rec._count._all
    })

    return result
  }

  async checkFormBeforeSending(id: string): Promise<Forms> {
    const form = await this.prisma.forms.findUnique({
      where: { id },
    })
    if (!form || form.archived) {
      throw this.throwerErrorGuard.NotFoundException(
        FormsErrorsEnum.FORM_NOT_FOUND_ERROR,
        `${FormsErrorsResponseEnum.FORM_NOT_FOUND_ERROR} Received form id: ${id}`,
      )
    }

    if (!FormsHelper.isEditable(form)) {
      throw this.throwerErrorGuard.UnprocessableEntityException(
        FormsErrorsEnum.FORM_NOT_EDITABLE_ERROR,
        `${FormsErrorsResponseEnum.FORM_NOT_EDITABLE_ERROR} Current form state is: ${form.state}.`,
      )
    }
    return form
  }

  async getFormWithAccessCheck(formId: string, user: User): Promise<Forms> {
    const form = await this.getUniqueForm(formId)

    if (!form) {
      throw this.throwerErrorGuard.NotFoundException(
        FormsErrorsEnum.FORM_NOT_FOUND_ERROR,
        FormsErrorsResponseEnum.FORM_NOT_FOUND_ERROR,
      )
    }

    const { hasAccess } = await this.formAccessService.checkAccessByInstance(
      form,
      user,
    )
    if (!hasAccess) {
      throw this.throwerErrorGuard.ForbiddenException(
        FormsErrorsEnum.FORM_IS_OWNED_BY_SOMEONE_ELSE_ERROR,
        FormsErrorsResponseEnum.FORM_IS_OWNED_BY_SOMEONE_ELSE_ERROR,
      )
    }

    return form
  }

  async bumpJsonVersion(form: Forms): Promise<void> {
    if (!FormsHelper.isEditable(form)) {
      throw this.throwerErrorGuard.BadRequestException(
        FormsErrorsEnum.FORM_NOT_EDITABLE_ERROR,
        FormsErrorsResponseEnum.FORM_NOT_EDITABLE_ERROR,
      )
    }

    const formDefinition = getFormDefinitionBySlug(form.formDefinitionSlug)
    if (!formDefinition) {
      throw this.throwerErrorGuard.NotFoundException(
        FormsErrorsEnum.FORM_DEFINITION_NOT_FOUND,
        `${FormsErrorsResponseEnum.FORM_DEFINITION_NOT_FOUND} ${form.formDefinitionSlug}`,
      )
    }

    const requiresBump = versionCompareRequiresBumpToContinue({
      currentVersion: form.jsonVersion,
      latestVersion: formDefinition.jsonVersion,
    })
    if (!requiresBump) {
      throw this.throwerErrorGuard.BadRequestException(
        FormsErrorsEnum.FORM_VERSION_BUMP_NOT_POSSIBLE,
        FormsErrorsResponseEnum.FORM_VERSION_BUMP_NOT_POSSIBLE,
      )
    }

    await this.prisma.forms.update({
      where: { id: form.id },
      data: {
        jsonVersion: formDefinition.jsonVersion,
        formDataJson: omitExtraData(
          formDefinition.schema,
          form.formDataJson ?? {},
          this.formValidatorRegistryService.getRegistry(),
        ),
      },
    })
  }
}

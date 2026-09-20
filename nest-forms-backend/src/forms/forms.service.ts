import { forwardRef, Inject, Injectable } from '@nestjs/common'
import { formDefinitions } from 'forms-shared/definitions/formDefinitions'
import { getFormDefinitionBySlug } from 'forms-shared/definitions/getFormDefinitionBySlug'
import { extractFormSubjectPlain } from 'forms-shared/form-utils/formDataExtractors'
import { baOmitExtraData } from 'forms-shared/form-utils/omitExtraData'
import { versionCompareRequiresBumpToContinue } from 'forms-shared/versioning/version-compare'

import { AuthUser, User } from '../auth-v2/types/user'
import { getUserIco } from '../auth-v2/utils/user-utils'
import FilesService from '../files/files.service'
import FormValidatorRegistryService from '../form-validator-registry/form-validator-registry.service'
import { getUserFormFields } from '../forms-v2/utils/get-user-form-fields'
import { Forms, FormState, Prisma } from '../generated/prisma/client'
import { JwtNasesPayload } from '../nases/types/jwt-nases.types'
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
import {
  FormUpdateBodyDto,
  GetFormsRequestDto,
  UpdateFormRequestDto,
} from './dtos/requests.dto'
import {
  GetFormResponseDto,
  GetFormResponseSimpleDto,
  GetFormsResponseDto,
  UpdateFormResponseDto,
} from './dtos/responses.dto'
import { FormsErrorsEnum, FormsErrorsResponseEnum } from './forms.errors.enum'

/**
 * Prisma filter selecting exactly the forms for which {@link FormsService.isEditable} returns true.
 * Keep the two in sync.
 */
const editableStatesFilter: Prisma.FormsWhereInput[] = [
  { state: FormState.DRAFT },
  { state: FormState.ERROR, error: { in: EDITABLE_ERRORS } },
]

@Injectable()
export default class FormsService {
  constructor(
    private readonly prisma: PrismaService,
    private throwerErrorGuard: ThrowerErrorGuard,
    @Inject(forwardRef(() => FilesService))
    private filesService: FilesService,
    private readonly formValidatorRegistryService: FormValidatorRegistryService,
  ) {}

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

  async archiveForm(formId: string): Promise<void> {
    const form = await this.getUniqueForm(formId)
    if (!form) {
      throw this.throwerErrorGuard.NotFoundException(
        FormsErrorsEnum.FORM_NOT_FOUND_ERROR,
        `${FormsErrorsResponseEnum.FORM_NOT_FOUND_ERROR} Received form id: ${formId}`,
      )
    }

    if (!this.isEditable(form)) {
      throw this.throwerErrorGuard.BadRequestException(
        FormsErrorsEnum.FORM_NOT_EDITABLE_ERROR,
        FormsErrorsResponseEnum.FORM_NOT_EDITABLE_ERROR,
      )
    }

    try {
      await this.prisma.forms.update({
        where: {
          id: formId,
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
    if (form && form.archived) {
      return null
    }

    return form
  }

  async getForm(id: string): Promise<Forms> {
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

    if (form.archived) {
      throw this.throwerErrorGuard.NotFoundException(
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

    return form
  }

  async getFormWithSubject(
    id: string,
  ): Promise<Omit<GetFormResponseDto, 'requiresMigration'>> {
    const form = await this.getForm(id)
    const formDefinition = getFormDefinitionBySlug(form.formDefinitionSlug)
    if (!formDefinition) {
      throw this.throwerErrorGuard.NotFoundException(
        FormsErrorsEnum.FORM_DEFINITION_NOT_FOUND,
        `${FormsErrorsResponseEnum.FORM_DEFINITION_NOT_FOUND} ${form.formDefinitionSlug}`,
      )
    }
    return {
      ...form,
      formSubject: extractFormSubjectPlain(formDefinition, form.formDataJson),
    }
  }

  async updateFormWithUser(
    id: string,
    requestData: FormUpdateBodyDto,
    user: User,
  ): Promise<UpdateFormResponseDto> {
    const form = await this.getUniqueForm(id)
    if (form === null) {
      throw this.throwerErrorGuard.NotFoundException(
        FormsErrorsEnum.FORM_NOT_FOUND_ERROR,
        `${FormsErrorsResponseEnum.FORM_NOT_FOUND_ERROR} Received form id: ${id}`,
      )
    }

    return this.updateForm(id, {
      ...getUserFormFields(user),
      // eslint-disable-next-line @typescript-eslint/no-misused-spread -- FormUpdateBodyDto is a plain data DTO; spreading into update payload is safe
      ...requestData,
    })
  }

  async updateFormEid(
    id: string,
    nasesUser: JwtNasesPayload,
    requestData: UpdateFormRequestDto,
    user: User,
  ): Promise<UpdateFormResponseDto> {
    return this.updateFormWithUser(
      id,
      // eslint-disable-next-line @typescript-eslint/no-misused-spread -- UpdateFormRequestDto is a plain data DTO; spreading into object literal is safe
      { mainUri: nasesUser.sub, actorUri: nasesUser.actor.sub, ...requestData },
      user,
    )
  }

  async getForms(
    query: GetFormsRequestDto,
    user: AuthUser,
  ): Promise<GetFormsResponseDto> {
    const { formDefinitionSlug, currentPage, pagination, states, userCanEdit } =
      query
    const take = Number(pagination ?? DEFAULT_PAGE_SIZE)
    const skip = (Number(currentPage ?? DEFAULT_PAGE) - 1) * take

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

    const ico = getUserIco(user)

    const identityCondition: Prisma.FormsWhereInput =
      ico == null
        ? { userExternalId: user.cognitoJwtPayload.sub }
        : {
            OR: [{ userExternalId: user.cognitoJwtPayload.sub }, { ico }],
          }

    const editabilityCondition: Prisma.FormsWhereInput | undefined =
      userCanEdit === undefined
        ? undefined
        : userCanEdit
          ? { OR: editableStatesFilter }
          : { NOT: editableStatesFilter }

    // Forms with an enabled form definition are returned regardless of their
    // state, while forms with a disabled form definition are only returned when
    // they are NOT in an editable state (i.e. already submitted/completed).
    const disabledSlugs = formDefinitions
      .filter((formDefinition) => formDefinition.isDisabled)
      .map((formDefinition) => formDefinition.slug)
    const disabledFormDefinitionCondition: Prisma.FormsWhereInput = {
      NOT: {
        AND: [
          { formDefinitionSlug: { in: disabledSlugs } },
          { OR: editableStatesFilter },
        ],
      },
    }

    const where: Prisma.FormsWhereInput = {
      ...statesFilter,
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
      AND: [
        identityCondition,
        disabledFormDefinitionCondition,
        ...(editabilityCondition ? [editabilityCondition] : []),
      ],
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
      currentPage: Number(currentPage ?? DEFAULT_PAGE),
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

    if (!this.isEditable(form)) {
      throw this.throwerErrorGuard.UnprocessableEntityException(
        FormsErrorsEnum.FORM_NOT_EDITABLE_ERROR,
        `${FormsErrorsResponseEnum.FORM_NOT_EDITABLE_ERROR} Current form state is: ${form.state}.`,
      )
    }
    return form
  }

  /**
   * Claims the form for sending by moving it from an editable state to QUEUED.
   *
   * The transition is a single conditional UPDATE, so when two sends of the same form race, exactly
   * one of them flips the state and the other one gets `false` back. A plain read-then-write (such
   * as {@link checkFormBeforeSending} followed by {@link updateForm}) is not enough: both requests
   * can read DRAFT before either of them writes QUEUED, and the submission is then queued twice.
   *
   * `data` deliberately cannot carry `formDataJson`: the form data must be final before the form
   * is claimed for sending.
   *
   * @returns whether this caller won the transition
   */
  async transitionToQueued(
    id: string,
    data: Pick<
      Prisma.FormsUpdateManyMutationInput,
      'formSummary' | 'formSentAt' | 'jsonVersion'
    >,
  ): Promise<boolean> {
    const { count } = await this.prisma.forms.updateMany({
      where: {
        id,
        archived: false,
        OR: editableStatesFilter,
      },
      data: {
        ...data,
        state: FormState.QUEUED,
      },
    })

    return count === 1
  }

  async bumpJsonVersion(formId: string): Promise<void> {
    const form = await this.getUniqueForm(formId)
    if (!form) {
      throw this.throwerErrorGuard.NotFoundException(
        FormsErrorsEnum.FORM_NOT_FOUND_ERROR,
        FormsErrorsResponseEnum.FORM_NOT_FOUND_ERROR,
      )
    }

    if (!this.isEditable(form)) {
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
        formDataJson: baOmitExtraData(
          formDefinition.schema,
          form.formDataJson ?? {},
          this.formValidatorRegistryService.getRegistry(),
        ),
      },
    })
  }

  isEditable(form: Forms): boolean {
    return (
      form.state === FormState.DRAFT ||
      (form.state === FormState.ERROR && EDITABLE_ERRORS.includes(form.error))
    )
  }
}

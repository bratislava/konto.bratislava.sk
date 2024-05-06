import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common'
import { Forms, FormState, Prisma } from '@prisma/client'

// eslint-disable-next-line import/no-cycle
import FilesService from '../files/files.service'
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
import {
  getFrontendFormTitleFromForm,
  getSubjectTextFromForm,
} from '../utils/handlers/text.handler'
import { FormWithSchemaAndVersion } from '../utils/types/prisma'
import { FormUpdateBodyDto } from './dtos/forms.requests.dto'
import { FormsErrorsEnum, FormsErrorsResponseEnum } from './forms.errors.enum'
import FormsHelper from './forms.helper'

@Injectable()
export default class FormsService {
  private readonly logger: Logger

  constructor(
    private readonly prisma: PrismaService,
    private readonly formsHelper: FormsHelper,
    private throwerErrorGuard: ThrowerErrorGuard,
    @Inject(forwardRef(() => FilesService))
    private filesService: FilesService,
  ) {
    this.logger = new Logger('FormsService')
  }

  async createForm(
    data: Prisma.FormsUncheckedCreateInput,
  ): Promise<FormWithSchemaAndVersion> {
    try {
      return await this.prisma.forms.create({
        data,
        include: { schemaVersion: { include: { schema: true } } },
      })
    } catch (error) {
      throw this.throwerErrorGuard.InternalServerErrorException(
        ErrorsEnum.INTERNAL_SERVER_ERROR,
        `There was an error when creating form: ${<string>error}`,
      )
    }
  }

  async updateForm(id: string, data: FormUpdateBodyDto): Promise<Forms> {
    // Try if this form with such id exists and is not archived
    const form = await this.getUniqueForm(id, false)
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
      )
    }
    return formsResult
  }

  async archiveForm(
    id: string,
    user: string | null,
    ico: string | null,
  ): Promise<void> {
    const form = await this.getFormWithAccessCheck(id, user, ico, false)
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
      )
    }
  }

  async getUniqueForm<B extends boolean>(
    id: string,
    includeSchema: B,
  ): Promise<(B extends true ? FormWithSchemaAndVersion : Forms) | null>

  async getUniqueForm(
    id: string,
    includeSchema: boolean,
  ): Promise<FormWithSchemaAndVersion | Forms | null> {
    const form = await this.prisma.forms.findUnique({
      where: { id },
      include: includeSchema
        ? {
            schemaVersion: {
              include: {
                schema: true,
              },
            },
          }
        : undefined,
    })

    // This is needed because in findUnique only unique fields can be used in the where clause, so not 'archived'
    if (form && form.archived) return null

    return form
  }

  async getForm<B extends boolean>(
    id: string,
    includeSchema: B,
    ico: string | null,
    userExternalId?: string,
  ): Promise<B extends true ? FormWithSchemaAndVersion : Forms>

  // we can't get the frontend title unless we ask to include schema - without it we always return frontendTitle: null
  async getForm(
    id: string,
    includeSchema: boolean,
    ico: string | null,
    userExternalId?: string,
  ): Promise<
    (FormWithSchemaAndVersion | Forms) & { frontendTitle: string | null }
  > {
    let form: FormWithSchemaAndVersion | Forms
    let frontendTitle: string | null = null
    try {
      form = await this.prisma.forms.findUniqueOrThrow({
        where: { id },
        include: includeSchema
          ? {
              schemaVersion: {
                include: {
                  schema: true,
                },
              },
            }
          : undefined,
      })
    } catch (error) {
      throw this.throwerErrorGuard.NotFoundException(
        FormsErrorsEnum.FORM_OR_USER_NOT_FOUND_ERROR,
        `Form with formId: ${id}, does not exist for the user: ${<string>(
          userExternalId
        )}`,
        `Form ${id} does not exist for the user: ${<string>userExternalId}`,
      )
    }

    if (
      !this.formsHelper.isFormAccessGranted(
        form,
        userExternalId ?? null,
        ico,
      ) ||
      form.archived
    ) {
      throw this.throwerErrorGuard.ForbiddenException(
        FormsErrorsEnum.FORM_IS_OWNED_BY_SOMEONE_ELSE_ERROR,
        FormsErrorsResponseEnum.FORM_IS_OWNED_BY_SOMEONE_ELSE_ERROR,
      )
    }

    if (includeSchema) {
      frontendTitle = getFrontendFormTitleFromForm(
        form as FormWithSchemaAndVersion,
      )
    }

    return {
      ...form,
      frontendTitle,
    }
  }

  async getForms(
    query: GetFormsRequestDto,
    userExternalId: string,
    ico: string | null,
  ): Promise<GetFormsResponseDto> {
    const { currentPage, pagination } = query
    const take = +(pagination ?? DEFAULT_PAGE_SIZE)
    const skip = (+(currentPage ?? DEFAULT_PAGE) - 1) * take

    const { formName, pospID, states, schemaVersionId, userCanEdit } = query

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
      userExternalId,
      archived: false,
      schemaVersionId,
      schemaVersion: {
        pospID,
        schema: {
          formName,
        },
      },
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

    if (ico !== null) {
      where.userExternalId = undefined
      where.ico = ico
    }

    const data = userExternalId
      ? await this.prisma.forms.findMany({
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
            schemaVersionId: true,
            schemaVersion: {
              select: {
                messageSubjectFormat: true,
                schema: true,
                uiSchema: true,
              },
            },
          },
        })
      : []

    const dataWithLatestFlag: GetFormResponseSimpleDto[] = []
    Object.values(data).forEach((form) => {
      const isLatestSchemaVersionForSlug =
        form.schemaVersionId === form.schemaVersion.schema.latestVersionId
      const messageSubject = getSubjectTextFromForm(form)
      // fallback to messageSubject if title can't be parsed
      const frontendTitle = getFrontendFormTitleFromForm(form) || messageSubject
      const formWithoutUiSchema = {
        ...form,
        schemaVersion: {
          ...form.schemaVersion,
          uiSchema: undefined,
        },
      }
      dataWithLatestFlag.push({
        ...formWithoutUiSchema,
        isLatestSchemaVersionForSlug,
        messageSubject,
        frontendTitle,
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

  async checkFormBeforeSending(id: string): Promise<FormWithSchemaAndVersion> {
    const form = await this.prisma.forms.findUnique({
      where: { id },
      include: { schemaVersion: { include: { schema: true } } },
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

  async getFormWithAccessCheck<B extends boolean>(
    formId: string,
    user: string | null,
    ico: string | null,
    includeSchema: B,
  ): Promise<B extends true ? FormWithSchemaAndVersion : Forms>

  async getFormWithAccessCheck(
    formId: string,
    user: string | null,
    ico: string | null,
    includeSchema: boolean,
  ): Promise<FormWithSchemaAndVersion | Forms> {
    const form = await this.getUniqueForm(formId, includeSchema)

    if (!form) {
      throw this.throwerErrorGuard.NotFoundException(
        FormsErrorsEnum.FORM_NOT_FOUND_ERROR,
        FormsErrorsResponseEnum.FORM_NOT_FOUND_ERROR,
      )
    }

    if (!this.formsHelper.isFormAccessGranted(form, user, ico)) {
      throw this.throwerErrorGuard.ForbiddenException(
        FormsErrorsEnum.FORM_IS_OWNED_BY_SOMEONE_ELSE_ERROR,
        FormsErrorsResponseEnum.FORM_IS_OWNED_BY_SOMEONE_ELSE_ERROR,
      )
    }

    return form
  }
}

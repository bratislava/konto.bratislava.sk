import { Injectable, NotFoundException } from '@nestjs/common'
import { getFormDefinitionBySlug } from 'forms-shared/definitions/getFormDefinitionBySlug'

import { isAuthUser, isGuestUser, User } from '../../auth-v2/types/user'
import { getUserIco } from '../../auth-v2/utils/user-utils'
import { Forms } from '../../generated/prisma/client'
import PrismaService from '../../prisma/prisma.service'
import { FormMigrationsService } from './form-migrations.service'

export enum FormAccessType {
  UserAccess = 'User',
  Ico = 'Ico',
  GuestIdentity = 'GuestIdentity',
  Migration = 'Migration',
}

export interface FormAccessOptions {
  /**
   * Whether to check if the user has access through pending migrations.
   * When true, authenticated users can access forms that belong to guest identities
   * they have valid migrations for.
   * @default false
   */
  checkMigrations?: boolean
}

export type FormAccessResult =
  | { hasAccess: true; accessType: FormAccessType }
  | { hasAccess: false }

@Injectable()
export class FormAccessService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly formMigrationsService: FormMigrationsService,
  ) {}

  /**
   * Checks if a user has access to a specific form by ID.
   */
  async checkAccessById(
    formId: string,
    user: User,
    options: FormAccessOptions = {},
  ) {
    const form = await this.prismaService.forms.findUnique({
      where: { id: formId },
      select: {
        id: true,
        formDefinitionSlug: true,
        userExternalId: true,
        cognitoGuestIdentityId: true,
        ico: true,
      },
    })

    if (!form) {
      // TODO: Errors
      throw new NotFoundException(`Form with id ${formId} not found`)
    }

    return this.checkAccessByInstance(form, user, options)
  }

  /**
   * Checks if a user has access to a form using a form instance.
   */
  async checkAccessByInstance(
    form: Pick<
      Forms,
      | 'id'
      | 'formDefinitionSlug'
      | 'userExternalId'
      | 'cognitoGuestIdentityId'
      | 'ico'
    >,
    user: User,
    options: FormAccessOptions = {},
  ): Promise<FormAccessResult> {
    const { checkMigrations = false } = options

    if (this.hasUserAccess(form, user)) {
      return { hasAccess: true, accessType: FormAccessType.UserAccess }
    }

    if (this.hasIcoAccess(form, user)) {
      return { hasAccess: true, accessType: FormAccessType.Ico }
    }

    if (this.hasGuestIdentityAccess(form, user)) {
      return { hasAccess: true, accessType: FormAccessType.GuestIdentity }
    }

    if (checkMigrations) {
      const hasMigrationAccess = await this.hasMigrationAccess(form, user)
      if (hasMigrationAccess) {
        return { hasAccess: true, accessType: FormAccessType.Migration }
      }
    }

    return { hasAccess: false }
  }

  private hasUserAccess(
    form: Pick<Forms, 'userExternalId'>,
    user: User,
  ): boolean {
    if (!form.userExternalId || !isAuthUser(user)) {
      return false
    }

    return form.userExternalId === user.cognitoJwtPayload.sub
  }

  private hasIcoAccess(form: Pick<Forms, 'ico'>, user: User): boolean {
    const formIco = form.ico

    if (!formIco || !isAuthUser(user)) {
      return false
    }

    const userIco = getUserIco(user)
    if (!userIco) {
      return false
    }

    return formIco === userIco
  }

  private hasGuestIdentityAccess(
    form: Pick<Forms, 'cognitoGuestIdentityId' | 'formDefinitionSlug'>,
    user: User,
  ): boolean {
    if (!form.cognitoGuestIdentityId || !isGuestUser(user)) {
      return false
    }

    // Embedded forms run in an iframe on another site, where the browser doesn't
    // keep our cookies, including the guest identity one. Every request gets a
    // new guest identity, so the guest who created the form can't be recognised.
    // Any guest can therefore access an embedded form, and its ID is the only
    // secret. This also applies when the form is opened directly on our site.
    const isEmbeddedForm = Boolean(
      getFormDefinitionBySlug(form.formDefinitionSlug)?.embedded,
    )

    return (
      isEmbeddedForm || form.cognitoGuestIdentityId === user.cognitoIdentityId
    )
  }

  private async hasMigrationAccess(
    form: Pick<Forms, 'cognitoGuestIdentityId'>,
    user: User,
  ): Promise<boolean> {
    if (!form.cognitoGuestIdentityId || !isAuthUser(user)) {
      return false
    }

    return this.formMigrationsService.hasValidMigration(
      user.cognitoJwtPayload.sub,
      form.cognitoGuestIdentityId,
    )
  }
}

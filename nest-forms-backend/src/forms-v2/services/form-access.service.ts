import { Injectable, NotFoundException } from '@nestjs/common'
import { Forms } from '@prisma/client'

import { isAuthUser, isGuestUser, User } from '../../auth-v2/types/user'
import { getUserIco } from '../../auth-v2/utils/user-utils'
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

@Injectable()
export class FormAccessService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly formMigrationsService: FormMigrationsService,
  ) {}

  /**
   * Checks if a user has access to a specific form.
   *
   * @param formId The ID of the form to check access for
   * @param user The user requesting access
   * @param options Options for access checking
   * @returns The type of access if user has access, null otherwise
   */
  async hasAccess(
    formId: string,
    user: User,
    options: FormAccessOptions = {},
  ): Promise<FormAccessType | null> {
    const { checkMigrations = false } = options

    const form = await this.prismaService.forms.findUnique({
      where: { id: formId },
      select: {
        id: true,
        userExternalId: true,
        cognitoGuestIdentityId: true,
        ico: true,
      },
    })

    if (!form) {
      throw new NotFoundException(`Form with id ${formId} not found`)
    }

    if (this.hasUserAccess(form, user)) {
      return FormAccessType.UserAccess
    }

    if (this.hasIcoAccess(form, user)) {
      return FormAccessType.Ico
    }

    if (this.hasGuestIdentityAccess(form, user)) {
      return FormAccessType.GuestIdentity
    }

    if (checkMigrations) {
      const hasMigrationAccess = await this.hasMigrationAccess(form, user)
      if (hasMigrationAccess) {
        return FormAccessType.Migration
      }
    }

    return null
  }

  /**
   * Checks if user has ICO-based access to the form.
   */
  private hasIcoAccess(form: Pick<Forms, 'ico'>, user: User): boolean {
    const formIco = form.ico

    if (!formIco) {
      return false
    }

    if (!isAuthUser(user)) {
      return false
    }

    const userIco = getUserIco(user)
    if (!userIco) {
      return false
    }

    return formIco === userIco
  }

  /**
   * Checks if user has guest identity-based access to the form.
   */
  private hasGuestIdentityAccess(
    form: Pick<Forms, 'cognitoGuestIdentityId'>,
    user: User,
  ): boolean {
    if (!form.cognitoGuestIdentityId) {
      return false
    }

    if (!isGuestUser(user)) {
      return false
    }

    return form.cognitoGuestIdentityId === user.cognitoIdentityId
  }

  /**
   * Checks if user has direct user-based access to the form.
   */
  private hasUserAccess(
    form: Pick<Forms, 'userExternalId'>,
    user: User,
  ): boolean {
    if (!form.userExternalId) {
      return false
    }

    if (!isAuthUser(user)) {
      return false
    }

    return form.userExternalId === user.cognitoJwtPayload.sub
  }

  /**
   * Checks if an authenticated user has access through valid migrations.
   */
  private async hasMigrationAccess(
    form: Pick<Forms, 'cognitoGuestIdentityId'>,
    user: User,
  ): Promise<boolean> {
    if (!form.cognitoGuestIdentityId) {
      return false
    }

    if (!isAuthUser(user)) {
      return false
    }

    return this.formMigrationsService.hasValidMigration(
      user.cognitoJwtPayload.sub,
      form.cognitoGuestIdentityId,
    )
  }
}

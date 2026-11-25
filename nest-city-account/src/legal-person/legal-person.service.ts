import { ErrorEnum, ErrorFactoryService, LineLoggerService } from '@bratislava/log-nest'
import { Injectable } from '@nestjs/common'

import {
  LegalPerson,
  LegalPersonKindEnum,
  LegalPersonRepresentationTypeEnum,
  PhysicalEntity,
  Prisma,
} from '../generated/prisma/client'
import { PrismaService } from '../prisma/prisma.service'
import { CognitoUserAccountTypesEnum } from '../utils/global-dtos/cognito.dto'

/** A company as identified by an eID login (`Subject.*`) or an admin. */
export interface CompanyIdentity {
  ico: string
  kind: Exclude<LegalPersonKindEnum, 'DEPARTMENT'>
  /** SAML `Subject.UPVSIdentityID` */
  upvsIdentityId?: string
}

/** The person who logged in with eID on behalf of the company (`Actor.*`). */
export interface RepresentativeIdentity {
  birthNumber: string
  /** SAML `Actor.UPVSIdentityID` */
  upvsIdentityId?: string
  /** SAML `Actor.FormattedName` */
  upvsName?: string
}

const REPRESENTATION_TYPE_BY_KIND = {
  [LegalPersonKindEnum.PO]: LegalPersonRepresentationTypeEnum.STATUTORY_BODY,
  [LegalPersonKindEnum.FO_P]: LegalPersonRepresentationTypeEnum.OWNER,
} as const satisfies Record<CompanyIdentity['kind'], LegalPersonRepresentationTypeEnum>

/** Stored birth numbers come both with and without the slash (`YYMMDD/XXXX`). */
const birthNumberVariants = (birthNumber: string): string[] => {
  const normalized = birthNumber.replaceAll('/', '')
  return [...new Set([birthNumber, normalized, `${normalized.slice(0, 6)}/${normalized.slice(6)}`])]
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const KIND_BY_ACCOUNT_TYPE = {
  [CognitoUserAccountTypesEnum.LEGAL_ENTITY]: LegalPersonKindEnum.PO,
  [CognitoUserAccountTypesEnum.SELF_EMPLOYED_ENTITY]: LegalPersonKindEnum.FO_P,
  [CognitoUserAccountTypesEnum.PHYSICAL_ENTITY]: null,
} as const satisfies Record<CognitoUserAccountTypesEnum, CompanyIdentity['kind'] | null>

export function legalPersonKindFromAccountType(
  accountType: CognitoUserAccountTypesEnum | undefined
): CompanyIdentity['kind'] | null {
  return accountType ? KIND_BY_ACCOUNT_TYPE[accountType] : null
}

/** Relations that hold what used to be `LegalPersonAccount.ico` / `.birthNumber`. */
export const LEGAL_PERSON_ACCOUNT_IDENTIFIERS_INCLUDE = {
  legalPerson: { select: { ico: true } },
  physicalEntity: { select: { birthNumber: true } },
} as const satisfies Prisma.LegalPersonAccountInclude

type LegalPersonAccountWithIdentifierRelations = Prisma.LegalPersonAccountGetPayload<{
  include: typeof LEGAL_PERSON_ACCOUNT_IDENTIFIERS_INCLUDE
}>

export type LegalPersonAccountWithIdentifiers = Omit<
  LegalPersonAccountWithIdentifierRelations,
  'legalPerson' | 'physicalEntity'
> & {
  /** IČO of the linked company (department code for department accounts). */
  ico: string | null
  /** Birth number of the representative who verified the account; NULL for departments. */
  birthNumber: string | null
}

/** Flatten the company / representative relations into the `ico` / `birthNumber` the API exposes. */
export function withLegalPersonAccountIdentifiers({
  legalPerson,
  physicalEntity,
  ...account
}: LegalPersonAccountWithIdentifierRelations): LegalPersonAccountWithIdentifiers {
  return {
    ...account,
    ico: legalPerson?.ico ?? null,
    birthNumber: physicalEntity?.birthNumber ?? null,
  }
}

/**
 * Owns the company (LegalPerson) / representative (PhysicalEntity) / login (LegalPersonAccount)
 * model. All writes that touch `LegalPersonAccount.legalPersonId` or `.physicalEntityId`
 * must go through here, so the DB constraints described in schema.prisma hold.
 */
@Injectable()
export class LegalPersonService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly errorFactoryService: ErrorFactoryService,
    private readonly logger: LineLoggerService
  ) {}

  /**
   * Record a successful verification: upsert the company and its representative, (re)validate the
   * representation and link the account to both.
   */
  async linkVerifiedAccount(
    accountId: string,
    companyInput: CompanyIdentity,
    representativeInput: RepresentativeIdentity
  ): Promise<void> {
    const company = {
      ...companyInput,
      upvsIdentityId: this.asUuid(companyInput.upvsIdentityId, 'company', accountId),
    }
    const representative = {
      ...representativeInput,
      upvsIdentityId: this.asUuid(representativeInput.upvsIdentityId, 'representative', accountId),
    }
    await this.prisma.$transaction(async (tx) => {
      const legalPerson = await this.upsertCompany(tx, company)
      const physicalEntity = await this.upsertRepresentative(tx, representative)
      const now = new Date()
      await tx.legalPersonRepresentation.upsert({
        where: {
          physicalEntityId_legalPersonId: {
            physicalEntityId: physicalEntity.id,
            legalPersonId: legalPerson.id,
          },
        },
        create: {
          physicalEntityId: physicalEntity.id,
          legalPersonId: legalPerson.id,
          type: REPRESENTATION_TYPE_BY_KIND[company.kind],
          validFrom: now,
          lastVerifiedAt: now,
        },
        // A fresh eID login proves the representation is valid again.
        update: { validTo: null, lastVerifiedAt: now },
      })
      await tx.legalPersonAccount.update({
        where: { id: accountId },
        data: {
          legalPersonId: legalPerson.id,
          physicalEntityId: physicalEntity.id,
          lastVerificationAttempt: now,
        },
      })
    })
  }

  /** UPVS should always send UUIDs; drop anything else rather than failing the verification. */
  private asUuid(value: string | undefined, field: string, accountId: string) {
    if (value === undefined || UUID_REGEX.test(value)) {
      return value?.toLowerCase()
    }
    this.logger.error('UPVS identity id is not a UUID, ignoring it', { field, accountId })
    return undefined
  }

  /** Clear the company link of an account. */
  async unlinkAccount(
    where: Prisma.LegalPersonAccountWhereUniqueInput,
    tx: Prisma.TransactionClient = this.prisma
  ): Promise<LegalPersonAccountWithIdentifiers> {
    const account = await tx.legalPersonAccount.update({
      where,
      data: { legalPersonId: null, physicalEntityId: null },
      include: LEGAL_PERSON_ACCOUNT_IDENTIFIERS_INCLUDE,
    })
    return withLegalPersonAccountIdentifiers(account)
  }

  /**
   * The account already verified for this company by this representative, if any (replaces the
   * old `(ico, birthNumber)` unique lookup).
   */
  async findAccountByCompanyAndRepresentative(ico: string, birthNumber: string) {
    return this.prisma.legalPersonAccount.findFirst({
      where: {
        legalPerson: { ico },
        physicalEntity: { birthNumber: { in: birthNumberVariants(birthNumber) } },
      },
    })
  }


  /**
   * Correct PO <-> FO_P of the company linked to the account from its Cognito account type.
   * Needed because the #1801 migration could only classify companies as PO; it runs on every
   * login and on the admin Cognito -> DB sync.
   */
  async syncKindFromAccountType(
    accountId: string,
    accountType: CognitoUserAccountTypesEnum | undefined
  ): Promise<void> {
    const kind = legalPersonKindFromAccountType(accountType)
    if (!kind) {
      return
    }
    await this.prisma.$transaction(async (tx) => {
      const account = await tx.legalPersonAccount.findUnique({
        where: { id: accountId },
        select: { legalPerson: true },
      })
      if (!account?.legalPerson || account.legalPerson.kind === kind) {
        return
      }
      await this.changeKind(tx, account.legalPerson, kind)
    })
  }

  private async upsertCompany(
    tx: Prisma.TransactionClient,
    company: CompanyIdentity
  ): Promise<LegalPerson> {
    const existing = await tx.legalPerson.findUnique({ where: { ico: company.ico } })
    if (!existing) {
      return tx.legalPerson.create({
        data: { ico: company.ico, kind: company.kind, upvsIdentityId: company.upvsIdentityId },
      })
    }

    if (
      company.upvsIdentityId &&
      existing.upvsIdentityId &&
      existing.upvsIdentityId !== company.upvsIdentityId
    ) {
      // Same IČO, different UPVS identity: a dissolved company whose IČO was reassigned, or bad
      // data. Do not silently re-point the existing company.
      throw this.errorFactoryService.InternalServerErrorException({
        errorEnum: ErrorEnum.INTERNAL_SERVER_ERROR,
        message: 'LegalPerson already has a different UPVS identity than the eID subject.',
        console: { legalPersonId: existing.id },
      })
    }

    let legalPerson = existing
    if (!existing.upvsIdentityId && company.upvsIdentityId) {
      legalPerson = await tx.legalPerson.update({
        where: { id: existing.id },
        data: { upvsIdentityId: company.upvsIdentityId },
      })
    }
    if (legalPerson.kind !== company.kind) {
      legalPerson = await this.changeKind(tx, legalPerson, company.kind)
    }
    return legalPerson
  }

  /**
   * Switch a company between PO and FO_P together with its representation types (checked by a
   * deferred DB trigger at commit). A department is never switched.
   */
  private async changeKind(
    tx: Prisma.TransactionClient,
    legalPerson: LegalPerson,
    kind: CompanyIdentity['kind']
  ): Promise<LegalPerson> {
    if (legalPerson.kind === LegalPersonKindEnum.DEPARTMENT) {
      throw this.errorFactoryService.InternalServerErrorException({
        errorEnum: ErrorEnum.INTERNAL_SERVER_ERROR,
        message: 'Department LegalPerson cannot change kind.',
        console: { legalPersonId: legalPerson.id, targetKind: kind },
      })
    }
    this.logger.warn('Changing LegalPerson kind', {
      legalPersonId: legalPerson.id,
      from: legalPerson.kind,
      to: kind,
    })
    await tx.legalPersonRepresentation.updateMany({
      where: { legalPersonId: legalPerson.id },
      data: { type: REPRESENTATION_TYPE_BY_KIND[kind] },
    })
    return tx.legalPerson.update({ where: { id: legalPerson.id }, data: { kind } })
  }

  /**
   * Find the representative by UPVS identity, then by birth number (preferring the entity linked
   * to a User, as PhysicalEntity.birthNumber is not unique), else create one without a User.
   */
  private async upsertRepresentative(
    tx: Prisma.TransactionClient,
    representative: RepresentativeIdentity
  ): Promise<PhysicalEntity> {
    const identityData = {
      upvsIdentityId: representative.upvsIdentityId,
      upvsName: representative.upvsName,
    }

    const byUpvsIdentity = representative.upvsIdentityId
      ? await tx.physicalEntity.findUnique({
          where: { upvsIdentityId: representative.upvsIdentityId },
        })
      : null
    if (byUpvsIdentity) {
      return tx.physicalEntity.update({ where: { id: byUpvsIdentity.id }, data: identityData })
    }

    const byBirthNumber = await tx.physicalEntity.findMany({
      where: { birthNumber: { in: birthNumberVariants(representative.birthNumber) } },
      orderBy: { createdAt: 'asc' },
    })
    if (byBirthNumber.length > 1) {
      this.logger.warn('Multiple physical entities with the same birth number for representative', {
        physicalEntityIds: byBirthNumber.map((entity) => entity.id),
      })
    }
    const match = byBirthNumber.find((entity) => entity.userId !== null) ?? byBirthNumber.at(0)
    if (match) {
      return tx.physicalEntity.update({ where: { id: match.id }, data: identityData })
    }

    return tx.physicalEntity.create({
      data: { birthNumber: representative.birthNumber, ...identityData },
    })
  }
}

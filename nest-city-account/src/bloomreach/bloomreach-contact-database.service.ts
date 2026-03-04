import { Inject, Injectable } from '@nestjs/common'

import { LineLoggerSubservice } from '../utils/subservices/line-logger.subservice'
import ThrowerErrorGuard from '../utils/guards/errors.guard'
import { ErrorsEnum } from '../utils/guards/dtos/error.dto'
import { toLogfmt } from '../utils/logging'
import { IDatabase } from 'pg-promise'

interface BloomreachContactRecord {
  uuid: string
  birth_number?: string
  ico?: string
  email?: string
  phone?: string
}

@Injectable()
export class BloomreachContactDatabaseService {
  private readonly logger: LineLoggerSubservice

  constructor(
    private readonly throwerErrorGuard: ThrowerErrorGuard,
    @Inject('BLOOMREACH_CONTACT_DB') private readonly contactDatabase: IDatabase<unknown>
  ) {
    this.logger = new LineLoggerSubservice(BloomreachContactDatabaseService.name)
  }

  /**
   * Upserts a bloomreach contact with retry.
   *
   * Find is performed by exact match on birth number and ico (including matchingnull values).
   * If no match is found and ico is provided, a secondary find is performed by
   * exact match on ico and case insensitive match on email.
   *
   * If a match is found, the contact is updated with all of email, birth number and ico.
   * If no match is found, a new contact is inserted with email, birth number and ico.
   * @param email - The email of the contact.
   * @param birthNumber - The birth number of the contact.
   * @param ico - The ico of the contact.
   * @returns The uuid of the contact. Undefined if all attempts fail.
   */
  async upsert(email: string, birthNumber: string, ico?: string): Promise<string | undefined> {
    let loggedError: Error | undefined
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        return await this.handleUpsert(email, birthNumber, ico)
      } catch (error) {
        loggedError = this.throwerErrorGuard.InternalServerErrorException(
          ErrorsEnum.INTERNAL_SERVER_ERROR,
          `Failed to upsert bloomreach contact on attempt: ${attempt}`,
          toLogfmt({ email, hasBirthNumber: !!birthNumber, hasIco: !!ico, attempt }),
          error
        )
        this.logger.error(loggedError?.message) // this won't alert
      }
    }
    this.logger.error(loggedError)
    return undefined
  }

  private async handleUpsert(email: string, birthNumber: string, ico?: string): Promise<string> {
    let contact = await this.find(birthNumber, ico)

    if (!contact?.uuid && ico) {
      contact = await this.findIcoEmailMatch(email, ico)
    }
    if (!contact?.uuid) {
      return await this.insert(email, birthNumber, ico)
    }

    const needsUpdate =
      (contact.email ?? undefined) !== email ||
      (contact.birth_number ?? undefined) !== birthNumber ||
      (contact.ico ?? undefined) !== (ico ?? undefined)

    if (needsUpdate) {
      await this.update(contact.uuid, email, birthNumber, ico)
    }
    return contact.uuid
  }

  private async findIcoEmailMatch(
    email: string,
    ico: string
  ): Promise<BloomreachContactRecord | null> {
    if (!email) {
      return null
    }

    const icoContact = await this.find(undefined, ico)
    if (!icoContact?.uuid || !icoContact.email) {
      return null
    }

    if (icoContact.email.toLowerCase() !== email.toLowerCase()) {
      return null
    }

    return icoContact
  }

  async find(birthNumber?: string, ico?: string): Promise<BloomreachContactRecord | null> {
    const query = `
      SELECT * FROM public.contacts 
      WHERE birth_number IS NOT DISTINCT FROM $1 AND ico IS NOT DISTINCT FROM $2
    `
    const data = await this.contactDatabase.oneOrNone<BloomreachContactRecord>(query, [
      birthNumber ?? null,
      ico ?? null,
    ])

    return data
  }

  async update(uuid: string, email: string, birthNumber: string, ico?: string): Promise<void> {
    const query = `
      UPDATE public.contacts
      SET email = $1, birth_number = $2, ico = $3
      WHERE uuid = $4
    `
    await this.contactDatabase.none(query, [email, birthNumber, ico ?? null, uuid])
  }

  async addPhone(uuid: string, phoneNumber: string): Promise<void> {
    const query = `
      UPDATE public.contacts
      SET phone = $1
      WHERE uuid = $2
    `
    await this.contactDatabase.none(query, [phoneNumber, uuid])
  }

  async insert(email: string, birthNumber: string, ico?: string): Promise<string> {
    const query = `
      INSERT INTO public.contacts (email, birth_number, ico)
      VALUES ($1, $2, $3)
      RETURNING uuid
    `
    const data = await this.contactDatabase.one<BloomreachContactRecord>(query, [
      email,
      birthNumber,
      ico ?? null,
    ])
    return data.uuid
  }
}

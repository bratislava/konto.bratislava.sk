import { Injectable } from '@nestjs/common'

import { User, UserType } from '../../auth-v2/types/user'
import { FormsRepository } from '../repositories/forms.repository'
import { getFormDefinitionBySlugOrThrow } from '../utils/form-definition'

@Injectable()
export class FormsV2Service {
  constructor(private readonly formsRepository: FormsRepository) {}

  async createForm({
    user,
    formDefinitionSlug,
  }: {
    user: User
    formDefinitionSlug: string
  }) {
    const formDefinition = getFormDefinitionBySlugOrThrow(formDefinitionSlug)
    const userExternalId =
      user.type === UserType.Auth ? user.cognitoJwtPayload.sub : null
    const cognitoGuestIdentityId =
      user.type === UserType.Guest ? user.cognitoIdentityId : null
    const ico =
      user.type === UserType.Auth && 'ico' in user.cityAccountUser
        ? user.cityAccountUser.ico
        : null

    return this.formsRepository.createForm({
      userExternalId,
      formDefinitionSlug: formDefinition.slug,
      jsonVersion: formDefinition.jsonVersion,
      ico,
    })
  }
}

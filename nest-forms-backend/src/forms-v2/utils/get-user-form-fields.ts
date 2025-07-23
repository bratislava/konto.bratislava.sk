import { Forms } from '@prisma/client'

import { isAuthUser, isGuestUser, User } from '../../auth-v2/types/user'
import { getUserIco, userToFormOwnerType } from '../../auth-v2/utils/user-utils'

export const getUserFormFields = (
  user: User,
): Required<
  Pick<
    Forms,
    'cognitoGuestIdentityId' | 'userExternalId' | 'ico' | 'ownerType' | 'email'
  >
> => {
  if (isAuthUser(user)) {
    return {
      cognitoGuestIdentityId: null,
      userExternalId: user.cognitoJwtPayload.sub,
      ico: getUserIco(user),
      ownerType: userToFormOwnerType(user),
      email: user.cityAccountUser.email,
    }
  }

  if (isGuestUser(user)) {
    return {
      cognitoGuestIdentityId: user.cognitoIdentityId,
      userExternalId: null,
      ico: null,
      ownerType: null,
      email: null,
    }
  }

  throw new Error('User is not authenticated or guest')
}

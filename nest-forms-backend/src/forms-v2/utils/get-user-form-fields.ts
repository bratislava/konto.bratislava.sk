import { Forms } from '@prisma/client'

import { isAuthUser, isGuestUser, User } from '../../auth-v2/types/user'
import { getUserIco, userToFormOwnerType } from '../../auth-v2/utils/user-utils'

export const getUserFormFields = (
  user: User,
): Required<
  Pick<Forms, 'cognitoGuestIdentityId' | 'userExternalId' | 'ico' | 'ownerType'>
> => {
  if (isAuthUser(user)) {
    return {
      cognitoGuestIdentityId: null,
      userExternalId: user.cognitoJwtPayload.sub,
      ico: getUserIco(user),
      ownerType: userToFormOwnerType(user),
    }
  }

  if (isGuestUser(user)) {
    return {
      cognitoGuestIdentityId: user.cognitoIdentityId,
      userExternalId: null,
      ico: null,
      ownerType: null,
    }
  }

  throw new Error('User is not authenticated or guest')
}

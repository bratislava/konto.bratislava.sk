import { SetMetadata } from '@nestjs/common'

import { UserType } from '../types/user'

export const ALLOWED_USER_TYPES_KEY = 'allowedUserTypes'

/**
 * Decorator to specify which user types (Auth, Guest) are allowed for a route.
 * @param types An array of UserType enum values (e.g., [UserType.Auth, UserType.Guest])
 */
export const AllowedUserTypes = (types: UserType[]) =>
  SetMetadata(ALLOWED_USER_TYPES_KEY, types)

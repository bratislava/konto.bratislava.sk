import { SetMetadata } from '@nestjs/common'

export const ALLOW_COMPLETED_DISABLED_FORMS_KEY = 'allowCompletedDisabledForms'

/**
 * Decorator to specify whether completed disabled forms are allowed.
 * @param allow A boolean indicating if completed disabled forms are allowed.
 */
export const AllowCompletedDisabledForms = (allow: boolean) =>
  SetMetadata(ALLOW_COMPLETED_DISABLED_FORMS_KEY, allow)

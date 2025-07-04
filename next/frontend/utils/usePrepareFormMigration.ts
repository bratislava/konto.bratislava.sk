import { formsClient } from '@clients/forms'
import { useSsrAuth } from 'frontend/hooks/useSsrAuth'
import logger from 'frontend/utils/logger'

type MigrationContext = 'sign-in' | 'sign-up'

export const usePrepareFormMigration = (context: MigrationContext) => {
  const { guestIdentityId } = useSsrAuth()

  const prepareFormMigration = async () => {
    if (!guestIdentityId) {
      logger.error(
        `[AUTH] Missing guestIdentityId in SSR context for signed-out user during ${context}. This should never happen.`,
      )
      return
    }

    try {
      logger.info(
        `[AUTH] Attempting form migration during ${context} for guest identity id ${guestIdentityId}`,
      )

      await formsClient.formMigrationsControllerPrepareMigration(
        { guestIdentityId },
        {
          authStrategy: 'authOnly',
          'axios-retry': {
            retries: 3,
          },
        },
      )

      logger.info(
        `[AUTH] Successfully prepared form migration during ${context} for guest identity id ${guestIdentityId}`,
      )
    } catch (error) {
      logger.error(
        `[AUTH] Failed to prepare form migration for guest identity id ${guestIdentityId} during ${context}. ` +
          `This is a rare error that cannot be recovered from as the user is already authenticated and guest identity is flushed from cookies. ${
            error
          }`,
      )
    }
  }

  return { prepareFormMigration }
}

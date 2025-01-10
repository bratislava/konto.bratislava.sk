import { Logger } from '@nestjs/common'
import axios from 'axios'

/**
 * Update user tier in city account to that of eid verified level
 * In case anything goes wrong this is a no-op, log the error and continue uninterrupted
 */
const verifyUserByEidToken = async (
  oboToken: string,
  logger: Logger,
  bearerToken?: string,
): Promise<void> => {
  if (!bearerToken) return
  await axios
    .post(
      `${process.env.USER_ACCOUNT_API ?? ''}/user-verification/eid`,
      {
        oboToken,
      },
      {
        headers: {
          Authorization: bearerToken,
        },
      },
    )
    .catch((error) => {
      logger.error(
        `There was an error during verifying the user: ${<string>error}`,
      )
    })
}

export default verifyUserByEidToken

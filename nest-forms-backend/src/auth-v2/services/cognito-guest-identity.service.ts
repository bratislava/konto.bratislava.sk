import { GetCredentialsForIdentityCommand } from '@aws-sdk/client-cognito-identity'
import { GetCallerIdentityCommand, STSClient } from '@aws-sdk/client-sts'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Inject, Injectable, Logger } from '@nestjs/common'
import { Cache } from 'cache-manager'

import BaConfigService from '../../config/ba-config.service'
import { CognitoProvidersService } from './cognito-providers.service'

@Injectable()
export class CognitoGuestIdentityService {
  private readonly logger = new Logger(CognitoGuestIdentityService.name)

  private readonly expectedRoleArn: string

  constructor(
    readonly baConfigService: BaConfigService,
    private readonly cognitoProvidersService: CognitoProvidersService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    this.expectedRoleArn = `arn:aws:sts::${baConfigService.cognito.awsAccountId}:assumed-role/${baConfigService.cognito.unauthRoleName}/CognitoIdentityCredentials`
  }

  /**
   * Verifies if the provided guest identity ID is associated with the
   * expected unauthenticated role in the Cognito Identity Pool.
   * @param guestIdentityId The Cognito Identity ID to verify.
   * @returns True if the identity ID has the expected unauthenticated role, false otherwise.
   */
  async verifyGuestIdentityId(guestIdentityId: string): Promise<boolean> {
    const cacheKey = `guestIdentity:${guestIdentityId}`
    const cached = await this.cacheManager.get<boolean>(cacheKey)
    if (cached === true) {
      return true
    }

    try {
      const command = new GetCredentialsForIdentityCommand({
        IdentityId: `${this.baConfigService.cognito.region}:${guestIdentityId}`,
      })
      const response = await this.cognitoProvidersService.identity.send(command)
      if (
        !response.Credentials ||
        !response.Credentials.AccessKeyId ||
        !response.Credentials.SecretKey ||
        !response.Credentials.SessionToken
      ) {
        this.logger.warn(
          `Incomplete credentials received for IdentityId: ${guestIdentityId}`,
        )
        return false
      }

      const stsClient = new STSClient({
        region: 'eu-central-1',
        credentials: {
          accessKeyId: response.Credentials.AccessKeyId,
          secretAccessKey: response.Credentials.SecretKey,
          sessionToken: response.Credentials.SessionToken,
        },
      })
      const callerIdentity = await stsClient.send(
        new GetCallerIdentityCommand({}),
      )
      const result = callerIdentity.Arn === this.expectedRoleArn
      if (result) {
        await this.cacheManager.set(cacheKey, result)
      }
      return result
    } catch (error) {
      this.logger.error(
        // @ts-ignore
        `Error verifying guest identity ID ${guestIdentityId}: ${error.message}`,
        // @ts-ignore
        error.stack,
      )
      return false
    }
  }
}

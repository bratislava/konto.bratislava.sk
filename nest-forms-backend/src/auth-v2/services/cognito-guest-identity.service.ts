import { GetCredentialsForIdentityCommand } from '@aws-sdk/client-cognito-identity'
import { GetCallerIdentityCommand, STSClient } from '@aws-sdk/client-sts'
import { Injectable } from '@nestjs/common'

import BaConfigService from '../../config/ba-config.service'
import { CognitoProvidersService } from './cognito-providers.service'

/**
 * Verifies Cognito Guest Identity IDs.
 * This service provides a way to confirm if a given Cognito Identity ID is a legitimate
 * guest identity within our system. Since Cognito Identity IDs themselves don't inherently
 * carry verifiable information beyond their existence, this check ensures the ID
 * belongs to our specific unauthenticated IAM role ARN (as opposed to, for example, an
 * authenticated role ARN). It achieves this by attempting to assume the unauthenticated role
 * with the provided ID and validating the resulting ARN.
 *
 * Note: When users sign in, their guest identity is disabled at the moment of sign-in.
 * This service will return an error when attempting to verify a disabled guest identity.
 */
@Injectable()
export class CognitoGuestIdentityService {
  private readonly expectedRoleArn: string

  constructor(
    readonly baConfigService: BaConfigService,
    private readonly cognitoProvidersService: CognitoProvidersService,
  ) {
    this.expectedRoleArn = `arn:aws:sts::${baConfigService.cognito.accountId}:assumed-role/${baConfigService.cognito.unauthRoleName}/CognitoIdentityCredentials`
  }

  async verifyGuestIdentityId(guestIdentityId: string) {
    const command = new GetCredentialsForIdentityCommand({
      IdentityId: guestIdentityId,
    })
    const response = await this.cognitoProvidersService.identity.send(command)
    if (
      !response.Credentials ||
      !response.Credentials.AccessKeyId ||
      !response.Credentials.SecretKey ||
      !response.Credentials.SessionToken
    ) {
      throw new Error(
        `Incomplete credentials received for IdentityId: ${guestIdentityId}`,
      )
    }

    const stsClient = new STSClient({
      region: this.baConfigService.cognito.region,
      credentials: {
        accessKeyId: response.Credentials.AccessKeyId,
        secretAccessKey: response.Credentials.SecretKey,
        sessionToken: response.Credentials.SessionToken,
      },
    })
    const callerIdentity = await stsClient.send(
      new GetCallerIdentityCommand({}),
    )
    return callerIdentity.Arn === this.expectedRoleArn
  }
}

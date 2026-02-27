import { Controller, Get, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiHeader, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { OAuth2AccessGuard } from '../oauth2/guards/oauth2-access.guard'
import { ClientName } from '../oauth2/decorators/client-name.decorator'
import { OAuth2ClientName } from '../oauth2/subservices/oauth2-client.subservice'
import { User } from '../utils/decorators/request.decorator'
import { CognitoGetUserData } from '../utils/global-dtos/cognito.dto'
import { DpbUserDto, DPBUserLoginStatistics } from './dtos/user.dto'
import { DpbService } from './dpb.service'
import { SignatureGuard } from '../auth/guards/signature.guard'
import { SignaturePublicKey } from '../auth/decorators/signature-public-key.decorator'

@ApiTags('DPB')
@ApiBearerAuth()
@Controller('dpb')
export class DpbController {
  constructor(private readonly dpbService: DpbService) {}

  @Get('userdata')
  @ClientName(OAuth2ClientName.DPB)
  @UseGuards(OAuth2AccessGuard)
  @ApiOperation({
    summary: 'Get user data',
    description: 'Returns user data for the authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'User data retrieved successfully',
    type: DpbUserDto,
  })
  userData(@User() user: CognitoGetUserData): DpbUserDto {
    return {
      id: user.idUser || user.sub,
      email: user.email,
      email_verified: user.email_verified,
      account_type: user['custom:account_type'],
      name: user.name,
      given_name: user.given_name,
      family_name: user.family_name,
    }
  }

  @Get('list-user-logins')
  @SignaturePublicKey('DPB_CLIENT_PUBLIC_KEY')
  @UseGuards(SignatureGuard)
  @ApiOperation({
    summary: 'List all user logins for DPB',
    description: `Returns a list of all user logins with statistics.

Authenticated via RSA signature (backend-to-backend).

---

**Signing format**

    METHOD|PATH|TIMESTAMP|BODY

Example:

    GET|/dpb/list-user-logins|1234567890123|{}

- TIMESTAMP is Unix ms
- BODY is the JSON body string, or '{}' for GET requests
- Sign with your RSA private key using SHA-256, then Base64-encode the result

---

**Key generation (one-time)**

    openssl genrsa -out private_key.pem 2048
    openssl rsa -in private_key.pem -pubout -out public_key.pem

Share the public key with us — it will be stored as the DPB_CLIENT_PUBLIC_KEY env var.

---

**Replay protection:** requests older than 5 minutes or more than 1 minute in the future are rejected.`,
  })
  @ApiHeader({
    name: 'X-Signature',
    required: true,
    description: 'Base64-encoded RSA-SHA256 signature of the signing string',
    schema: { type: 'string', example: 'aGVsbG8gd29ybGQ=...' },
  })
  @ApiHeader({
    name: 'X-Timestamp',
    required: true,
    description: 'Unix timestamp in milliseconds',
    schema: { type: 'string', example: '1234567890123' },
  })
  @ApiResponse({
    status: 200,
    description: 'User logins retrieved successfully',
    type: [DPBUserLoginStatistics],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized — invalid/missing signature, expired timestamp, or clock skew',
  })
  async listUserLogins(): Promise<DPBUserLoginStatistics[]> {
    const returnValue = await this.dpbService.getUserLoginClientList()
    return returnValue
  }
}

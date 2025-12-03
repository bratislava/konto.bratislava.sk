// nest-city-account/src/oauth2/oauth2.exception.ts

import { HttpException, HttpStatus } from '@nestjs/common'
import { OAuth2AuthorizationErrorDto, OAuth2TokenErrorDto } from './dtos/errors.oauth2.dto'

export interface OAuth2ErrorMetadata {
  consoleMessage?: string
  alert?: 0 | 1
  metadata?: Record<string, unknown>
}

/**
 * Custom exception for OAuth2 errors that includes console-only metadata
 * This metadata is extracted by OAuth2ExceptionFilter for logging but never sent to clients
 */
export class OAuth2Exception extends HttpException {
  public readonly oauth2Metadata: OAuth2ErrorMetadata

  constructor(
    response: OAuth2AuthorizationErrorDto | OAuth2TokenErrorDto,
    status: HttpStatus,
    metadata: OAuth2ErrorMetadata = {}
  ) {
    super(response, status)
    this.oauth2Metadata = metadata
  }
}

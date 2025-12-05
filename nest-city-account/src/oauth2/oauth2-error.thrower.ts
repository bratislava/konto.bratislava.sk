// nest-city-account/src/oauth2/oauth2-error.thrower.ts

import { Injectable } from '@nestjs/common'
import { OAuth2Exception, OAuth2ErrorMetadata } from './oauth2.exception'
import { OAuth2AuthorizationErrorDto, OAuth2TokenErrorDto } from './dtos/errors.oauth2.dto'
import { OAuth2AuthorizationErrorCode, OAuth2TokenErrorCode } from './oauth2.error.enum'
import { HttpStatus } from '@nestjs/common'

/**
 * Dedicated error thrower for OAuth2 endpoints
 * Creates OAuth2Exception instances with proper error codes and metadata
 *
 * Separate from ThrowerErrorGuard to:
 * - Keep OAuth2 error handling isolated
 * - Avoid polluting general error guard with OAuth2-specific logic
 * - Make OAuth2 errors easier to test and maintain
 */
@Injectable()
export class OAuth2ErrorThrower {
  /**
   * Throws an OAuth2 authorization error
   * The OAuth2ExceptionFilter will automatically convert this to a 303 redirect
   *
   * Per RFC 6749 Section 4.1.2.1:
   * - If redirect_uri is valid: redirects to client with error parameters
   * - If redirect_uri is invalid/missing: returns direct error response
   *
   * @param errorCode - OAuth2 authorization error code
   * @param errorDescription - Optional human-readable error description
   * @param errorUri - Optional URI identifying a human-readable error page
   * @param consoleMessage - Optional console-only message for internal logging
   * @param logMetadata - Optional additional metadata to include in the logs
   * @param alert - Optional alert level (0 or 1)
   * @returns OAuth2Exception that will be intercepted by OAuth2ExceptionFilter
   */
  authorizationException(
    errorCode: OAuth2AuthorizationErrorCode,
    errorDescription?: string,
    errorUri?: string,
    consoleMessage?: string,
    logMetadata?: Record<string, unknown>,
    alert?: 0 | 1
  ): OAuth2Exception {
    const response: OAuth2AuthorizationErrorDto = {
      error: errorCode,
      error_description: errorDescription,
      error_uri: errorUri,
    }

    const errorMetadata: OAuth2ErrorMetadata = {}
    if (consoleMessage !== undefined) {
      errorMetadata.consoleMessage = consoleMessage
    }
    if (alert !== undefined) {
      errorMetadata.alert = alert
    }
    if (logMetadata !== undefined) {
      errorMetadata.metadata = logMetadata
    }

    return new OAuth2Exception(response, HttpStatus.BAD_REQUEST, errorMetadata)
  }

  /**
   * Creates an OAuth2 token endpoint error per RFC 6749 Section 5.2
   * Token errors return HTTP 400 with JSON body (except invalid_client which returns 401)
   *
   * Per RFC 6749 Section 5.2:
   * - Returns HTTP 400 Bad Request with JSON body
   * - For invalid_client: returns HTTP 401 with WWW-Authenticate header
   * - The state parameter is NOT included in token endpoint error responses
   *
   * @param errorCode - OAuth2 token error code
   * @param errorDescription - Optional human-readable error description
   * @param errorUri - Optional URI identifying a human-readable error page
   * @param consoleMessage - Optional console-only message for internal logging
   * @param logMetadata - Optional additional metadata to include in the logs
   * @param alert - Optional alert level (0 or 1)
   * @returns OAuth2Exception with 400 status
   */
  tokenException(
    errorCode: OAuth2TokenErrorCode,
    errorDescription?: string,
    errorUri?: string,
    consoleMessage?: string,
    logMetadata?: Record<string, unknown>,
    alert?: 0 | 1
  ): OAuth2Exception {
    const response: OAuth2TokenErrorDto = {
      error: errorCode,
      error_description: errorDescription,
      error_uri: errorUri,
    }

    const errorMetadata: OAuth2ErrorMetadata = {}
    if (consoleMessage !== undefined) {
      errorMetadata.consoleMessage = consoleMessage
    }
    if (alert !== undefined) {
      errorMetadata.alert = alert
    }
    if (logMetadata !== undefined) {
      errorMetadata.metadata = logMetadata
    }

    return new OAuth2Exception(response, HttpStatus.BAD_REQUEST, errorMetadata)
  }
}

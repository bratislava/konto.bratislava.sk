import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common'
import { plainToInstance } from 'class-transformer'
import { validateSync } from 'class-validator'
import { Request, Response } from 'express'
import { LineLoggerSubservice } from '../../utils/subservices/line-logger.subservice'
import { OAuth2AuthorizationErrorDto, OAuth2TokenErrorDto } from '../dtos/errors.oauth2.dto'
import { OAuth2AuthorizationErrorCode, OAuth2TokenErrorCode } from '../oauth2.error.enum'
import ThrowerErrorGuard from '../../utils/guards/errors.guard'
import { ErrorsEnum } from '../../utils/guards/dtos/error.dto'
import { toLogfmt } from '../../utils/logging'
import { OAuth2ErrorMetadata, OAuth2Exception } from '../oauth2.exception'

const USER_AGENT = 'user-agent'

/**
 * Exception filter for OAuth2 error handling per RFC 6749 and RFC 9700
 *
 * RFC 6749 Section 4.1.2.1: Authorization errors MUST redirect to client's redirect_uri
 * RFC 9700: Recommends using 303 See Other for OAuth2 redirects
 *
 * Automatically:
 * - Converts authorization errors to 303 redirects with error parameters
 * - Ensures state parameter is preserved if present in original request
 * - Validates redirect_uri presence before redirecting
 * - Returns 400 JSON errors for token endpoint
 */
@Catch(HttpException)
export class OAuth2ExceptionFilter implements ExceptionFilter {
  private readonly logger = new LineLoggerSubservice(OAuth2ExceptionFilter.name)

  private readonly throwerErrorGuard = new ThrowerErrorGuard()

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()
    const status = exception.getStatus()
    const exceptionResponse = exception.getResponse()

    // Extract OAuth2 metadata if this is an OAuth2Exception
    const oauth2Metadata: OAuth2ErrorMetadata =
      exception instanceof OAuth2Exception ? exception.oauth2Metadata : {}

    // Route to appropriate handler and get log object
    let logObject: Record<string, unknown>

    // Handle authorization endpoint errors (redirect)
    if (request.path.includes('/oauth2/authorize') || request.path.includes('/oauth2/continue')) {
      logObject = this.handleAuthorizationError(request, response, status, exceptionResponse)
    } else if (request.path.includes('/oauth2/store')) {
      logObject = this.handleAuthorizationStoreError(request, response, status, exceptionResponse)
    } else if (request.path.includes('/oauth2/token')) {
      logObject = this.handleTokenError(request, response, status, exceptionResponse)
    } else {
      logObject = {
        method: request.method,
        originalUrl: request.originalUrl,
        statusCode: status,
        userAgent: request.get(USER_AGENT) || '',
        requestBody: request.body,
        queryParams: request.query,
        ip: request.ip ?? '<NO IP>',
        error: exceptionResponse,
        message: 'OAuth2 endpoint error - ENDPOINT ERRORS NOT HANDLED!!!.',
        alert: 1,
      }

      response
        .status(status)
        .json(
          typeof exceptionResponse === 'object' ? exceptionResponse : { message: exceptionResponse }
        )
    }

    // Merge log object with OAuth2 metadata and log
    this.logger.error({
      ...logObject,
      consoleMessage: oauth2Metadata.consoleMessage,
      alert: oauth2Metadata.alert,
      ...oauth2Metadata.metadata,
    })
  }

  private handleAuthorizationStoreError(
    request: Request,
    response: Response,
    status: number,
    exceptionResponse: string | object
  ) {
    const errorResponse = this.extractOAuth2AuthorizationError(exceptionResponse, status)

    response.status(status).json(errorResponse)
    return {
      method: request.method,
      originalUrl: request.originalUrl,
      statusCode: status,
      userAgent: request.get(USER_AGENT) || '',
      requestBody: request.body,
      queryParams: request.query,
      ip: request.ip ?? '<NO IP>',
      error: errorResponse.error,
      message: 'Store failed, sending redirect error.',
      'response-data': errorResponse,
    }
  }

  /**
   * Handle authorization endpoint errors per RFC 6749 Section 4.1.2.1
   * Redirects to client's redirect_uri with error parameters using 303 per RFC 9700
   */
  private handleAuthorizationError(
    request: Request,
    response: Response,
    status: number,
    exceptionResponse: string | object
  ) {
    const redirectUri = request.query.redirect_uri as string | undefined
    const state = request.query.state as string | undefined

    // RFC 6749 Section 4.1.2.1: If redirect_uri is invalid/missing, return error directly
    // (do not redirect to prevent open redirector vulnerability)
    if (!redirectUri) {
      // Extract or construct OAuth2 error response
      const errorResponse = this.extractOAuth2AuthorizationError(exceptionResponse, status)

      response.status(status).json(errorResponse)
      return {
        method: request.method,
        originalUrl: request.originalUrl,
        statusCode: status,
        userAgent: request.get(USER_AGENT) || '',
        requestBody: request.body,
        queryParams: request.query,
        ip: request.ip ?? '<NO IP>',
        error: exceptionResponse,
        message: 'Authorization error without redirect_uri, returning direct error',
        hasRedirectUri: false,
        responseData: errorResponse,
      }
    }

    // Extract or construct OAuth2 error response
    const errorResponse = this.extractOAuth2AuthorizationError(exceptionResponse, status)

    // RFC 6749 Section 4.1.2.1: state is REQUIRED if present in request
    if (state) {
      if (errorResponse.state && errorResponse.state !== state) {
        this.logger.warn(
          this.throwerErrorGuard.InternalServerErrorException(
            ErrorsEnum.INTERNAL_SERVER_ERROR,
            'State mismatch detected, using original request state',
            toLogfmt({ originalState: state, errorState: errorResponse.state })
          )
        )
      }
      errorResponse.state = state
    }

    // Build redirect URL with error parameters
    const redirectUrl = this.buildErrorRedirectUrl(redirectUri, errorResponse)

    // RFC 9700: Use 303 See Other for OAuth2 redirects
    response.redirect(HttpStatus.SEE_OTHER, redirectUrl)

    return {
      method: request.method,
      originalUrl: request.originalUrl,
      statusCode: HttpStatus.SEE_OTHER,
      userAgent: request.get(USER_AGENT) || '',
      requestBody: request.body,
      queryParams: request.query,
      ip: request.ip ?? '<NO IP>',
      error: errorResponse.error,
      message: 'Authorization failed, sending redirect error.',
      redirectUrl,
      hasRedirectUri: !!redirectUri,
      'response-data': { redirectUrl, errorResponse },
    }
  }

  /**
   * Handle token endpoint errors per RFC 6749 Section 5.2
   * Returns 400 Bad Request with JSON body (except invalid_client which returns 401)
   */
  private handleTokenError(
    request: Request,
    response: Response,
    status: number,
    exceptionResponse: string | object
  ) {
    const errorResponse = this.extractOAuth2TokenError(exceptionResponse, status)

    // RFC 6749 Section 5.2: invalid_client errors should return 401 with WWW-Authenticate header
    // when client authentication fails
    let statusCode = HttpStatus.BAD_REQUEST
    if (errorResponse.error === OAuth2TokenErrorCode.INVALID_CLIENT) {
      statusCode = HttpStatus.UNAUTHORIZED

      // RFC 6749: Include WWW-Authenticate header indicating supported authentication schemes
      // This server supports HTTP Basic authentication for client credentials
      response.setHeader('WWW-Authenticate', 'Basic realm="OAuth2 Token Endpoint"')
    }

    response
      .status(statusCode)
      .header('Content-Type', 'application/json;charset=UTF-8')
      .json(errorResponse)

    return {
      method: request.method,
      originalUrl: request.originalUrl,
      statusCode,
      userAgent: request.get(USER_AGENT) || '',
      requestBody: request.body,
      queryParams: request.query,
      ip: request.ip ?? '<NO IP>',
      error: errorResponse.error,
      message: 'Returning token endpoint error',
      hasRedirectUri: false,
      responseData: errorResponse,
    }
  }

  /**
   * Extract OAuth2 authorization error from exception response
   */
  private extractOAuth2AuthorizationError(
    exceptionResponse: string | object,
    status: number
  ): OAuth2AuthorizationErrorDto {
    let errorResponse: OAuth2AuthorizationErrorDto

    if (typeof exceptionResponse === 'object') {
      // Try to transform and validate the response as OAuth2AuthorizationErrorDto
      const candidate = plainToInstance(OAuth2AuthorizationErrorDto, exceptionResponse)
      const errors = validateSync(candidate, { skipMissingProperties: false })

      if (errors.length === 0 && candidate.error) {
        // It's already a valid OAuth2 error format, extract plain values
        errorResponse = {
          error: candidate.error,
          error_description: candidate.error_description,
          error_uri: candidate.error_uri,
          state: candidate.state,
        }
        return errorResponse
      }

      // Check if response has a message property (standard NestJS error format)
      const message = this.extractMessageFromObject(exceptionResponse)
      const error = this.mapStatusToAuthorizationError(status)
      errorResponse = {
        error,
        error_description: message,
      }
    } else {
      // Map HTTP status to OAuth2 error code
      const error = this.mapStatusToAuthorizationError(status)
      errorResponse = {
        error,
        error_description: exceptionResponse,
      }
    }

    // Validate the created error response
    const validationInstance = plainToInstance(OAuth2AuthorizationErrorDto, errorResponse)
    const validationErrors = validateSync(validationInstance, { skipMissingProperties: true })
    if (validationErrors.length > 0) {
      this.logger.warn(
        this.throwerErrorGuard.InternalServerErrorException(
          ErrorsEnum.INTERNAL_SERVER_ERROR,
          'Failed to create valid OAuth2AuthorizationErrorDto',
          toLogfmt({ validationErrors: validationErrors.map((e) => e.toString()) })
        )
      )
      // Fallback to a valid error
      return {
        error: OAuth2AuthorizationErrorCode.SERVER_ERROR,
        error_description: 'An error occurred',
      }
    }

    return errorResponse
  }

  /**
   * Extract OAuth2 token error from exception response
   */
  private extractOAuth2TokenError(
    exceptionResponse: string | object,
    status: number
  ): OAuth2TokenErrorDto {
    let errorResponse: OAuth2TokenErrorDto

    if (typeof exceptionResponse === 'object') {
      // Try to transform and validate the response as OAuth2TokenErrorDto
      const candidate = plainToInstance(OAuth2TokenErrorDto, exceptionResponse)
      const errors = validateSync(candidate, { skipMissingProperties: false })

      if (errors.length === 0 && candidate.error) {
        // It's already a valid OAuth2 error format, extract plain values
        errorResponse = {
          error: candidate.error,
          error_description: candidate.error_description,
          error_uri: candidate.error_uri,
        }
        return errorResponse
      }
      // Check if response has a message property (standard NestJS error format)
      const message = this.extractMessageFromObject(exceptionResponse)
      const error = this.mapStatusToTokenError(status)
      errorResponse = {
        error,
        error_description: message,
      }
    } else {
      // Map HTTP status to OAuth2 error code
      const error = this.mapStatusToTokenError(status)
      errorResponse = {
        error,
        error_description: exceptionResponse,
      }
    }

    // Validate the created error response
    const validationInstance = plainToInstance(OAuth2TokenErrorDto, errorResponse)
    const validationErrors = validateSync(validationInstance, { skipMissingProperties: true })
    if (validationErrors.length > 0) {
      this.logger.warn(
        this.throwerErrorGuard.InternalServerErrorException(
          ErrorsEnum.INTERNAL_SERVER_ERROR,
          'Failed to create valid OAuth2TokenErrorDto',
          toLogfmt({ validationErrors: validationErrors.map((e) => e.toString()) })
        )
      )
      // Fallback to a valid error
      return {
        error: OAuth2TokenErrorCode.INVALID_REQUEST,
        error_description: 'An error occurred',
      }
    }

    return errorResponse
  }

  /**
   * Safely extract message from an object response
   */
  private extractMessageFromObject(obj: object): string {
    if ('message' in obj && typeof obj.message === 'string') {
      return obj.message
    }
    if ('error_description' in obj && typeof obj.error_description === 'string') {
      return obj.error_description
    }
    return 'An error occurred'
  }

  /**
   * Build redirect URL with error parameters
   */
  private buildErrorRedirectUrl(
    redirectUri: string,
    errorResponse: OAuth2AuthorizationErrorDto
  ): string {
    const params = new URLSearchParams()

    params.append('error', errorResponse.error)

    if (errorResponse.error_description) {
      params.append('error_description', errorResponse.error_description)
    }

    if (errorResponse.state) {
      params.append('state', errorResponse.state)
    }

    if (errorResponse.error_uri) {
      params.append('error_uri', errorResponse.error_uri)
    }

    const separator = redirectUri.includes('?') ? '&' : '?'
    return `${redirectUri}${separator}${params.toString()}`
  }

  /**
   * Map HTTP status code to OAuth2 authorization error code
   */
  private mapStatusToAuthorizationError(status: number): OAuth2AuthorizationErrorCode {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
      case HttpStatus.NOT_FOUND:
        return OAuth2AuthorizationErrorCode.INVALID_REQUEST
      case HttpStatus.UNAUTHORIZED:
      case HttpStatus.FORBIDDEN:
        return OAuth2AuthorizationErrorCode.ACCESS_DENIED
      case HttpStatus.INTERNAL_SERVER_ERROR:
      case HttpStatus.SERVICE_UNAVAILABLE:
        return OAuth2AuthorizationErrorCode.SERVER_ERROR
      case HttpStatus.GATEWAY_TIMEOUT:
        return OAuth2AuthorizationErrorCode.TEMPORARILY_UNAVAILABLE
      default:
        return OAuth2AuthorizationErrorCode.SERVER_ERROR
    }
  }

  /**
   * Map HTTP status code to OAuth2 token error code
   */
  private mapStatusToTokenError(status: number): OAuth2TokenErrorCode {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return OAuth2TokenErrorCode.INVALID_REQUEST
      case HttpStatus.UNAUTHORIZED:
        return OAuth2TokenErrorCode.INVALID_CLIENT
      case HttpStatus.FORBIDDEN:
        return OAuth2TokenErrorCode.UNAUTHORIZED_CLIENT
      default:
        return OAuth2TokenErrorCode.INVALID_REQUEST
    }
  }
}

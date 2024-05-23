import { ExecutionContext } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import express from 'express'

export default class CognitoGuard extends AuthGuard('cognito-strategy') {
  constructor(private readonly alwaysPass: boolean = false) {
    super()
  }

  /* eslint-disable @typescript-eslint/no-explicit-any */
  handleRequest(
    err: any,
    user: any,
    info: any,
    context: ExecutionContext,
    status?: any,
  ): any {
    const request = context.switchToHttp().getRequest<express.Request>()
    if (request.header('authorization') || !this.alwaysPass) {
      return super.handleRequest(err, user, info, context, status)
    }

    return undefined
  }
  /* eslint-enable @typescript-eslint/no-explicit-any */
}

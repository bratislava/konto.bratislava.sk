import { Injectable } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

@Injectable()
export default class BasicGuard extends AuthGuard('auth-basic') {}

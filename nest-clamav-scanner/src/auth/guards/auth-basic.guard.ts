import { Injectable } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

@Injectable()
export class BasicGuard extends AuthGuard('auth-basic') {}

import { AuthGuard } from '@nestjs/passport'

export class CognitoGuard extends AuthGuard('cognito-strategy') {}

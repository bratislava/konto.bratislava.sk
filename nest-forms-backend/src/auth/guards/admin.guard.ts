import { AuthGuard } from '@nestjs/passport'

export default class AdminGuard extends AuthGuard('admin-strategy') {}

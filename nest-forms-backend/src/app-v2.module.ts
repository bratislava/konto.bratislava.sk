import { Module } from '@nestjs/common'

import { AppSharedModule } from './app-shared.module'
import { AuthV2Module } from './auth-v2/auth-v2.module'
import { FormsV2Module } from './forms-v2/forms-v2.module'

@Module({
  imports: [AppSharedModule, AuthV2Module, FormsV2Module],
  exports: [AppSharedModule, AuthV2Module, FormsV2Module],
})
export class AppV2Module {}

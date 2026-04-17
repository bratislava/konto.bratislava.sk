import { Module } from '@nestjs/common'

import ApiJwtTokensService from './api-jwt-tokens.service'

@Module({
  providers: [ApiJwtTokensService],
  exports: [ApiJwtTokensService],
})
export default class ApiJwtTokensModule {}

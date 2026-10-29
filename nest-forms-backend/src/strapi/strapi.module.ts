import { Module } from '@nestjs/common'

import BaConfigModule from '../config/ba-config.module'
import StrapiService from './strapi.service'

@Module({
  imports: [BaConfigModule],
  providers: [StrapiService],
  exports: [StrapiService],
})
export default class StrapiModule {}

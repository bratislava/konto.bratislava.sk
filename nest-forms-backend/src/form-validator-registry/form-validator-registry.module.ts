import { Module } from '@nestjs/common'

import FormValidatorRegistryService from './form-validator-registry.service'

@Module({
  providers: [FormValidatorRegistryService],
  exports: [FormValidatorRegistryService],
})
export default class FormValidatorRegistryModule {}

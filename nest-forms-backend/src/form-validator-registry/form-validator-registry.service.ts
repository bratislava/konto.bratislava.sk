import { Injectable } from '@nestjs/common'
import {
  BaRjsfValidatorRegistry,
  createSingleUseValidatorRegistry,
} from 'forms-shared/form-utils/validatorRegistry'

@Injectable()
export default class FormValidatorRegistryService {
  private readonly validatorRegistry: BaRjsfValidatorRegistry

  constructor() {
    this.validatorRegistry = createSingleUseValidatorRegistry()
  }

  getRegistry(): BaRjsfValidatorRegistry {
    return this.validatorRegistry
  }
}

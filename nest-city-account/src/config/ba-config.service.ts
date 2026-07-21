import { Injectable } from '@nestjs/common'

import BaConfig from './ba-config'

@Injectable()
// eslint-disable-next-line @darraghor/nestjs-typed/injectable-should-be-provided -- provided via a custom { provide: BaConfigService, useValue } token in BaConfigModule, which this rule doesn't recognize
export default class BaConfigService extends BaConfig {}

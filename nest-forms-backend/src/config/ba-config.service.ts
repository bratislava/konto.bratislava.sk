import { Injectable } from '@nestjs/common'

import BaConfig from './ba-config'

@Injectable()
// eslint-disable-next-line @darraghor/nestjs-typed/injectable-should-be-provided -- provided via useValue factory in BaConfigModule; rule does not detect { provide: X, useValue } pattern
export default class BaConfigService extends BaConfig {}

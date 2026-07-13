import { Injectable } from '@nestjs/common'

import BaConfig from './ba-config'

@Injectable()
// eslint-disable-next-line @darraghor/nestjs-typed/injectable-should-be-provided -- the rule only recognizes a bare class reference in a `providers` array; BaConfigService is actually provided via `{ provide: BaConfigService, useValue/useFactory: ... }` in ba-config.module.ts
export default class BaConfigService extends BaConfig {}

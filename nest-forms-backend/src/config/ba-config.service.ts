import { Injectable } from '@nestjs/common'

import BaConfig from './ba-config'

@Injectable()
// eslint-disable-next-line @darraghor/nestjs-typed/injectable-should-be-provided
export default class BaConfigService extends BaConfig {}

import { schema } from '../../generator/functions'
import { getZevoSchema, ZevoType } from './shared/zevoShared'

export default schema(
  { title: 'Energetické zhodnotenie odpadu v ZEVO' },
  {},
  getZevoSchema(ZevoType.EnergetickeZhodnotenieOdpaduVZevo),
)

import { getZevoSchema, ZevoType } from './shared/zevoShared'
import { schema } from '../../generator/functions/schema'

export default schema(
  { title: 'Energetické zhodnotenie odpadu v ZEVO' },
  getZevoSchema(ZevoType.EnergetickeZhodnotenieOdpaduVZevo),
)

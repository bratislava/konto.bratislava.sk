import { schema } from '../../generator/functions/schema'
import { getZevoSchema, ZevoType } from './shared/zevoShared'

export default schema(
  { title: 'Energetické zhodnotenie odpadu v ZEVO' },
  getZevoSchema(ZevoType.EnergetickeZhodnotenieOdpaduVZevo),
)

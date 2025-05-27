import { getZevoSchema, ZevoType } from './shared/zevoShared'
import { schema } from '../../generator/functions/schema'

export default schema(
  { title: 'Uzatvorenie zmluvy o nakladaní s odpadom' },
  getZevoSchema(ZevoType.UzatvorenieZmluvyONakladaniSOdpadom),
)

import { schema } from '../../generator/functions'
import { getZevoSchema, ZevoType } from './shared/zevoShared'

export default schema(
  { title: 'Uzatvorenie zmluvy o nakladaní s odpadom' },
  {},
  getZevoSchema(ZevoType.UzatvorenieZmluvyONakladaniSOdpadom),
)

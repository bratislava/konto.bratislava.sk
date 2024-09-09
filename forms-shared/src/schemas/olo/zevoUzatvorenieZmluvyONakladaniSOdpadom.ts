import { schema, step } from '../../generator/functions'

export default schema({ title: 'Uzatvorenie zmluvy o nakladaní s odpadom' }, {}, [
  step('ziadatel', { title: 'Žiadateľ' }, []),
])

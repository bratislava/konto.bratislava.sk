import { schema, step } from '../../generator/functions'

export default schema({ title: 'Podnety a pochvaly občanov' }, {}, [
  step('ziadatel', { title: 'Žiadateľ' }, []),
])

import { schema, step } from '../../generator/functions'

export default schema({ title: 'Odvoz objemného odpadu valníkom' }, {}, [
  step('ziadatel', { title: 'Žiadateľ' }, []),
])

import { schema, step } from '../../generator/functions'

export default schema(
  { title: 'Ručná vykládka a zhodnotenie odpadu podľa integrovaného povolenia' },
  {},
  [step('ziadatel', { title: 'Žiadateľ' }, [])],
)

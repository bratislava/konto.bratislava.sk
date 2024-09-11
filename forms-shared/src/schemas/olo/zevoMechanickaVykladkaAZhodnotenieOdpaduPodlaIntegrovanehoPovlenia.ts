import { schema, step } from '../../generator/functions'

export default schema(
  { title: 'Mechanická vykládka a zhodnotenie odpadu podľa integrovaného povolenia' },
  {},
  [step('ziadatel', { title: 'Žiadateľ' }, [])],
)

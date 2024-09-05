import { schema, step } from '../../generator/functions'

export default schema(
  { title: 'Triedený zber papiera, plastov a skla pre správcovské spoločnosti' },
  {},
  [step('ziadatel', { title: 'Žiadateľ' }, [])],
)

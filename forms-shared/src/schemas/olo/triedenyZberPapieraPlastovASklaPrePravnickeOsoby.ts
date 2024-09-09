import { schema, step } from '../../generator/functions'

export default schema({ title: 'Triedený zber papiera, plastov a skla pre právnické osoby' }, {}, [
  step('ziadatel', { title: 'Žiadateľ' }, []),
])

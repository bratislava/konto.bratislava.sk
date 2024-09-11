import { schema, step } from '../../generator/functions'

export default schema({ title: 'Podrvenie a zhodnotenie odpadu vysypaním do zásobníka' }, {}, [
  step('ziadatel', { title: 'Žiadateľ' }, []),
])

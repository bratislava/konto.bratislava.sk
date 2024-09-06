import { schema, step } from '../../generator/functions'

export default schema({ title: 'Dočistenie stanovišťa zberných nádob' }, {}, [
  step('ziadatel', { title: 'Žiadateľ' }, []),
])

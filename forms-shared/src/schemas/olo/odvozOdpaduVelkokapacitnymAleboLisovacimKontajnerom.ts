import { schema, step } from '../../generator/functions'

export default schema({ title: 'Odvoz odpadu veľkokapacitným alebo lisovacím kontajnerom' }, {}, [
  step('ziadatel', { title: 'Žiadateľ' }, []),
])

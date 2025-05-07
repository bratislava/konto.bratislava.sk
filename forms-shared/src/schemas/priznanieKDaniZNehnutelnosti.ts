import step1 from './priznanie-k-dani-z-nehnutelnosti/step1'
import step2 from './priznanie-k-dani-z-nehnutelnosti/step2'
import step3 from './priznanie-k-dani-z-nehnutelnosti/step3'
import step4 from './priznanie-k-dani-z-nehnutelnosti/step4'
import step5 from './priznanie-k-dani-z-nehnutelnosti/step5'
import step6 from './priznanie-k-dani-z-nehnutelnosti/step6'
import step7 from './priznanie-k-dani-z-nehnutelnosti/step7'
import step8 from './priznanie-k-dani-z-nehnutelnosti/step8'
import { schema } from '../generator/functions/schema'

export default schema(
  {
    title: 'Priznanie k dani z nehnuteľností',
  },
  [step1, step2, step3, step4, step5, step6, step7, step8],
)

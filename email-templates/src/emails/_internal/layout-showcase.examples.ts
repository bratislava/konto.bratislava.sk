import { defineExamples } from '../../render/examples'
import { layoutShowcaseEmail, staffLayoutShowcaseEmail } from './layout-showcase'

export default defineExamples({
  product: '_internal',
  id: 'layout-showcase',
  email: layoutShowcaseEmail,
  examples: {
    bratislava: { brand: 'bratislava' },
    olo: { brand: 'olo' },
    tsb: { brand: 'tsb' },
    paas: { brand: 'paas' },
    kupaliska: { brand: 'kupaliska' },
  },
})

export const staffLayoutShowcaseExamples = defineExamples({
  product: '_internal',
  id: 'staff-layout-showcase',
  email: staffLayoutShowcaseEmail,
  examples: {
    olo: { brand: 'olo', subject: 'OLO: Nové podanie' },
  },
})

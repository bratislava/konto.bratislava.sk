import { LabelValueRowProps } from '@/src/components/common/LabelValueRowGroup/LabelValueRow'
import LabelValueRowGroup from '@/src/components/common/LabelValueRowGroup/LabelValueRowGroup'

import { Stack } from '../Stack'
import { Wrapper } from '../Wrapper'

const rows: LabelValueRowProps[] = [
  { label: 'Číslo záznamu', value: 'MAG0X03ABCDE' },
  { label: 'Číslo spisu', value: 'MAG-SP/2024/12345' },
  { label: 'Vybavuje', value: 'Jana Nováková' },
  {
    label: 'Kontakt',
    value:
      '[+421 900 000 000](tel:+421900000000), [jana.novakova@bratislava.sk](mailto:jana.novakova@bratislava.sk)',
    valueAsMarkdown: true,
  },
  {
    label: 'Externý odkaz',
    value: '[Portál Bratislava](https://bratislava.sk)',
    valueAsMarkdown: true,
  },
  {
    label: 'Predmet žiadosti',
    value:
      'Žiadosť o vyjadrenie k investičnému zámeru na pozemku s parcelným číslom 1234/56 v katastrálnom území Staré Mesto',
  },
  {
    label: 'Adresa',
    value: 'Primaciálne námestie 1, 814 99 Bratislava-Staré Mesto, Slovenská republika',
  },
]

const LabelValueRowGroupShowCase = () => {
  return (
    <Wrapper direction="column" title="Label Value Row Group">
      <Stack>
        <div className="flex flex-1 flex-col gap-2">
          No rows
          <LabelValueRowGroup rows={[]} />
          Single row
          <LabelValueRowGroup rows={[rows[0]]} />
          No variant (default)
          <LabelValueRowGroup rows={rows} />
          Variant=&quot;align-value-right&quot;
          <LabelValueRowGroup
            rows={rows.map((row) => ({ ...row, variant: 'align-value-right' as const }))}
          />
        </div>
      </Stack>
    </Wrapper>
  )
}

export default LabelValueRowGroupShowCase

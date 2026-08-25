import LabelValueRow, {
  LabelValueRowProps,
} from '@/src/components/common/LabelValueRowGroup/LabelValueRow'
import RowGroupWrapper from '@/src/components/common/RowGroupWrapper'

type Props = {
  variant?: 'align-value-right'
  rows: LabelValueRowProps[]
  valuesAsMarkdown?: boolean
  className?: string
}

const LabelValueRowGroup = ({ variant, rows, className, valuesAsMarkdown }: Props) => {
  return (
    <RowGroupWrapper
      items={rows.map((row, index) => {
        return (
          <LabelValueRow
            key={index}
            valueAsMarkdown={valuesAsMarkdown}
            variant={variant}
            {...row}
          />
        )
      })}
      className={className}
    />
  )
}

export default LabelValueRowGroup

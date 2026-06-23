import { ReactNode } from 'react'

import SelectField, {
  SelectOption,
} from '@/src/components/widget-components/SelectField/SelectField'

type ShowcaseLayoutProps = {
  controls: ReactNode
  children: ReactNode
}

export const ShowcaseLayout = ({ controls, children }: ShowcaseLayoutProps) => (
  <div className="flex flex-col gap-12">
    <div className="flex flex-wrap gap-3 rounded-sm bg-gray-200 p-3 text-sm">{controls}</div>
    {children}
  </div>
)

type ShowcaseSelectFieldProps<T extends string> = {
  label: string
  options: SelectOption[]
  value: T
  onChange: (value: T) => void
}

export const ShowcaseSelectField = <T extends string>({
  label,
  options,
  value,
  onChange,
}: ShowcaseSelectFieldProps<T>) => (
  <SelectField
    label={label}
    options={options}
    value={options.find((option) => option.value === value) ?? null}
    onChange={(option) => {
      if (option && !Array.isArray(option)) onChange(option.value as T)
    }}
    className="min-w-[260px] flex-1"
    displayOptionalLabel={false}
  />
)

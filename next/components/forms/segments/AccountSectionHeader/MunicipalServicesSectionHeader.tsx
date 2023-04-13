import { MenuButton } from 'components/forms/simple-components/TestMenu/Menu'
import SelectField, {
  SelectOption,
} from 'components/forms/widget-components/SelectField/SelectField'
import { Dispatch, SetStateAction } from 'react'
import { Item, Section } from 'react-stately'
import { useWindowSize } from 'usehooks-ts'

type MunicipalServicesSectionHeaderBase = {
  title: string
  selectorValue: SelectOption[]
  setSelectorValue: (val: SelectOption[]) => void
  setCurrentPage: Dispatch<SetStateAction<number>>
  enumOptions: SelectOption[]
}

const MunicipalServicesSectionHeader = ({
  title,
  enumOptions,
  selectorValue,
  setCurrentPage,
  setSelectorValue,
}: MunicipalServicesSectionHeaderBase) => {
  const { width } = useWindowSize()
  return (
    <div className="bg-gray-50">
      <span className="flex flex-col justify-end w-full h-full max-w-screen-lg m-auto pl-4 lg:px-0 pt-6 lg:pt-16 pb-4 lg:pb-8">
        <h1 className="text-h1 mb-4 md:mb-6">{title}</h1>
        <SelectField
          label=""
          className="max-w-none xs:max-w-[400px] pr-4"
          type="one"
          value={selectorValue}
          onChange={(val) => {
            setSelectorValue(val)
            setCurrentPage(1)
          }}
          dropdownDivider
          hideScrollbar
          alwaysOneSelected
          enumOptions={enumOptions}
          maxWordSize={width > 480 ? 45 : 25}
        />
        <MenuButton label="Actions" onAction={(key) => console.log(key)}>
          <Section>
            <Item key="edit">Edit…</Item>
            <Item key="duplicate">Duplicate</Item>
          </Section>
          <Section>
            <Item key="move">Move…</Item>
            <Item key="rename">Rename…</Item>
          </Section>
          <Section>
            <Item key="archive">Archive</Item>
            <Item key="delete">Delete…</Item>
          </Section>
        </MenuButton>
      </span>
    </div>
  )
}

export default MunicipalServicesSectionHeader

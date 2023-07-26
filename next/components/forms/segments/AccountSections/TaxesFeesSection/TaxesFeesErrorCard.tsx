import Icon from '@assets/images/mestske-konto-situacia-2-1.svg'
import AccountMarkdown from 'components/forms/segments/AccountMarkdown/AccountMarkdown'

type TaxesFeesErrorCardBase = {
  content?: string
}

const TaxesFeesErrorCard = ({ content }: TaxesFeesErrorCardBase) => {
  return (
    <div className="m-auto mt-0 flex w-full max-w-screen-lg flex-col justify-around rounded-lg border-0 border-gray-200 px-4 pt-0 md:px-16 lg:mt-8 lg:flex-row lg:border-2 lg:py-10">
      <span className="flex justify-center">
        <Icon className="h-[140px] w-[145px] sm:h-[296px] sm:w-[308px]" />
      </span>
      <AccountMarkdown
        className="mt-6 flex max-w-none flex-col justify-center md:mt-0 lg:max-w-[528px]"
        content={content}
      />
    </div>
  )
}

export default TaxesFeesErrorCard

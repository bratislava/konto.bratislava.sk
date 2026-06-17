import SectionHeader from '@/src/components/layouts/SectionHeader'
import FaqsGroup from '@/src/components/segments/FaqsGroup/FaqsGroup'

type Faq = {
  title: string
  content: string
}

type Props = {
  title?: string | null
  faqs: Faq[]
}

const FAQ = ({ title, faqs }: Props) => {
  return (
    <div className="flex flex-col gap-6">
      <SectionHeader title={title} titleLevel="h2" />

      <FaqsGroup faqs={faqs} />
    </div>
  )
}

export default FAQ

import SummaryAdditionalInfo from '@/components/forms/steps/Summary/SummaryAdditionalInfo'
import SummaryDetails from '@/components/forms/steps/Summary/SummaryDetails'
import SummaryFormControls from '@/components/forms/steps/Summary/SummaryFormControls'
import SummaryFormLegalText from '@/components/forms/steps/Summary/SummaryFormLegalText'
import SummaryFormSignature from '@/components/forms/steps/Summary/SummaryFormSignature'
import SummaryHeader from '@/components/forms/steps/SummaryHeader'
import { useFormContext } from '@/components/forms/useFormContext'

const FormSummary = () => {
  const { isSigned } = useFormContext()

  return (
    <div className="flex flex-col gap-8">
      <SummaryHeader />
      <SummaryDetails />
      {isSigned && <SummaryFormSignature />}
      <SummaryAdditionalInfo />
      <SummaryFormLegalText />
      <SummaryFormControls />
    </div>
  )
}

export default FormSummary

import SummaryAdditionalInfo from '@/src/components/forms/steps/Summary/SummaryAdditionalInfo'
import SummaryDetails from '@/src/components/forms/steps/Summary/SummaryDetails'
import SummaryFormControls from '@/src/components/forms/steps/Summary/SummaryFormControls'
import SummaryFormLegalText from '@/src/components/forms/steps/Summary/SummaryFormLegalText'
import SummaryFormSignature from '@/src/components/forms/steps/Summary/SummaryFormSignature'
import SummaryHeader from '@/src/components/forms/steps/SummaryHeader'
import { useFormContext } from '@/src/components/forms/useFormContext'

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

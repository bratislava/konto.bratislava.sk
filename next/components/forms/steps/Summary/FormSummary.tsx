import { useFormContext } from '../../useFormContext'
import SummaryHeader from '../SummaryHeader'
import SummaryFormControls from './SummaryFormControls'
import SummaryFormLegalText from './SummaryFormLegalText'
import SummaryFormSignature from './SummaryFormSignature'
import SummaryFormV2 from './SummaryFormV2'
import { FormSummaryProvider } from './useFormSummary'

const FormSummary = () => {
  const { isSigned } = useFormContext()

  return (
    <FormSummaryProvider>
      <div className="flex flex-col gap-4">
        <SummaryHeader />
        {/* <SummaryForm /> */}
        <SummaryFormV2 />
        {isSigned && <SummaryFormSignature />}
        <SummaryFormLegalText />
        <SummaryFormControls />
      </div>
    </FormSummaryProvider>
  )
}

export default FormSummary

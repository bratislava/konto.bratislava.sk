import { useFormContext } from '../../useFormContext'
import SummaryHeader from '../SummaryHeader'
import SummaryForm from './SummaryForm'
import SummaryFormControls from './SummaryFormControls'
import SummaryFormLegalText from './SummaryFormLegalText'
import SummaryFormSignature from './SummaryFormSignature'
import { FormSummaryProvider } from './useFormSummary'

const FormSummary = () => {
  const { isSigned } = useFormContext()

  return (
    <FormSummaryProvider>
      <div className="flex flex-col gap-4">
        <SummaryHeader />
        <SummaryForm />
        {isSigned && <SummaryFormSignature />}
        <SummaryFormLegalText />
        <SummaryFormControls />
      </div>
    </FormSummaryProvider>
  )
}

export default FormSummary

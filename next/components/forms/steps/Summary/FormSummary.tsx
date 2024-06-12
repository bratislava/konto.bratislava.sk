import { environment } from '../../../../environment'
import { useFormContext } from '../../useFormContext'
import SummaryHeader from '../SummaryHeader'
import SummaryDetails from './SummaryDetails'
import SummaryForm from './SummaryForm'
import SummaryFormControls from './SummaryFormControls'
import SummaryFormLegalText from './SummaryFormLegalText'
import SummaryFormSignature from './SummaryFormSignature'

const FormSummary = () => {
  const { isSigned } = useFormContext()

  return (
    <div className="flex flex-col gap-4">
      <SummaryHeader />
      {environment.featureToggles.newSummaryDetails ? <SummaryDetails /> : <SummaryForm />}
      {isSigned && <SummaryFormSignature />}
      <SummaryFormLegalText />
      <SummaryFormControls />
    </div>
  )
}

export default FormSummary

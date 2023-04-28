import MyApplicationDetailsHeader from 'components/forms/segments/AccountSections/MyApplicationsSection/MyApplicationDetailsHeader'
import { MyApplicationsSentCardBase } from 'components/forms/segments/AccountSections/MyApplicationsSection/MyApplicationsSentList'

type MyApplicationsDetailsBase = {
  data: MyApplicationsSentCardBase
}

const MyApplicationDetails = ({ data }: MyApplicationsDetailsBase) => {
  return (
    <div className="flex flex-col">
      <MyApplicationDetailsHeader data={data} />
    </div>
  )
}

export default MyApplicationDetails

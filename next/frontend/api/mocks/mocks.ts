import { applicationsConceptList } from 'frontend/api/mocks/applicationsConceptList'
import { applicationsHistoryData } from 'frontend/api/mocks/applicationsHistoryData'
import { applicationsSentList } from 'frontend/api/mocks/applicationsSentList'

export type MyApplicationsSentCardBase = {
  id?: string
  title: string
  subtitle: string
  category: string
  sentDate: string
  statusDate?: string
  status: 'negative' | 'warning' | 'success'
  recordNumber?: string
  fileNumber?: string
  handlePerson?: string
  phoneContact: string
  mailContact: string
}

export type MyApplicationsConceptCardBase = {
  id: string
  title: string
  subtitle: string
  category: string
  createDate: string
}

export type MyApplicationHistoryDataBase = {
  editDate: string
  description: string
}

export const getApplicationDetailsData = (
  id?: string | string[],
): MyApplicationsSentCardBase | undefined => {
  const myApplicationDetailsData: MyApplicationsSentCardBase[] = applicationsSentList
  return myApplicationDetailsData.find((item) => id === item.id)
}

export const getApplicationHistoryData = (): MyApplicationHistoryDataBase[] => {
  const myApplicationHistoryData: MyApplicationHistoryDataBase[] = applicationsHistoryData
  return myApplicationHistoryData
}

export const getApplicationSentList = (): MyApplicationsSentCardBase[] => {
  const myApplicationSentList: MyApplicationsSentCardBase[] = applicationsSentList
  return myApplicationSentList
}

export const getApplicationConceptList = (): MyApplicationsConceptCardBase[] => {
  const myApplicationConceptList: MyApplicationsConceptCardBase[] = applicationsConceptList
  return myApplicationConceptList
}

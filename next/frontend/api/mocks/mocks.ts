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
  contact?: string
}

export type MyApplicationsConceptCardBase = {
  title: string
  subtitle: string
  category: string
  createDate: string
}

export type MyApplicationHistoryDataBase = {
  editDate: string
  description: string
}

export const getAplicationDetailsData = (id?: string | string[]): MyApplicationsSentCardBase|undefined => {
  const myAplicationDetailsData: MyApplicationsSentCardBase[] = applicationsSentList
  return myAplicationDetailsData.find((item) => id === item.id)
}

export const getAplicationHistoryData = (): MyApplicationHistoryDataBase[] => {
  const myAplicationHistoryData: MyApplicationHistoryDataBase[] = applicationsHistoryData
  return myAplicationHistoryData
}

export const getAplicationSentList = (): MyApplicationsSentCardBase[] => {
  const myAplicationSentList: MyApplicationsSentCardBase[] = applicationsSentList
  return myAplicationSentList
}

export const getAplicationConceptList = (): MyApplicationsConceptCardBase[] => {
  const myAplicationConceptList: MyApplicationsConceptCardBase[] = applicationsConceptList
  return myAplicationConceptList
}

import { GraphQLClient, RequestOptions } from 'graphql-request'
import gql from 'graphql-tag'
export type Maybe<T> = T | null
export type InputMaybe<T> = Maybe<T>
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] }
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> }
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> }
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = {
  [_ in K]?: never
}
export type Incremental<T> =
  | T
  | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never }
type GraphQLClientRequestHeaders = RequestOptions['requestHeaders']
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string }
  String: { input: string; output: string }
  Boolean: { input: boolean; output: boolean }
  Int: { input: number; output: number }
  Float: { input: number; output: number }
  DateTime: { input: any; output: any }
  JSON: { input: any; output: any }
}

export type BooleanFilterInput = {
  and?: InputMaybe<Array<InputMaybe<Scalars['Boolean']['input']>>>
  between?: InputMaybe<Array<InputMaybe<Scalars['Boolean']['input']>>>
  contains?: InputMaybe<Scalars['Boolean']['input']>
  containsi?: InputMaybe<Scalars['Boolean']['input']>
  endsWith?: InputMaybe<Scalars['Boolean']['input']>
  eq?: InputMaybe<Scalars['Boolean']['input']>
  eqi?: InputMaybe<Scalars['Boolean']['input']>
  gt?: InputMaybe<Scalars['Boolean']['input']>
  gte?: InputMaybe<Scalars['Boolean']['input']>
  in?: InputMaybe<Array<InputMaybe<Scalars['Boolean']['input']>>>
  lt?: InputMaybe<Scalars['Boolean']['input']>
  lte?: InputMaybe<Scalars['Boolean']['input']>
  ne?: InputMaybe<Scalars['Boolean']['input']>
  nei?: InputMaybe<Scalars['Boolean']['input']>
  not?: InputMaybe<BooleanFilterInput>
  notContains?: InputMaybe<Scalars['Boolean']['input']>
  notContainsi?: InputMaybe<Scalars['Boolean']['input']>
  notIn?: InputMaybe<Array<InputMaybe<Scalars['Boolean']['input']>>>
  notNull?: InputMaybe<Scalars['Boolean']['input']>
  null?: InputMaybe<Scalars['Boolean']['input']>
  or?: InputMaybe<Array<InputMaybe<Scalars['Boolean']['input']>>>
  startsWith?: InputMaybe<Scalars['Boolean']['input']>
}

export type ComponentBlocksFormLandingPage = {
  __typename?: 'ComponentBlocksFormLandingPage'
  formCta: ComponentBlocksFormLandingPageFormCta
  id: Scalars['ID']['output']
  linkCtas?: Maybe<Array<Maybe<ComponentBlocksFormLandingPageLinkCta>>>
  text?: Maybe<Scalars['String']['output']>
}

export type ComponentBlocksFormLandingPageLinkCtasArgs = {
  filters?: InputMaybe<ComponentBlocksFormLandingPageLinkCtaFiltersInput>
  pagination?: InputMaybe<PaginationArg>
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
}

export type ComponentBlocksFormLandingPageFiltersInput = {
  and?: InputMaybe<Array<InputMaybe<ComponentBlocksFormLandingPageFiltersInput>>>
  formCta?: InputMaybe<ComponentBlocksFormLandingPageFormCtaFiltersInput>
  linkCtas?: InputMaybe<ComponentBlocksFormLandingPageLinkCtaFiltersInput>
  not?: InputMaybe<ComponentBlocksFormLandingPageFiltersInput>
  or?: InputMaybe<Array<InputMaybe<ComponentBlocksFormLandingPageFiltersInput>>>
  text?: InputMaybe<StringFilterInput>
}

export type ComponentBlocksFormLandingPageFormCta = {
  __typename?: 'ComponentBlocksFormLandingPageFormCta'
  buttonLabel: Scalars['String']['output']
  id: Scalars['ID']['output']
  text?: Maybe<Scalars['String']['output']>
  title: Scalars['String']['output']
}

export type ComponentBlocksFormLandingPageFormCtaFiltersInput = {
  and?: InputMaybe<Array<InputMaybe<ComponentBlocksFormLandingPageFormCtaFiltersInput>>>
  buttonLabel?: InputMaybe<StringFilterInput>
  not?: InputMaybe<ComponentBlocksFormLandingPageFormCtaFiltersInput>
  or?: InputMaybe<Array<InputMaybe<ComponentBlocksFormLandingPageFormCtaFiltersInput>>>
  text?: InputMaybe<StringFilterInput>
  title?: InputMaybe<StringFilterInput>
}

export type ComponentBlocksFormLandingPageFormCtaInput = {
  buttonLabel?: InputMaybe<Scalars['String']['input']>
  id?: InputMaybe<Scalars['ID']['input']>
  text?: InputMaybe<Scalars['String']['input']>
  title?: InputMaybe<Scalars['String']['input']>
}

export type ComponentBlocksFormLandingPageInput = {
  formCta?: InputMaybe<ComponentBlocksFormLandingPageFormCtaInput>
  id?: InputMaybe<Scalars['ID']['input']>
  linkCtas?: InputMaybe<Array<InputMaybe<ComponentBlocksFormLandingPageLinkCtaInput>>>
  text?: InputMaybe<Scalars['String']['input']>
}

export type ComponentBlocksFormLandingPageLinkCta = {
  __typename?: 'ComponentBlocksFormLandingPageLinkCta'
  buttonLabel: Scalars['String']['output']
  id: Scalars['ID']['output']
  text?: Maybe<Scalars['String']['output']>
  title: Scalars['String']['output']
  url: Scalars['String']['output']
}

export type ComponentBlocksFormLandingPageLinkCtaFiltersInput = {
  and?: InputMaybe<Array<InputMaybe<ComponentBlocksFormLandingPageLinkCtaFiltersInput>>>
  buttonLabel?: InputMaybe<StringFilterInput>
  not?: InputMaybe<ComponentBlocksFormLandingPageLinkCtaFiltersInput>
  or?: InputMaybe<Array<InputMaybe<ComponentBlocksFormLandingPageLinkCtaFiltersInput>>>
  text?: InputMaybe<StringFilterInput>
  title?: InputMaybe<StringFilterInput>
  url?: InputMaybe<StringFilterInput>
}

export type ComponentBlocksFormLandingPageLinkCtaInput = {
  buttonLabel?: InputMaybe<Scalars['String']['input']>
  id?: InputMaybe<Scalars['ID']['input']>
  text?: InputMaybe<Scalars['String']['input']>
  title?: InputMaybe<Scalars['String']['input']>
  url?: InputMaybe<Scalars['String']['input']>
}

export type ComponentBlocksHelpCategory = {
  __typename?: 'ComponentBlocksHelpCategory'
  id: Scalars['ID']['output']
  items: Array<Maybe<ComponentBlocksHelpItem>>
  title: Scalars['String']['output']
}

export type ComponentBlocksHelpCategoryItemsArgs = {
  filters?: InputMaybe<ComponentBlocksHelpItemFiltersInput>
  pagination?: InputMaybe<PaginationArg>
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
}

export type ComponentBlocksHelpCategoryFiltersInput = {
  and?: InputMaybe<Array<InputMaybe<ComponentBlocksHelpCategoryFiltersInput>>>
  items?: InputMaybe<ComponentBlocksHelpItemFiltersInput>
  not?: InputMaybe<ComponentBlocksHelpCategoryFiltersInput>
  or?: InputMaybe<Array<InputMaybe<ComponentBlocksHelpCategoryFiltersInput>>>
  title?: InputMaybe<StringFilterInput>
}

export type ComponentBlocksHelpCategoryInput = {
  id?: InputMaybe<Scalars['ID']['input']>
  items?: InputMaybe<Array<InputMaybe<ComponentBlocksHelpItemInput>>>
  title?: InputMaybe<Scalars['String']['input']>
}

export type ComponentBlocksHelpItem = {
  __typename?: 'ComponentBlocksHelpItem'
  content: Scalars['String']['output']
  id: Scalars['ID']['output']
  title: Scalars['String']['output']
}

export type ComponentBlocksHelpItemFiltersInput = {
  and?: InputMaybe<Array<InputMaybe<ComponentBlocksHelpItemFiltersInput>>>
  content?: InputMaybe<StringFilterInput>
  not?: InputMaybe<ComponentBlocksHelpItemFiltersInput>
  or?: InputMaybe<Array<InputMaybe<ComponentBlocksHelpItemFiltersInput>>>
  title?: InputMaybe<StringFilterInput>
}

export type ComponentBlocksHelpItemInput = {
  content?: InputMaybe<Scalars['String']['input']>
  id?: InputMaybe<Scalars['ID']['input']>
  title?: InputMaybe<Scalars['String']['input']>
}

export type ComponentGeneralAlert = {
  __typename?: 'ComponentGeneralAlert'
  content: Scalars['String']['output']
  dateFrom?: Maybe<Scalars['DateTime']['output']>
  dateTo?: Maybe<Scalars['DateTime']['output']>
  id: Scalars['ID']['output']
}

export type ComponentGeneralAlertFiltersInput = {
  and?: InputMaybe<Array<InputMaybe<ComponentGeneralAlertFiltersInput>>>
  content?: InputMaybe<StringFilterInput>
  dateFrom?: InputMaybe<DateTimeFilterInput>
  dateTo?: InputMaybe<DateTimeFilterInput>
  not?: InputMaybe<ComponentGeneralAlertFiltersInput>
  or?: InputMaybe<Array<InputMaybe<ComponentGeneralAlertFiltersInput>>>
}

export type ComponentGeneralAlertInput = {
  content?: InputMaybe<Scalars['String']['input']>
  dateFrom?: InputMaybe<Scalars['DateTime']['input']>
  dateTo?: InputMaybe<Scalars['DateTime']['input']>
  id?: InputMaybe<Scalars['ID']['input']>
}

export type DateTimeFilterInput = {
  and?: InputMaybe<Array<InputMaybe<Scalars['DateTime']['input']>>>
  between?: InputMaybe<Array<InputMaybe<Scalars['DateTime']['input']>>>
  contains?: InputMaybe<Scalars['DateTime']['input']>
  containsi?: InputMaybe<Scalars['DateTime']['input']>
  endsWith?: InputMaybe<Scalars['DateTime']['input']>
  eq?: InputMaybe<Scalars['DateTime']['input']>
  eqi?: InputMaybe<Scalars['DateTime']['input']>
  gt?: InputMaybe<Scalars['DateTime']['input']>
  gte?: InputMaybe<Scalars['DateTime']['input']>
  in?: InputMaybe<Array<InputMaybe<Scalars['DateTime']['input']>>>
  lt?: InputMaybe<Scalars['DateTime']['input']>
  lte?: InputMaybe<Scalars['DateTime']['input']>
  ne?: InputMaybe<Scalars['DateTime']['input']>
  nei?: InputMaybe<Scalars['DateTime']['input']>
  not?: InputMaybe<DateTimeFilterInput>
  notContains?: InputMaybe<Scalars['DateTime']['input']>
  notContainsi?: InputMaybe<Scalars['DateTime']['input']>
  notIn?: InputMaybe<Array<InputMaybe<Scalars['DateTime']['input']>>>
  notNull?: InputMaybe<Scalars['Boolean']['input']>
  null?: InputMaybe<Scalars['Boolean']['input']>
  or?: InputMaybe<Array<InputMaybe<Scalars['DateTime']['input']>>>
  startsWith?: InputMaybe<Scalars['DateTime']['input']>
}

export type DeleteMutationResponse = {
  __typename?: 'DeleteMutationResponse'
  documentId: Scalars['ID']['output']
}

export enum Enum_Municipalservice_Color {
  Culture = 'culture',
  Education = 'education',
  Environment = 'environment',
  Main = 'main',
  Marianum = 'marianum',
  Olo = 'olo',
  Social = 'social',
  Transport = 'transport',
  Tsb = 'tsb',
}

export enum Enum_Municipalservice_Icon {
  Administration = 'administration',
  ChristmasTree = 'christmas_tree',
  CommunityGardens = 'community_gardens',
  Connector = 'connector',
  CulturalOrganizations = 'cultural_organizations',
  EventsSupport = 'events_support',
  Excavations = 'excavations',
  FrontGardens = 'front_gardens',
  Greenery = 'greenery',
  Housing = 'housing',
  KidsTeenagers = 'kids_teenagers',
  Lamp = 'lamp',
  Library = 'library',
  ManagementCommunications = 'management_communications',
  Marianum = 'marianum',
  Mosquito = 'mosquito',
  Parking = 'parking',
  PublicSpaceOccupation = 'public_space_occupation',
  Scooter = 'scooter',
  Security = 'security',
  SpatialPlanning = 'spatial_planning',
  SwimmingPool = 'swimming_pool',
  Taxes = 'taxes',
  Towing = 'towing',
  Transport = 'transport',
  Waste = 'waste',
  Zoo = 'zoo',
}

export type FileInfoInput = {
  alternativeText?: InputMaybe<Scalars['String']['input']>
  caption?: InputMaybe<Scalars['String']['input']>
  name?: InputMaybe<Scalars['String']['input']>
}

export type FloatFilterInput = {
  and?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>
  between?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>
  contains?: InputMaybe<Scalars['Float']['input']>
  containsi?: InputMaybe<Scalars['Float']['input']>
  endsWith?: InputMaybe<Scalars['Float']['input']>
  eq?: InputMaybe<Scalars['Float']['input']>
  eqi?: InputMaybe<Scalars['Float']['input']>
  gt?: InputMaybe<Scalars['Float']['input']>
  gte?: InputMaybe<Scalars['Float']['input']>
  in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>
  lt?: InputMaybe<Scalars['Float']['input']>
  lte?: InputMaybe<Scalars['Float']['input']>
  ne?: InputMaybe<Scalars['Float']['input']>
  nei?: InputMaybe<Scalars['Float']['input']>
  not?: InputMaybe<FloatFilterInput>
  notContains?: InputMaybe<Scalars['Float']['input']>
  notContainsi?: InputMaybe<Scalars['Float']['input']>
  notIn?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>
  notNull?: InputMaybe<Scalars['Boolean']['input']>
  null?: InputMaybe<Scalars['Boolean']['input']>
  or?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>
  startsWith?: InputMaybe<Scalars['Float']['input']>
}

export type Form = {
  __typename?: 'Form'
  createdAt?: Maybe<Scalars['DateTime']['output']>
  documentId: Scalars['ID']['output']
  landingPage?: Maybe<ComponentBlocksFormLandingPage>
  moreInformationUrl?: Maybe<Scalars['String']['output']>
  publishedAt?: Maybe<Scalars['DateTime']['output']>
  slug: Scalars['String']['output']
  updatedAt?: Maybe<Scalars['DateTime']['output']>
}

export type FormEntityResponseCollection = {
  __typename?: 'FormEntityResponseCollection'
  nodes: Array<Form>
  pageInfo: Pagination
}

export type FormFiltersInput = {
  and?: InputMaybe<Array<InputMaybe<FormFiltersInput>>>
  createdAt?: InputMaybe<DateTimeFilterInput>
  documentId?: InputMaybe<IdFilterInput>
  landingPage?: InputMaybe<ComponentBlocksFormLandingPageFiltersInput>
  moreInformationUrl?: InputMaybe<StringFilterInput>
  not?: InputMaybe<FormFiltersInput>
  or?: InputMaybe<Array<InputMaybe<FormFiltersInput>>>
  publishedAt?: InputMaybe<DateTimeFilterInput>
  slug?: InputMaybe<StringFilterInput>
  updatedAt?: InputMaybe<DateTimeFilterInput>
}

export type FormInput = {
  landingPage?: InputMaybe<ComponentBlocksFormLandingPageInput>
  moreInformationUrl?: InputMaybe<Scalars['String']['input']>
  publishedAt?: InputMaybe<Scalars['DateTime']['input']>
  slug?: InputMaybe<Scalars['String']['input']>
}

export type General = {
  __typename?: 'General'
  alerts?: Maybe<Array<Maybe<ComponentGeneralAlert>>>
  createdAt?: Maybe<Scalars['DateTime']['output']>
  documentId: Scalars['ID']['output']
  publishedAt?: Maybe<Scalars['DateTime']['output']>
  updatedAt?: Maybe<Scalars['DateTime']['output']>
}

export type GeneralAlertsArgs = {
  filters?: InputMaybe<ComponentGeneralAlertFiltersInput>
  pagination?: InputMaybe<PaginationArg>
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
}

export type GeneralInput = {
  alerts?: InputMaybe<Array<InputMaybe<ComponentGeneralAlertInput>>>
  publishedAt?: InputMaybe<Scalars['DateTime']['input']>
}

export type GenericMorph =
  | ComponentBlocksFormLandingPage
  | ComponentBlocksFormLandingPageFormCta
  | ComponentBlocksFormLandingPageLinkCta
  | ComponentBlocksHelpCategory
  | ComponentBlocksHelpItem
  | ComponentGeneralAlert
  | Form
  | General
  | HelpPage
  | Homepage
  | HomepageAnnouncement
  | I18NLocale
  | MunicipalService
  | MunicipalServiceCategory
  | MunicipalServiceTag
  | MunicipalServicesPage
  | ReviewWorkflowsWorkflow
  | ReviewWorkflowsWorkflowStage
  | Tax
  | UploadFile
  | UsersPermissionsPermission
  | UsersPermissionsRole
  | UsersPermissionsUser

export type HelpPage = {
  __typename?: 'HelpPage'
  categories: Array<Maybe<ComponentBlocksHelpCategory>>
  createdAt?: Maybe<Scalars['DateTime']['output']>
  documentId: Scalars['ID']['output']
  publishedAt?: Maybe<Scalars['DateTime']['output']>
  updatedAt?: Maybe<Scalars['DateTime']['output']>
}

export type HelpPageCategoriesArgs = {
  filters?: InputMaybe<ComponentBlocksHelpCategoryFiltersInput>
  pagination?: InputMaybe<PaginationArg>
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
}

export type HelpPageInput = {
  categories?: InputMaybe<Array<InputMaybe<ComponentBlocksHelpCategoryInput>>>
  publishedAt?: InputMaybe<Scalars['DateTime']['input']>
}

export type Homepage = {
  __typename?: 'Homepage'
  announcements: Array<Maybe<HomepageAnnouncement>>
  announcementsLegalPerson: Array<Maybe<HomepageAnnouncement>>
  announcementsLegalPerson_connection?: Maybe<HomepageAnnouncementRelationResponseCollection>
  announcements_connection?: Maybe<HomepageAnnouncementRelationResponseCollection>
  createdAt?: Maybe<Scalars['DateTime']['output']>
  documentId: Scalars['ID']['output']
  publishedAt?: Maybe<Scalars['DateTime']['output']>
  services: Array<Maybe<MunicipalService>>
  servicesLegalPerson: Array<Maybe<MunicipalService>>
  servicesLegalPerson_connection?: Maybe<MunicipalServiceRelationResponseCollection>
  services_connection?: Maybe<MunicipalServiceRelationResponseCollection>
  updatedAt?: Maybe<Scalars['DateTime']['output']>
}

export type HomepageAnnouncementsArgs = {
  filters?: InputMaybe<HomepageAnnouncementFiltersInput>
  pagination?: InputMaybe<PaginationArg>
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
}

export type HomepageAnnouncementsLegalPersonArgs = {
  filters?: InputMaybe<HomepageAnnouncementFiltersInput>
  pagination?: InputMaybe<PaginationArg>
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
}

export type HomepageAnnouncementsLegalPerson_ConnectionArgs = {
  filters?: InputMaybe<HomepageAnnouncementFiltersInput>
  pagination?: InputMaybe<PaginationArg>
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
}

export type HomepageAnnouncements_ConnectionArgs = {
  filters?: InputMaybe<HomepageAnnouncementFiltersInput>
  pagination?: InputMaybe<PaginationArg>
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
}

export type HomepageServicesArgs = {
  filters?: InputMaybe<MunicipalServiceFiltersInput>
  pagination?: InputMaybe<PaginationArg>
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
}

export type HomepageServicesLegalPersonArgs = {
  filters?: InputMaybe<MunicipalServiceFiltersInput>
  pagination?: InputMaybe<PaginationArg>
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
}

export type HomepageServicesLegalPerson_ConnectionArgs = {
  filters?: InputMaybe<MunicipalServiceFiltersInput>
  pagination?: InputMaybe<PaginationArg>
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
}

export type HomepageServices_ConnectionArgs = {
  filters?: InputMaybe<MunicipalServiceFiltersInput>
  pagination?: InputMaybe<PaginationArg>
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
}

export type HomepageAnnouncement = {
  __typename?: 'HomepageAnnouncement'
  buttonText: Scalars['String']['output']
  createdAt?: Maybe<Scalars['DateTime']['output']>
  dateFrom?: Maybe<Scalars['DateTime']['output']>
  dateTo?: Maybe<Scalars['DateTime']['output']>
  description: Scalars['String']['output']
  documentId: Scalars['ID']['output']
  href: Scalars['String']['output']
  image: UploadFile
  publishedAt?: Maybe<Scalars['DateTime']['output']>
  title: Scalars['String']['output']
  updatedAt?: Maybe<Scalars['DateTime']['output']>
}

export type HomepageAnnouncementEntityResponseCollection = {
  __typename?: 'HomepageAnnouncementEntityResponseCollection'
  nodes: Array<HomepageAnnouncement>
  pageInfo: Pagination
}

export type HomepageAnnouncementFiltersInput = {
  and?: InputMaybe<Array<InputMaybe<HomepageAnnouncementFiltersInput>>>
  buttonText?: InputMaybe<StringFilterInput>
  createdAt?: InputMaybe<DateTimeFilterInput>
  dateFrom?: InputMaybe<DateTimeFilterInput>
  dateTo?: InputMaybe<DateTimeFilterInput>
  description?: InputMaybe<StringFilterInput>
  documentId?: InputMaybe<IdFilterInput>
  href?: InputMaybe<StringFilterInput>
  not?: InputMaybe<HomepageAnnouncementFiltersInput>
  or?: InputMaybe<Array<InputMaybe<HomepageAnnouncementFiltersInput>>>
  publishedAt?: InputMaybe<DateTimeFilterInput>
  title?: InputMaybe<StringFilterInput>
  updatedAt?: InputMaybe<DateTimeFilterInput>
}

export type HomepageAnnouncementInput = {
  buttonText?: InputMaybe<Scalars['String']['input']>
  dateFrom?: InputMaybe<Scalars['DateTime']['input']>
  dateTo?: InputMaybe<Scalars['DateTime']['input']>
  description?: InputMaybe<Scalars['String']['input']>
  href?: InputMaybe<Scalars['String']['input']>
  image?: InputMaybe<Scalars['ID']['input']>
  publishedAt?: InputMaybe<Scalars['DateTime']['input']>
  title?: InputMaybe<Scalars['String']['input']>
}

export type HomepageAnnouncementRelationResponseCollection = {
  __typename?: 'HomepageAnnouncementRelationResponseCollection'
  nodes: Array<HomepageAnnouncement>
}

export type HomepageInput = {
  announcements?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>
  announcementsLegalPerson?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>
  publishedAt?: InputMaybe<Scalars['DateTime']['input']>
  services?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>
  servicesLegalPerson?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>
}

export type I18NLocale = {
  __typename?: 'I18NLocale'
  code?: Maybe<Scalars['String']['output']>
  createdAt?: Maybe<Scalars['DateTime']['output']>
  documentId: Scalars['ID']['output']
  name?: Maybe<Scalars['String']['output']>
  publishedAt?: Maybe<Scalars['DateTime']['output']>
  updatedAt?: Maybe<Scalars['DateTime']['output']>
}

export type I18NLocaleEntityResponseCollection = {
  __typename?: 'I18NLocaleEntityResponseCollection'
  nodes: Array<I18NLocale>
  pageInfo: Pagination
}

export type I18NLocaleFiltersInput = {
  and?: InputMaybe<Array<InputMaybe<I18NLocaleFiltersInput>>>
  code?: InputMaybe<StringFilterInput>
  createdAt?: InputMaybe<DateTimeFilterInput>
  documentId?: InputMaybe<IdFilterInput>
  name?: InputMaybe<StringFilterInput>
  not?: InputMaybe<I18NLocaleFiltersInput>
  or?: InputMaybe<Array<InputMaybe<I18NLocaleFiltersInput>>>
  publishedAt?: InputMaybe<DateTimeFilterInput>
  updatedAt?: InputMaybe<DateTimeFilterInput>
}

export type IdFilterInput = {
  and?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>
  between?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>
  contains?: InputMaybe<Scalars['ID']['input']>
  containsi?: InputMaybe<Scalars['ID']['input']>
  endsWith?: InputMaybe<Scalars['ID']['input']>
  eq?: InputMaybe<Scalars['ID']['input']>
  eqi?: InputMaybe<Scalars['ID']['input']>
  gt?: InputMaybe<Scalars['ID']['input']>
  gte?: InputMaybe<Scalars['ID']['input']>
  in?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>
  lt?: InputMaybe<Scalars['ID']['input']>
  lte?: InputMaybe<Scalars['ID']['input']>
  ne?: InputMaybe<Scalars['ID']['input']>
  nei?: InputMaybe<Scalars['ID']['input']>
  not?: InputMaybe<IdFilterInput>
  notContains?: InputMaybe<Scalars['ID']['input']>
  notContainsi?: InputMaybe<Scalars['ID']['input']>
  notIn?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>
  notNull?: InputMaybe<Scalars['Boolean']['input']>
  null?: InputMaybe<Scalars['Boolean']['input']>
  or?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>
  startsWith?: InputMaybe<Scalars['ID']['input']>
}

export type IntFilterInput = {
  and?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>
  between?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>
  contains?: InputMaybe<Scalars['Int']['input']>
  containsi?: InputMaybe<Scalars['Int']['input']>
  endsWith?: InputMaybe<Scalars['Int']['input']>
  eq?: InputMaybe<Scalars['Int']['input']>
  eqi?: InputMaybe<Scalars['Int']['input']>
  gt?: InputMaybe<Scalars['Int']['input']>
  gte?: InputMaybe<Scalars['Int']['input']>
  in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>
  lt?: InputMaybe<Scalars['Int']['input']>
  lte?: InputMaybe<Scalars['Int']['input']>
  ne?: InputMaybe<Scalars['Int']['input']>
  nei?: InputMaybe<Scalars['Int']['input']>
  not?: InputMaybe<IntFilterInput>
  notContains?: InputMaybe<Scalars['Int']['input']>
  notContainsi?: InputMaybe<Scalars['Int']['input']>
  notIn?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>
  notNull?: InputMaybe<Scalars['Boolean']['input']>
  null?: InputMaybe<Scalars['Boolean']['input']>
  or?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>
  startsWith?: InputMaybe<Scalars['Int']['input']>
}

export type JsonFilterInput = {
  and?: InputMaybe<Array<InputMaybe<Scalars['JSON']['input']>>>
  between?: InputMaybe<Array<InputMaybe<Scalars['JSON']['input']>>>
  contains?: InputMaybe<Scalars['JSON']['input']>
  containsi?: InputMaybe<Scalars['JSON']['input']>
  endsWith?: InputMaybe<Scalars['JSON']['input']>
  eq?: InputMaybe<Scalars['JSON']['input']>
  eqi?: InputMaybe<Scalars['JSON']['input']>
  gt?: InputMaybe<Scalars['JSON']['input']>
  gte?: InputMaybe<Scalars['JSON']['input']>
  in?: InputMaybe<Array<InputMaybe<Scalars['JSON']['input']>>>
  lt?: InputMaybe<Scalars['JSON']['input']>
  lte?: InputMaybe<Scalars['JSON']['input']>
  ne?: InputMaybe<Scalars['JSON']['input']>
  nei?: InputMaybe<Scalars['JSON']['input']>
  not?: InputMaybe<JsonFilterInput>
  notContains?: InputMaybe<Scalars['JSON']['input']>
  notContainsi?: InputMaybe<Scalars['JSON']['input']>
  notIn?: InputMaybe<Array<InputMaybe<Scalars['JSON']['input']>>>
  notNull?: InputMaybe<Scalars['Boolean']['input']>
  null?: InputMaybe<Scalars['Boolean']['input']>
  or?: InputMaybe<Array<InputMaybe<Scalars['JSON']['input']>>>
  startsWith?: InputMaybe<Scalars['JSON']['input']>
}

export type MunicipalService = {
  __typename?: 'MunicipalService'
  buttonText: Scalars['String']['output']
  categories: Array<Maybe<MunicipalServiceCategory>>
  categories_connection?: Maybe<MunicipalServiceCategoryRelationResponseCollection>
  color: Enum_Municipalservice_Color
  createdAt?: Maybe<Scalars['DateTime']['output']>
  description: Scalars['String']['output']
  documentId: Scalars['ID']['output']
  href: Scalars['String']['output']
  icon: Enum_Municipalservice_Icon
  publishedAt?: Maybe<Scalars['DateTime']['output']>
  tags: Array<Maybe<MunicipalServiceTag>>
  tags_connection?: Maybe<MunicipalServiceTagRelationResponseCollection>
  title: Scalars['String']['output']
  updatedAt?: Maybe<Scalars['DateTime']['output']>
}

export type MunicipalServiceCategoriesArgs = {
  filters?: InputMaybe<MunicipalServiceCategoryFiltersInput>
  pagination?: InputMaybe<PaginationArg>
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
}

export type MunicipalServiceCategories_ConnectionArgs = {
  filters?: InputMaybe<MunicipalServiceCategoryFiltersInput>
  pagination?: InputMaybe<PaginationArg>
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
}

export type MunicipalServiceTagsArgs = {
  filters?: InputMaybe<MunicipalServiceTagFiltersInput>
  pagination?: InputMaybe<PaginationArg>
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
}

export type MunicipalServiceTags_ConnectionArgs = {
  filters?: InputMaybe<MunicipalServiceTagFiltersInput>
  pagination?: InputMaybe<PaginationArg>
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
}

export type MunicipalServiceCategory = {
  __typename?: 'MunicipalServiceCategory'
  createdAt?: Maybe<Scalars['DateTime']['output']>
  documentId: Scalars['ID']['output']
  municipalServices: Array<Maybe<MunicipalService>>
  municipalServices_connection?: Maybe<MunicipalServiceRelationResponseCollection>
  publishedAt?: Maybe<Scalars['DateTime']['output']>
  title: Scalars['String']['output']
  updatedAt?: Maybe<Scalars['DateTime']['output']>
}

export type MunicipalServiceCategoryMunicipalServicesArgs = {
  filters?: InputMaybe<MunicipalServiceFiltersInput>
  pagination?: InputMaybe<PaginationArg>
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
}

export type MunicipalServiceCategoryMunicipalServices_ConnectionArgs = {
  filters?: InputMaybe<MunicipalServiceFiltersInput>
  pagination?: InputMaybe<PaginationArg>
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
}

export type MunicipalServiceCategoryEntityResponseCollection = {
  __typename?: 'MunicipalServiceCategoryEntityResponseCollection'
  nodes: Array<MunicipalServiceCategory>
  pageInfo: Pagination
}

export type MunicipalServiceCategoryFiltersInput = {
  and?: InputMaybe<Array<InputMaybe<MunicipalServiceCategoryFiltersInput>>>
  createdAt?: InputMaybe<DateTimeFilterInput>
  documentId?: InputMaybe<IdFilterInput>
  municipalServices?: InputMaybe<MunicipalServiceFiltersInput>
  not?: InputMaybe<MunicipalServiceCategoryFiltersInput>
  or?: InputMaybe<Array<InputMaybe<MunicipalServiceCategoryFiltersInput>>>
  publishedAt?: InputMaybe<DateTimeFilterInput>
  title?: InputMaybe<StringFilterInput>
  updatedAt?: InputMaybe<DateTimeFilterInput>
}

export type MunicipalServiceCategoryInput = {
  municipalServices?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>
  publishedAt?: InputMaybe<Scalars['DateTime']['input']>
  title?: InputMaybe<Scalars['String']['input']>
}

export type MunicipalServiceCategoryRelationResponseCollection = {
  __typename?: 'MunicipalServiceCategoryRelationResponseCollection'
  nodes: Array<MunicipalServiceCategory>
}

export type MunicipalServiceEntityResponseCollection = {
  __typename?: 'MunicipalServiceEntityResponseCollection'
  nodes: Array<MunicipalService>
  pageInfo: Pagination
}

export type MunicipalServiceFiltersInput = {
  and?: InputMaybe<Array<InputMaybe<MunicipalServiceFiltersInput>>>
  buttonText?: InputMaybe<StringFilterInput>
  categories?: InputMaybe<MunicipalServiceCategoryFiltersInput>
  color?: InputMaybe<StringFilterInput>
  createdAt?: InputMaybe<DateTimeFilterInput>
  description?: InputMaybe<StringFilterInput>
  documentId?: InputMaybe<IdFilterInput>
  href?: InputMaybe<StringFilterInput>
  icon?: InputMaybe<StringFilterInput>
  not?: InputMaybe<MunicipalServiceFiltersInput>
  or?: InputMaybe<Array<InputMaybe<MunicipalServiceFiltersInput>>>
  publishedAt?: InputMaybe<DateTimeFilterInput>
  tags?: InputMaybe<MunicipalServiceTagFiltersInput>
  title?: InputMaybe<StringFilterInput>
  updatedAt?: InputMaybe<DateTimeFilterInput>
}

export type MunicipalServiceInput = {
  buttonText?: InputMaybe<Scalars['String']['input']>
  categories?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>
  color?: InputMaybe<Enum_Municipalservice_Color>
  description?: InputMaybe<Scalars['String']['input']>
  href?: InputMaybe<Scalars['String']['input']>
  icon?: InputMaybe<Enum_Municipalservice_Icon>
  publishedAt?: InputMaybe<Scalars['DateTime']['input']>
  tags?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>
  title?: InputMaybe<Scalars['String']['input']>
}

export type MunicipalServiceRelationResponseCollection = {
  __typename?: 'MunicipalServiceRelationResponseCollection'
  nodes: Array<MunicipalService>
}

export type MunicipalServiceTag = {
  __typename?: 'MunicipalServiceTag'
  createdAt?: Maybe<Scalars['DateTime']['output']>
  documentId: Scalars['ID']['output']
  municipalServices: Array<Maybe<MunicipalService>>
  municipalServices_connection?: Maybe<MunicipalServiceRelationResponseCollection>
  publishedAt?: Maybe<Scalars['DateTime']['output']>
  title: Scalars['String']['output']
  updatedAt?: Maybe<Scalars['DateTime']['output']>
}

export type MunicipalServiceTagMunicipalServicesArgs = {
  filters?: InputMaybe<MunicipalServiceFiltersInput>
  pagination?: InputMaybe<PaginationArg>
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
}

export type MunicipalServiceTagMunicipalServices_ConnectionArgs = {
  filters?: InputMaybe<MunicipalServiceFiltersInput>
  pagination?: InputMaybe<PaginationArg>
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
}

export type MunicipalServiceTagEntityResponseCollection = {
  __typename?: 'MunicipalServiceTagEntityResponseCollection'
  nodes: Array<MunicipalServiceTag>
  pageInfo: Pagination
}

export type MunicipalServiceTagFiltersInput = {
  and?: InputMaybe<Array<InputMaybe<MunicipalServiceTagFiltersInput>>>
  createdAt?: InputMaybe<DateTimeFilterInput>
  documentId?: InputMaybe<IdFilterInput>
  municipalServices?: InputMaybe<MunicipalServiceFiltersInput>
  not?: InputMaybe<MunicipalServiceTagFiltersInput>
  or?: InputMaybe<Array<InputMaybe<MunicipalServiceTagFiltersInput>>>
  publishedAt?: InputMaybe<DateTimeFilterInput>
  title?: InputMaybe<StringFilterInput>
  updatedAt?: InputMaybe<DateTimeFilterInput>
}

export type MunicipalServiceTagInput = {
  municipalServices?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>
  publishedAt?: InputMaybe<Scalars['DateTime']['input']>
  title?: InputMaybe<Scalars['String']['input']>
}

export type MunicipalServiceTagRelationResponseCollection = {
  __typename?: 'MunicipalServiceTagRelationResponseCollection'
  nodes: Array<MunicipalServiceTag>
}

export type MunicipalServicesPage = {
  __typename?: 'MunicipalServicesPage'
  createdAt?: Maybe<Scalars['DateTime']['output']>
  documentId: Scalars['ID']['output']
  publishedAt?: Maybe<Scalars['DateTime']['output']>
  services: Array<Maybe<MunicipalService>>
  servicesLegalPerson: Array<Maybe<MunicipalService>>
  servicesLegalPerson_connection?: Maybe<MunicipalServiceRelationResponseCollection>
  services_connection?: Maybe<MunicipalServiceRelationResponseCollection>
  updatedAt?: Maybe<Scalars['DateTime']['output']>
}

export type MunicipalServicesPageServicesArgs = {
  filters?: InputMaybe<MunicipalServiceFiltersInput>
  pagination?: InputMaybe<PaginationArg>
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
}

export type MunicipalServicesPageServicesLegalPersonArgs = {
  filters?: InputMaybe<MunicipalServiceFiltersInput>
  pagination?: InputMaybe<PaginationArg>
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
}

export type MunicipalServicesPageServicesLegalPerson_ConnectionArgs = {
  filters?: InputMaybe<MunicipalServiceFiltersInput>
  pagination?: InputMaybe<PaginationArg>
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
}

export type MunicipalServicesPageServices_ConnectionArgs = {
  filters?: InputMaybe<MunicipalServiceFiltersInput>
  pagination?: InputMaybe<PaginationArg>
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
}

export type MunicipalServicesPageInput = {
  publishedAt?: InputMaybe<Scalars['DateTime']['input']>
  services?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>
  servicesLegalPerson?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>
}

export type Mutation = {
  __typename?: 'Mutation'
  /** Change user password. Confirm with the current password. */
  changePassword?: Maybe<UsersPermissionsLoginPayload>
  createForm?: Maybe<Form>
  createHomepageAnnouncement?: Maybe<HomepageAnnouncement>
  createMunicipalService?: Maybe<MunicipalService>
  createMunicipalServiceCategory?: Maybe<MunicipalServiceCategory>
  createMunicipalServiceTag?: Maybe<MunicipalServiceTag>
  createReviewWorkflowsWorkflow?: Maybe<ReviewWorkflowsWorkflow>
  createReviewWorkflowsWorkflowStage?: Maybe<ReviewWorkflowsWorkflowStage>
  /** Create a new role */
  createUsersPermissionsRole?: Maybe<UsersPermissionsCreateRolePayload>
  /** Create a new user */
  createUsersPermissionsUser: UsersPermissionsUserEntityResponse
  deleteForm?: Maybe<DeleteMutationResponse>
  deleteGeneral?: Maybe<DeleteMutationResponse>
  deleteHelpPage?: Maybe<DeleteMutationResponse>
  deleteHomepage?: Maybe<DeleteMutationResponse>
  deleteHomepageAnnouncement?: Maybe<DeleteMutationResponse>
  deleteMunicipalService?: Maybe<DeleteMutationResponse>
  deleteMunicipalServiceCategory?: Maybe<DeleteMutationResponse>
  deleteMunicipalServiceTag?: Maybe<DeleteMutationResponse>
  deleteMunicipalServicesPage?: Maybe<DeleteMutationResponse>
  deleteReviewWorkflowsWorkflow?: Maybe<DeleteMutationResponse>
  deleteReviewWorkflowsWorkflowStage?: Maybe<DeleteMutationResponse>
  deleteTax?: Maybe<DeleteMutationResponse>
  deleteUploadFile?: Maybe<UploadFile>
  /** Delete an existing role */
  deleteUsersPermissionsRole?: Maybe<UsersPermissionsDeleteRolePayload>
  /** Delete an existing user */
  deleteUsersPermissionsUser: UsersPermissionsUserEntityResponse
  /** Confirm an email users email address */
  emailConfirmation?: Maybe<UsersPermissionsLoginPayload>
  /** Request a reset password token */
  forgotPassword?: Maybe<UsersPermissionsPasswordPayload>
  login: UsersPermissionsLoginPayload
  /** Register a user */
  register: UsersPermissionsLoginPayload
  /** Reset user password. Confirm with a code (resetToken from forgotPassword) */
  resetPassword?: Maybe<UsersPermissionsLoginPayload>
  updateForm?: Maybe<Form>
  updateGeneral?: Maybe<General>
  updateHelpPage?: Maybe<HelpPage>
  updateHomepage?: Maybe<Homepage>
  updateHomepageAnnouncement?: Maybe<HomepageAnnouncement>
  updateMunicipalService?: Maybe<MunicipalService>
  updateMunicipalServiceCategory?: Maybe<MunicipalServiceCategory>
  updateMunicipalServiceTag?: Maybe<MunicipalServiceTag>
  updateMunicipalServicesPage?: Maybe<MunicipalServicesPage>
  updateReviewWorkflowsWorkflow?: Maybe<ReviewWorkflowsWorkflow>
  updateReviewWorkflowsWorkflowStage?: Maybe<ReviewWorkflowsWorkflowStage>
  updateTax?: Maybe<Tax>
  updateUploadFile: UploadFile
  /** Update an existing role */
  updateUsersPermissionsRole?: Maybe<UsersPermissionsUpdateRolePayload>
  /** Update an existing user */
  updateUsersPermissionsUser: UsersPermissionsUserEntityResponse
}

export type MutationChangePasswordArgs = {
  currentPassword: Scalars['String']['input']
  password: Scalars['String']['input']
  passwordConfirmation: Scalars['String']['input']
}

export type MutationCreateFormArgs = {
  data: FormInput
  status?: InputMaybe<PublicationStatus>
}

export type MutationCreateHomepageAnnouncementArgs = {
  data: HomepageAnnouncementInput
  status?: InputMaybe<PublicationStatus>
}

export type MutationCreateMunicipalServiceArgs = {
  data: MunicipalServiceInput
  status?: InputMaybe<PublicationStatus>
}

export type MutationCreateMunicipalServiceCategoryArgs = {
  data: MunicipalServiceCategoryInput
  status?: InputMaybe<PublicationStatus>
}

export type MutationCreateMunicipalServiceTagArgs = {
  data: MunicipalServiceTagInput
  status?: InputMaybe<PublicationStatus>
}

export type MutationCreateReviewWorkflowsWorkflowArgs = {
  data: ReviewWorkflowsWorkflowInput
  status?: InputMaybe<PublicationStatus>
}

export type MutationCreateReviewWorkflowsWorkflowStageArgs = {
  data: ReviewWorkflowsWorkflowStageInput
  status?: InputMaybe<PublicationStatus>
}

export type MutationCreateUsersPermissionsRoleArgs = {
  data: UsersPermissionsRoleInput
}

export type MutationCreateUsersPermissionsUserArgs = {
  data: UsersPermissionsUserInput
}

export type MutationDeleteFormArgs = {
  documentId: Scalars['ID']['input']
}

export type MutationDeleteHomepageAnnouncementArgs = {
  documentId: Scalars['ID']['input']
}

export type MutationDeleteMunicipalServiceArgs = {
  documentId: Scalars['ID']['input']
}

export type MutationDeleteMunicipalServiceCategoryArgs = {
  documentId: Scalars['ID']['input']
}

export type MutationDeleteMunicipalServiceTagArgs = {
  documentId: Scalars['ID']['input']
}

export type MutationDeleteReviewWorkflowsWorkflowArgs = {
  documentId: Scalars['ID']['input']
}

export type MutationDeleteReviewWorkflowsWorkflowStageArgs = {
  documentId: Scalars['ID']['input']
}

export type MutationDeleteUploadFileArgs = {
  id: Scalars['ID']['input']
}

export type MutationDeleteUsersPermissionsRoleArgs = {
  id: Scalars['ID']['input']
}

export type MutationDeleteUsersPermissionsUserArgs = {
  id: Scalars['ID']['input']
}

export type MutationEmailConfirmationArgs = {
  confirmation: Scalars['String']['input']
}

export type MutationForgotPasswordArgs = {
  email: Scalars['String']['input']
}

export type MutationLoginArgs = {
  input: UsersPermissionsLoginInput
}

export type MutationRegisterArgs = {
  input: UsersPermissionsRegisterInput
}

export type MutationResetPasswordArgs = {
  code: Scalars['String']['input']
  password: Scalars['String']['input']
  passwordConfirmation: Scalars['String']['input']
}

export type MutationUpdateFormArgs = {
  data: FormInput
  documentId: Scalars['ID']['input']
  status?: InputMaybe<PublicationStatus>
}

export type MutationUpdateGeneralArgs = {
  data: GeneralInput
  status?: InputMaybe<PublicationStatus>
}

export type MutationUpdateHelpPageArgs = {
  data: HelpPageInput
  status?: InputMaybe<PublicationStatus>
}

export type MutationUpdateHomepageArgs = {
  data: HomepageInput
  status?: InputMaybe<PublicationStatus>
}

export type MutationUpdateHomepageAnnouncementArgs = {
  data: HomepageAnnouncementInput
  documentId: Scalars['ID']['input']
  status?: InputMaybe<PublicationStatus>
}

export type MutationUpdateMunicipalServiceArgs = {
  data: MunicipalServiceInput
  documentId: Scalars['ID']['input']
  status?: InputMaybe<PublicationStatus>
}

export type MutationUpdateMunicipalServiceCategoryArgs = {
  data: MunicipalServiceCategoryInput
  documentId: Scalars['ID']['input']
  status?: InputMaybe<PublicationStatus>
}

export type MutationUpdateMunicipalServiceTagArgs = {
  data: MunicipalServiceTagInput
  documentId: Scalars['ID']['input']
  status?: InputMaybe<PublicationStatus>
}

export type MutationUpdateMunicipalServicesPageArgs = {
  data: MunicipalServicesPageInput
  status?: InputMaybe<PublicationStatus>
}

export type MutationUpdateReviewWorkflowsWorkflowArgs = {
  data: ReviewWorkflowsWorkflowInput
  documentId: Scalars['ID']['input']
  status?: InputMaybe<PublicationStatus>
}

export type MutationUpdateReviewWorkflowsWorkflowStageArgs = {
  data: ReviewWorkflowsWorkflowStageInput
  documentId: Scalars['ID']['input']
  status?: InputMaybe<PublicationStatus>
}

export type MutationUpdateTaxArgs = {
  data: TaxInput
  status?: InputMaybe<PublicationStatus>
}

export type MutationUpdateUploadFileArgs = {
  id: Scalars['ID']['input']
  info?: InputMaybe<FileInfoInput>
}

export type MutationUpdateUsersPermissionsRoleArgs = {
  data: UsersPermissionsRoleInput
  id: Scalars['ID']['input']
}

export type MutationUpdateUsersPermissionsUserArgs = {
  data: UsersPermissionsUserInput
  id: Scalars['ID']['input']
}

export type Pagination = {
  __typename?: 'Pagination'
  page: Scalars['Int']['output']
  pageCount: Scalars['Int']['output']
  pageSize: Scalars['Int']['output']
  total: Scalars['Int']['output']
}

export type PaginationArg = {
  limit?: InputMaybe<Scalars['Int']['input']>
  page?: InputMaybe<Scalars['Int']['input']>
  pageSize?: InputMaybe<Scalars['Int']['input']>
  start?: InputMaybe<Scalars['Int']['input']>
}

export enum PublicationStatus {
  Draft = 'DRAFT',
  Published = 'PUBLISHED',
}

export type Query = {
  __typename?: 'Query'
  form?: Maybe<Form>
  forms: Array<Maybe<Form>>
  forms_connection?: Maybe<FormEntityResponseCollection>
  general?: Maybe<General>
  helpPage?: Maybe<HelpPage>
  homepage?: Maybe<Homepage>
  homepageAnnouncement?: Maybe<HomepageAnnouncement>
  homepageAnnouncements: Array<Maybe<HomepageAnnouncement>>
  homepageAnnouncements_connection?: Maybe<HomepageAnnouncementEntityResponseCollection>
  i18NLocale?: Maybe<I18NLocale>
  i18NLocales: Array<Maybe<I18NLocale>>
  i18NLocales_connection?: Maybe<I18NLocaleEntityResponseCollection>
  me?: Maybe<UsersPermissionsMe>
  municipalService?: Maybe<MunicipalService>
  municipalServiceCategories: Array<Maybe<MunicipalServiceCategory>>
  municipalServiceCategories_connection?: Maybe<MunicipalServiceCategoryEntityResponseCollection>
  municipalServiceCategory?: Maybe<MunicipalServiceCategory>
  municipalServiceTag?: Maybe<MunicipalServiceTag>
  municipalServiceTags: Array<Maybe<MunicipalServiceTag>>
  municipalServiceTags_connection?: Maybe<MunicipalServiceTagEntityResponseCollection>
  municipalServices: Array<Maybe<MunicipalService>>
  municipalServicesPage?: Maybe<MunicipalServicesPage>
  municipalServices_connection?: Maybe<MunicipalServiceEntityResponseCollection>
  reviewWorkflowsWorkflow?: Maybe<ReviewWorkflowsWorkflow>
  reviewWorkflowsWorkflowStage?: Maybe<ReviewWorkflowsWorkflowStage>
  reviewWorkflowsWorkflowStages: Array<Maybe<ReviewWorkflowsWorkflowStage>>
  reviewWorkflowsWorkflowStages_connection?: Maybe<ReviewWorkflowsWorkflowStageEntityResponseCollection>
  reviewWorkflowsWorkflows: Array<Maybe<ReviewWorkflowsWorkflow>>
  reviewWorkflowsWorkflows_connection?: Maybe<ReviewWorkflowsWorkflowEntityResponseCollection>
  tax?: Maybe<Tax>
  uploadFile?: Maybe<UploadFile>
  uploadFiles: Array<Maybe<UploadFile>>
  uploadFiles_connection?: Maybe<UploadFileEntityResponseCollection>
  usersPermissionsRole?: Maybe<UsersPermissionsRole>
  usersPermissionsRoles: Array<Maybe<UsersPermissionsRole>>
  usersPermissionsRoles_connection?: Maybe<UsersPermissionsRoleEntityResponseCollection>
  usersPermissionsUser?: Maybe<UsersPermissionsUser>
  usersPermissionsUsers: Array<Maybe<UsersPermissionsUser>>
  usersPermissionsUsers_connection?: Maybe<UsersPermissionsUserEntityResponseCollection>
}

export type QueryFormArgs = {
  documentId: Scalars['ID']['input']
}

export type QueryFormsArgs = {
  filters?: InputMaybe<FormFiltersInput>
  pagination?: InputMaybe<PaginationArg>
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
}

export type QueryForms_ConnectionArgs = {
  filters?: InputMaybe<FormFiltersInput>
  pagination?: InputMaybe<PaginationArg>
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
}

export type QueryHomepageAnnouncementArgs = {
  documentId: Scalars['ID']['input']
}

export type QueryHomepageAnnouncementsArgs = {
  filters?: InputMaybe<HomepageAnnouncementFiltersInput>
  pagination?: InputMaybe<PaginationArg>
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
}

export type QueryHomepageAnnouncements_ConnectionArgs = {
  filters?: InputMaybe<HomepageAnnouncementFiltersInput>
  pagination?: InputMaybe<PaginationArg>
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
}

export type QueryI18NLocaleArgs = {
  documentId: Scalars['ID']['input']
}

export type QueryI18NLocalesArgs = {
  filters?: InputMaybe<I18NLocaleFiltersInput>
  pagination?: InputMaybe<PaginationArg>
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
}

export type QueryI18NLocales_ConnectionArgs = {
  filters?: InputMaybe<I18NLocaleFiltersInput>
  pagination?: InputMaybe<PaginationArg>
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
}

export type QueryMunicipalServiceArgs = {
  documentId: Scalars['ID']['input']
}

export type QueryMunicipalServiceCategoriesArgs = {
  filters?: InputMaybe<MunicipalServiceCategoryFiltersInput>
  pagination?: InputMaybe<PaginationArg>
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
}

export type QueryMunicipalServiceCategories_ConnectionArgs = {
  filters?: InputMaybe<MunicipalServiceCategoryFiltersInput>
  pagination?: InputMaybe<PaginationArg>
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
}

export type QueryMunicipalServiceCategoryArgs = {
  documentId: Scalars['ID']['input']
}

export type QueryMunicipalServiceTagArgs = {
  documentId: Scalars['ID']['input']
}

export type QueryMunicipalServiceTagsArgs = {
  filters?: InputMaybe<MunicipalServiceTagFiltersInput>
  pagination?: InputMaybe<PaginationArg>
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
}

export type QueryMunicipalServiceTags_ConnectionArgs = {
  filters?: InputMaybe<MunicipalServiceTagFiltersInput>
  pagination?: InputMaybe<PaginationArg>
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
}

export type QueryMunicipalServicesArgs = {
  filters?: InputMaybe<MunicipalServiceFiltersInput>
  pagination?: InputMaybe<PaginationArg>
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
}

export type QueryMunicipalServices_ConnectionArgs = {
  filters?: InputMaybe<MunicipalServiceFiltersInput>
  pagination?: InputMaybe<PaginationArg>
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
}

export type QueryReviewWorkflowsWorkflowArgs = {
  documentId: Scalars['ID']['input']
}

export type QueryReviewWorkflowsWorkflowStageArgs = {
  documentId: Scalars['ID']['input']
}

export type QueryReviewWorkflowsWorkflowStagesArgs = {
  filters?: InputMaybe<ReviewWorkflowsWorkflowStageFiltersInput>
  pagination?: InputMaybe<PaginationArg>
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
}

export type QueryReviewWorkflowsWorkflowStages_ConnectionArgs = {
  filters?: InputMaybe<ReviewWorkflowsWorkflowStageFiltersInput>
  pagination?: InputMaybe<PaginationArg>
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
}

export type QueryReviewWorkflowsWorkflowsArgs = {
  filters?: InputMaybe<ReviewWorkflowsWorkflowFiltersInput>
  pagination?: InputMaybe<PaginationArg>
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
}

export type QueryReviewWorkflowsWorkflows_ConnectionArgs = {
  filters?: InputMaybe<ReviewWorkflowsWorkflowFiltersInput>
  pagination?: InputMaybe<PaginationArg>
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
}

export type QueryUploadFileArgs = {
  documentId: Scalars['ID']['input']
}

export type QueryUploadFilesArgs = {
  filters?: InputMaybe<UploadFileFiltersInput>
  pagination?: InputMaybe<PaginationArg>
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
}

export type QueryUploadFiles_ConnectionArgs = {
  filters?: InputMaybe<UploadFileFiltersInput>
  pagination?: InputMaybe<PaginationArg>
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
}

export type QueryUsersPermissionsRoleArgs = {
  documentId: Scalars['ID']['input']
}

export type QueryUsersPermissionsRolesArgs = {
  filters?: InputMaybe<UsersPermissionsRoleFiltersInput>
  pagination?: InputMaybe<PaginationArg>
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
}

export type QueryUsersPermissionsRoles_ConnectionArgs = {
  filters?: InputMaybe<UsersPermissionsRoleFiltersInput>
  pagination?: InputMaybe<PaginationArg>
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
}

export type QueryUsersPermissionsUserArgs = {
  documentId: Scalars['ID']['input']
}

export type QueryUsersPermissionsUsersArgs = {
  filters?: InputMaybe<UsersPermissionsUserFiltersInput>
  pagination?: InputMaybe<PaginationArg>
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
}

export type QueryUsersPermissionsUsers_ConnectionArgs = {
  filters?: InputMaybe<UsersPermissionsUserFiltersInput>
  pagination?: InputMaybe<PaginationArg>
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
}

export type ReviewWorkflowsWorkflow = {
  __typename?: 'ReviewWorkflowsWorkflow'
  contentTypes: Scalars['JSON']['output']
  createdAt?: Maybe<Scalars['DateTime']['output']>
  documentId: Scalars['ID']['output']
  name: Scalars['String']['output']
  publishedAt?: Maybe<Scalars['DateTime']['output']>
  stageRequiredToPublish?: Maybe<ReviewWorkflowsWorkflowStage>
  stages: Array<Maybe<ReviewWorkflowsWorkflowStage>>
  stages_connection?: Maybe<ReviewWorkflowsWorkflowStageRelationResponseCollection>
  updatedAt?: Maybe<Scalars['DateTime']['output']>
}

export type ReviewWorkflowsWorkflowStagesArgs = {
  filters?: InputMaybe<ReviewWorkflowsWorkflowStageFiltersInput>
  pagination?: InputMaybe<PaginationArg>
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
}

export type ReviewWorkflowsWorkflowStages_ConnectionArgs = {
  filters?: InputMaybe<ReviewWorkflowsWorkflowStageFiltersInput>
  pagination?: InputMaybe<PaginationArg>
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
}

export type ReviewWorkflowsWorkflowEntityResponseCollection = {
  __typename?: 'ReviewWorkflowsWorkflowEntityResponseCollection'
  nodes: Array<ReviewWorkflowsWorkflow>
  pageInfo: Pagination
}

export type ReviewWorkflowsWorkflowFiltersInput = {
  and?: InputMaybe<Array<InputMaybe<ReviewWorkflowsWorkflowFiltersInput>>>
  contentTypes?: InputMaybe<JsonFilterInput>
  createdAt?: InputMaybe<DateTimeFilterInput>
  documentId?: InputMaybe<IdFilterInput>
  name?: InputMaybe<StringFilterInput>
  not?: InputMaybe<ReviewWorkflowsWorkflowFiltersInput>
  or?: InputMaybe<Array<InputMaybe<ReviewWorkflowsWorkflowFiltersInput>>>
  publishedAt?: InputMaybe<DateTimeFilterInput>
  stageRequiredToPublish?: InputMaybe<ReviewWorkflowsWorkflowStageFiltersInput>
  stages?: InputMaybe<ReviewWorkflowsWorkflowStageFiltersInput>
  updatedAt?: InputMaybe<DateTimeFilterInput>
}

export type ReviewWorkflowsWorkflowInput = {
  contentTypes?: InputMaybe<Scalars['JSON']['input']>
  name?: InputMaybe<Scalars['String']['input']>
  publishedAt?: InputMaybe<Scalars['DateTime']['input']>
  stageRequiredToPublish?: InputMaybe<Scalars['ID']['input']>
  stages?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>
}

export type ReviewWorkflowsWorkflowStage = {
  __typename?: 'ReviewWorkflowsWorkflowStage'
  color?: Maybe<Scalars['String']['output']>
  createdAt?: Maybe<Scalars['DateTime']['output']>
  documentId: Scalars['ID']['output']
  name?: Maybe<Scalars['String']['output']>
  publishedAt?: Maybe<Scalars['DateTime']['output']>
  updatedAt?: Maybe<Scalars['DateTime']['output']>
  workflow?: Maybe<ReviewWorkflowsWorkflow>
}

export type ReviewWorkflowsWorkflowStageEntityResponseCollection = {
  __typename?: 'ReviewWorkflowsWorkflowStageEntityResponseCollection'
  nodes: Array<ReviewWorkflowsWorkflowStage>
  pageInfo: Pagination
}

export type ReviewWorkflowsWorkflowStageFiltersInput = {
  and?: InputMaybe<Array<InputMaybe<ReviewWorkflowsWorkflowStageFiltersInput>>>
  color?: InputMaybe<StringFilterInput>
  createdAt?: InputMaybe<DateTimeFilterInput>
  documentId?: InputMaybe<IdFilterInput>
  name?: InputMaybe<StringFilterInput>
  not?: InputMaybe<ReviewWorkflowsWorkflowStageFiltersInput>
  or?: InputMaybe<Array<InputMaybe<ReviewWorkflowsWorkflowStageFiltersInput>>>
  publishedAt?: InputMaybe<DateTimeFilterInput>
  updatedAt?: InputMaybe<DateTimeFilterInput>
  workflow?: InputMaybe<ReviewWorkflowsWorkflowFiltersInput>
}

export type ReviewWorkflowsWorkflowStageInput = {
  color?: InputMaybe<Scalars['String']['input']>
  name?: InputMaybe<Scalars['String']['input']>
  publishedAt?: InputMaybe<Scalars['DateTime']['input']>
  workflow?: InputMaybe<Scalars['ID']['input']>
}

export type ReviewWorkflowsWorkflowStageRelationResponseCollection = {
  __typename?: 'ReviewWorkflowsWorkflowStageRelationResponseCollection'
  nodes: Array<ReviewWorkflowsWorkflowStage>
}

export type StringFilterInput = {
  and?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  between?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  contains?: InputMaybe<Scalars['String']['input']>
  containsi?: InputMaybe<Scalars['String']['input']>
  endsWith?: InputMaybe<Scalars['String']['input']>
  eq?: InputMaybe<Scalars['String']['input']>
  eqi?: InputMaybe<Scalars['String']['input']>
  gt?: InputMaybe<Scalars['String']['input']>
  gte?: InputMaybe<Scalars['String']['input']>
  in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  lt?: InputMaybe<Scalars['String']['input']>
  lte?: InputMaybe<Scalars['String']['input']>
  ne?: InputMaybe<Scalars['String']['input']>
  nei?: InputMaybe<Scalars['String']['input']>
  not?: InputMaybe<StringFilterInput>
  notContains?: InputMaybe<Scalars['String']['input']>
  notContainsi?: InputMaybe<Scalars['String']['input']>
  notIn?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  notNull?: InputMaybe<Scalars['Boolean']['input']>
  null?: InputMaybe<Scalars['Boolean']['input']>
  or?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  startsWith?: InputMaybe<Scalars['String']['input']>
}

export type Tax = {
  __typename?: 'Tax'
  accountCommunicationConsentText: Scalars['String']['output']
  channelChangeEffectiveNextYearText?: Maybe<Scalars['String']['output']>
  channelChangeEffectiveNextYearTitle?: Maybe<Scalars['String']['output']>
  createdAt?: Maybe<Scalars['DateTime']['output']>
  documentId: Scalars['ID']['output']
  feedbackLinkDzn?: Maybe<Scalars['String']['output']>
  feedbackLinkKo?: Maybe<Scalars['String']['output']>
  paymentAlertText?: Maybe<Scalars['String']['output']>
  publishedAt?: Maybe<Scalars['DateTime']['output']>
  updatedAt?: Maybe<Scalars['DateTime']['output']>
}

export type TaxInput = {
  accountCommunicationConsentText?: InputMaybe<Scalars['String']['input']>
  channelChangeEffectiveNextYearText?: InputMaybe<Scalars['String']['input']>
  channelChangeEffectiveNextYearTitle?: InputMaybe<Scalars['String']['input']>
  feedbackLinkDzn?: InputMaybe<Scalars['String']['input']>
  feedbackLinkKo?: InputMaybe<Scalars['String']['input']>
  paymentAlertText?: InputMaybe<Scalars['String']['input']>
  publishedAt?: InputMaybe<Scalars['DateTime']['input']>
}

export type UploadFile = {
  __typename?: 'UploadFile'
  alternativeText?: Maybe<Scalars['String']['output']>
  caption?: Maybe<Scalars['String']['output']>
  createdAt?: Maybe<Scalars['DateTime']['output']>
  documentId: Scalars['ID']['output']
  ext?: Maybe<Scalars['String']['output']>
  focalPoint?: Maybe<Scalars['JSON']['output']>
  formats?: Maybe<Scalars['JSON']['output']>
  hash: Scalars['String']['output']
  height?: Maybe<Scalars['Int']['output']>
  mime: Scalars['String']['output']
  name: Scalars['String']['output']
  previewUrl?: Maybe<Scalars['String']['output']>
  provider: Scalars['String']['output']
  provider_metadata?: Maybe<Scalars['JSON']['output']>
  publishedAt?: Maybe<Scalars['DateTime']['output']>
  related?: Maybe<Array<Maybe<GenericMorph>>>
  size: Scalars['Float']['output']
  updatedAt?: Maybe<Scalars['DateTime']['output']>
  url: Scalars['String']['output']
  width?: Maybe<Scalars['Int']['output']>
}

export type UploadFileEntityResponseCollection = {
  __typename?: 'UploadFileEntityResponseCollection'
  nodes: Array<UploadFile>
  pageInfo: Pagination
}

export type UploadFileFiltersInput = {
  alternativeText?: InputMaybe<StringFilterInput>
  and?: InputMaybe<Array<InputMaybe<UploadFileFiltersInput>>>
  caption?: InputMaybe<StringFilterInput>
  createdAt?: InputMaybe<DateTimeFilterInput>
  documentId?: InputMaybe<IdFilterInput>
  ext?: InputMaybe<StringFilterInput>
  focalPoint?: InputMaybe<JsonFilterInput>
  formats?: InputMaybe<JsonFilterInput>
  hash?: InputMaybe<StringFilterInput>
  height?: InputMaybe<IntFilterInput>
  mime?: InputMaybe<StringFilterInput>
  name?: InputMaybe<StringFilterInput>
  not?: InputMaybe<UploadFileFiltersInput>
  or?: InputMaybe<Array<InputMaybe<UploadFileFiltersInput>>>
  previewUrl?: InputMaybe<StringFilterInput>
  provider?: InputMaybe<StringFilterInput>
  provider_metadata?: InputMaybe<JsonFilterInput>
  publishedAt?: InputMaybe<DateTimeFilterInput>
  size?: InputMaybe<FloatFilterInput>
  updatedAt?: InputMaybe<DateTimeFilterInput>
  url?: InputMaybe<StringFilterInput>
  width?: InputMaybe<IntFilterInput>
}

export type UsersPermissionsCreateRolePayload = {
  __typename?: 'UsersPermissionsCreateRolePayload'
  ok: Scalars['Boolean']['output']
}

export type UsersPermissionsDeleteRolePayload = {
  __typename?: 'UsersPermissionsDeleteRolePayload'
  ok: Scalars['Boolean']['output']
}

export type UsersPermissionsLoginInput = {
  identifier: Scalars['String']['input']
  password: Scalars['String']['input']
  provider?: Scalars['String']['input']
}

export type UsersPermissionsLoginPayload = {
  __typename?: 'UsersPermissionsLoginPayload'
  jwt?: Maybe<Scalars['String']['output']>
  user: UsersPermissionsMe
}

export type UsersPermissionsMe = {
  __typename?: 'UsersPermissionsMe'
  blocked?: Maybe<Scalars['Boolean']['output']>
  confirmed?: Maybe<Scalars['Boolean']['output']>
  documentId: Scalars['ID']['output']
  email?: Maybe<Scalars['String']['output']>
  id: Scalars['ID']['output']
  role?: Maybe<UsersPermissionsMeRole>
  username: Scalars['String']['output']
}

export type UsersPermissionsMeRole = {
  __typename?: 'UsersPermissionsMeRole'
  description?: Maybe<Scalars['String']['output']>
  id: Scalars['ID']['output']
  name: Scalars['String']['output']
  type?: Maybe<Scalars['String']['output']>
}

export type UsersPermissionsPasswordPayload = {
  __typename?: 'UsersPermissionsPasswordPayload'
  ok: Scalars['Boolean']['output']
}

export type UsersPermissionsPermission = {
  __typename?: 'UsersPermissionsPermission'
  action: Scalars['String']['output']
  createdAt?: Maybe<Scalars['DateTime']['output']>
  documentId: Scalars['ID']['output']
  publishedAt?: Maybe<Scalars['DateTime']['output']>
  role?: Maybe<UsersPermissionsRole>
  updatedAt?: Maybe<Scalars['DateTime']['output']>
}

export type UsersPermissionsPermissionFiltersInput = {
  action?: InputMaybe<StringFilterInput>
  and?: InputMaybe<Array<InputMaybe<UsersPermissionsPermissionFiltersInput>>>
  createdAt?: InputMaybe<DateTimeFilterInput>
  documentId?: InputMaybe<IdFilterInput>
  not?: InputMaybe<UsersPermissionsPermissionFiltersInput>
  or?: InputMaybe<Array<InputMaybe<UsersPermissionsPermissionFiltersInput>>>
  publishedAt?: InputMaybe<DateTimeFilterInput>
  role?: InputMaybe<UsersPermissionsRoleFiltersInput>
  updatedAt?: InputMaybe<DateTimeFilterInput>
}

export type UsersPermissionsPermissionRelationResponseCollection = {
  __typename?: 'UsersPermissionsPermissionRelationResponseCollection'
  nodes: Array<UsersPermissionsPermission>
}

export type UsersPermissionsRegisterInput = {
  email: Scalars['String']['input']
  password: Scalars['String']['input']
  username: Scalars['String']['input']
}

export type UsersPermissionsRole = {
  __typename?: 'UsersPermissionsRole'
  createdAt?: Maybe<Scalars['DateTime']['output']>
  description?: Maybe<Scalars['String']['output']>
  documentId: Scalars['ID']['output']
  name: Scalars['String']['output']
  permissions: Array<Maybe<UsersPermissionsPermission>>
  permissions_connection?: Maybe<UsersPermissionsPermissionRelationResponseCollection>
  publishedAt?: Maybe<Scalars['DateTime']['output']>
  type?: Maybe<Scalars['String']['output']>
  updatedAt?: Maybe<Scalars['DateTime']['output']>
  users: Array<Maybe<UsersPermissionsUser>>
  users_connection?: Maybe<UsersPermissionsUserRelationResponseCollection>
}

export type UsersPermissionsRolePermissionsArgs = {
  filters?: InputMaybe<UsersPermissionsPermissionFiltersInput>
  pagination?: InputMaybe<PaginationArg>
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
}

export type UsersPermissionsRolePermissions_ConnectionArgs = {
  filters?: InputMaybe<UsersPermissionsPermissionFiltersInput>
  pagination?: InputMaybe<PaginationArg>
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
}

export type UsersPermissionsRoleUsersArgs = {
  filters?: InputMaybe<UsersPermissionsUserFiltersInput>
  pagination?: InputMaybe<PaginationArg>
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
}

export type UsersPermissionsRoleUsers_ConnectionArgs = {
  filters?: InputMaybe<UsersPermissionsUserFiltersInput>
  pagination?: InputMaybe<PaginationArg>
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
}

export type UsersPermissionsRoleEntityResponseCollection = {
  __typename?: 'UsersPermissionsRoleEntityResponseCollection'
  nodes: Array<UsersPermissionsRole>
  pageInfo: Pagination
}

export type UsersPermissionsRoleFiltersInput = {
  and?: InputMaybe<Array<InputMaybe<UsersPermissionsRoleFiltersInput>>>
  createdAt?: InputMaybe<DateTimeFilterInput>
  description?: InputMaybe<StringFilterInput>
  documentId?: InputMaybe<IdFilterInput>
  name?: InputMaybe<StringFilterInput>
  not?: InputMaybe<UsersPermissionsRoleFiltersInput>
  or?: InputMaybe<Array<InputMaybe<UsersPermissionsRoleFiltersInput>>>
  permissions?: InputMaybe<UsersPermissionsPermissionFiltersInput>
  publishedAt?: InputMaybe<DateTimeFilterInput>
  type?: InputMaybe<StringFilterInput>
  updatedAt?: InputMaybe<DateTimeFilterInput>
  users?: InputMaybe<UsersPermissionsUserFiltersInput>
}

export type UsersPermissionsRoleInput = {
  description?: InputMaybe<Scalars['String']['input']>
  name?: InputMaybe<Scalars['String']['input']>
  permissions?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>
  publishedAt?: InputMaybe<Scalars['DateTime']['input']>
  type?: InputMaybe<Scalars['String']['input']>
  users?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>
}

export type UsersPermissionsUpdateRolePayload = {
  __typename?: 'UsersPermissionsUpdateRolePayload'
  ok: Scalars['Boolean']['output']
}

export type UsersPermissionsUser = {
  __typename?: 'UsersPermissionsUser'
  blocked?: Maybe<Scalars['Boolean']['output']>
  confirmed?: Maybe<Scalars['Boolean']['output']>
  createdAt?: Maybe<Scalars['DateTime']['output']>
  documentId: Scalars['ID']['output']
  email: Scalars['String']['output']
  provider?: Maybe<Scalars['String']['output']>
  publishedAt?: Maybe<Scalars['DateTime']['output']>
  role?: Maybe<UsersPermissionsRole>
  updatedAt?: Maybe<Scalars['DateTime']['output']>
  username: Scalars['String']['output']
}

export type UsersPermissionsUserEntityResponse = {
  __typename?: 'UsersPermissionsUserEntityResponse'
  data?: Maybe<UsersPermissionsUser>
}

export type UsersPermissionsUserEntityResponseCollection = {
  __typename?: 'UsersPermissionsUserEntityResponseCollection'
  nodes: Array<UsersPermissionsUser>
  pageInfo: Pagination
}

export type UsersPermissionsUserFiltersInput = {
  and?: InputMaybe<Array<InputMaybe<UsersPermissionsUserFiltersInput>>>
  blocked?: InputMaybe<BooleanFilterInput>
  confirmed?: InputMaybe<BooleanFilterInput>
  createdAt?: InputMaybe<DateTimeFilterInput>
  documentId?: InputMaybe<IdFilterInput>
  email?: InputMaybe<StringFilterInput>
  not?: InputMaybe<UsersPermissionsUserFiltersInput>
  or?: InputMaybe<Array<InputMaybe<UsersPermissionsUserFiltersInput>>>
  provider?: InputMaybe<StringFilterInput>
  publishedAt?: InputMaybe<DateTimeFilterInput>
  role?: InputMaybe<UsersPermissionsRoleFiltersInput>
  updatedAt?: InputMaybe<DateTimeFilterInput>
  username?: InputMaybe<StringFilterInput>
}

export type UsersPermissionsUserInput = {
  blocked?: InputMaybe<Scalars['Boolean']['input']>
  confirmed?: InputMaybe<Scalars['Boolean']['input']>
  email?: InputMaybe<Scalars['String']['input']>
  password?: InputMaybe<Scalars['String']['input']>
  provider?: InputMaybe<Scalars['String']['input']>
  publishedAt?: InputMaybe<Scalars['DateTime']['input']>
  role?: InputMaybe<Scalars['ID']['input']>
  username?: InputMaybe<Scalars['String']['input']>
}

export type UsersPermissionsUserRelationResponseCollection = {
  __typename?: 'UsersPermissionsUserRelationResponseCollection'
  nodes: Array<UsersPermissionsUser>
}

export type AlertFragment = {
  __typename?: 'ComponentGeneralAlert'
  id: string
  content: string
  dateFrom?: any | null
  dateTo?: any | null
}

export type AlertsQueryVariables = Exact<{ [key: string]: never }>

export type AlertsQuery = {
  __typename?: 'Query'
  general?: {
    __typename?: 'General'
    alerts?: Array<{
      __typename?: 'ComponentGeneralAlert'
      id: string
      content: string
      dateFrom?: any | null
      dateTo?: any | null
    } | null> | null
  } | null
}

export type FormLandingPageLinkCtaFragment = {
  __typename: 'ComponentBlocksFormLandingPageLinkCta'
  id: string
  title: string
  text?: string | null
  buttonLabel: string
  url: string
}

export type FormLandingPageFormCtaFragment = {
  __typename: 'ComponentBlocksFormLandingPageFormCta'
  title: string
  text?: string | null
  buttonLabel: string
}

export type FormLandingPageFragment = {
  __typename?: 'ComponentBlocksFormLandingPage'
  text?: string | null
  linkCtas?: Array<{
    __typename: 'ComponentBlocksFormLandingPageLinkCta'
    id: string
    title: string
    text?: string | null
    buttonLabel: string
    url: string
  } | null> | null
  formCta: {
    __typename: 'ComponentBlocksFormLandingPageFormCta'
    title: string
    text?: string | null
    buttonLabel: string
  }
}

export type FormBaseFragment = {
  __typename?: 'Form'
  slug: string
  moreInformationUrl?: string | null
}

export type FormWithLandingPageFragment = {
  __typename?: 'Form'
  slug: string
  moreInformationUrl?: string | null
  landingPage?: {
    __typename?: 'ComponentBlocksFormLandingPage'
    text?: string | null
    linkCtas?: Array<{
      __typename: 'ComponentBlocksFormLandingPageLinkCta'
      id: string
      title: string
      text?: string | null
      buttonLabel: string
      url: string
    } | null> | null
    formCta: {
      __typename: 'ComponentBlocksFormLandingPageFormCta'
      title: string
      text?: string | null
      buttonLabel: string
    }
  } | null
}

export type FormBaseBySlugQueryVariables = Exact<{
  slug: Scalars['String']['input']
}>

export type FormBaseBySlugQuery = {
  __typename?: 'Query'
  forms: Array<{
    __typename?: 'Form'
    documentId: string
    slug: string
    moreInformationUrl?: string | null
  } | null>
}

export type FormWithLandingPageBySlugQueryVariables = Exact<{
  slug: Scalars['String']['input']
}>

export type FormWithLandingPageBySlugQuery = {
  __typename?: 'Query'
  forms: Array<{
    __typename?: 'Form'
    documentId: string
    slug: string
    moreInformationUrl?: string | null
    landingPage?: {
      __typename?: 'ComponentBlocksFormLandingPage'
      text?: string | null
      linkCtas?: Array<{
        __typename: 'ComponentBlocksFormLandingPageLinkCta'
        id: string
        title: string
        text?: string | null
        buttonLabel: string
        url: string
      } | null> | null
      formCta: {
        __typename: 'ComponentBlocksFormLandingPageFormCta'
        title: string
        text?: string | null
        buttonLabel: string
      }
    } | null
  } | null>
}

export type HelpItemFragment = {
  __typename?: 'ComponentBlocksHelpItem'
  id: string
  title: string
  content: string
}

export type HelpCategoryFragment = {
  __typename?: 'ComponentBlocksHelpCategory'
  id: string
  title: string
  items: Array<{
    __typename?: 'ComponentBlocksHelpItem'
    id: string
    title: string
    content: string
  } | null>
}

export type HelpPageFragment = {
  __typename?: 'HelpPage'
  categories: Array<{
    __typename?: 'ComponentBlocksHelpCategory'
    id: string
    title: string
    items: Array<{
      __typename?: 'ComponentBlocksHelpItem'
      id: string
      title: string
      content: string
    } | null>
  } | null>
}

export type HelpPageQueryVariables = Exact<{ [key: string]: never }>

export type HelpPageQuery = {
  __typename?: 'Query'
  helpPage?: {
    __typename?: 'HelpPage'
    categories: Array<{
      __typename?: 'ComponentBlocksHelpCategory'
      id: string
      title: string
      items: Array<{
        __typename?: 'ComponentBlocksHelpItem'
        id: string
        title: string
        content: string
      } | null>
    } | null>
  } | null
}

export type HomepageQueryVariables = Exact<{ [key: string]: never }>

export type HomepageQuery = {
  __typename?: 'Query'
  homepage?: {
    __typename?: 'Homepage'
    services: Array<{
      __typename?: 'MunicipalService'
      documentId: string
      title: string
      description: string
      buttonText: string
      href: string
      color: Enum_Municipalservice_Color
      icon: Enum_Municipalservice_Icon
      tags: Array<{ __typename?: 'MunicipalServiceTag'; documentId: string; title: string } | null>
    } | null>
    servicesLegalPerson: Array<{
      __typename?: 'MunicipalService'
      documentId: string
      title: string
      description: string
      buttonText: string
      href: string
      color: Enum_Municipalservice_Color
      icon: Enum_Municipalservice_Icon
      tags: Array<{ __typename?: 'MunicipalServiceTag'; documentId: string; title: string } | null>
    } | null>
    announcements: Array<{
      __typename?: 'HomepageAnnouncement'
      documentId: string
      title: string
      description: string
      buttonText: string
      href: string
      dateFrom?: any | null
      dateTo?: any | null
      image: { __typename?: 'UploadFile'; url: string; alternativeText?: string | null }
    } | null>
    announcementsLegalPerson: Array<{
      __typename?: 'HomepageAnnouncement'
      documentId: string
      title: string
      description: string
      buttonText: string
      href: string
      dateFrom?: any | null
      dateTo?: any | null
      image: { __typename?: 'UploadFile'; url: string; alternativeText?: string | null }
    } | null>
  } | null
}

export type HomepageAnnouncementEntityFragment = {
  __typename?: 'HomepageAnnouncement'
  documentId: string
  title: string
  description: string
  buttonText: string
  href: string
  dateFrom?: any | null
  dateTo?: any | null
  image: { __typename?: 'UploadFile'; url: string; alternativeText?: string | null }
}

export type MunicipalServiceTagEntityFragment = {
  __typename?: 'MunicipalServiceTag'
  documentId: string
  title: string
}

export type MunicipalServiceCategoryEntityFragment = {
  __typename?: 'MunicipalServiceCategory'
  documentId: string
  title: string
}

export type MunicipalServiceCardEntityFragment = {
  __typename?: 'MunicipalService'
  documentId: string
  title: string
  description: string
  buttonText: string
  href: string
  color: Enum_Municipalservice_Color
  icon: Enum_Municipalservice_Icon
  tags: Array<{ __typename?: 'MunicipalServiceTag'; documentId: string; title: string } | null>
}

export type MunicipalServiceEntityFragment = {
  __typename?: 'MunicipalService'
  documentId: string
  title: string
  description: string
  buttonText: string
  href: string
  color: Enum_Municipalservice_Color
  icon: Enum_Municipalservice_Icon
  categories: Array<{
    __typename?: 'MunicipalServiceCategory'
    documentId: string
    title: string
  } | null>
  tags: Array<{ __typename?: 'MunicipalServiceTag'; documentId: string; title: string } | null>
}

export type MunicipalServicesPageQueryVariables = Exact<{ [key: string]: never }>

export type MunicipalServicesPageQuery = {
  __typename?: 'Query'
  municipalServicesPage?: {
    __typename?: 'MunicipalServicesPage'
    services: Array<{
      __typename?: 'MunicipalService'
      documentId: string
      title: string
      description: string
      buttonText: string
      href: string
      color: Enum_Municipalservice_Color
      icon: Enum_Municipalservice_Icon
      categories: Array<{
        __typename?: 'MunicipalServiceCategory'
        documentId: string
        title: string
      } | null>
      tags: Array<{ __typename?: 'MunicipalServiceTag'; documentId: string; title: string } | null>
    } | null>
    servicesLegalPerson: Array<{
      __typename?: 'MunicipalService'
      documentId: string
      title: string
      description: string
      buttonText: string
      href: string
      color: Enum_Municipalservice_Color
      icon: Enum_Municipalservice_Icon
      categories: Array<{
        __typename?: 'MunicipalServiceCategory'
        documentId: string
        title: string
      } | null>
      tags: Array<{ __typename?: 'MunicipalServiceTag'; documentId: string; title: string } | null>
    } | null>
  } | null
}

export type TaxFragment = {
  __typename?: 'Tax'
  documentId: string
  accountCommunicationConsentText: string
  channelChangeEffectiveNextYearText?: string | null
  channelChangeEffectiveNextYearTitle?: string | null
  feedbackLinkDzn?: string | null
  feedbackLinkKo?: string | null
}

export type TaxQueryVariables = Exact<{ [key: string]: never }>

export type TaxQuery = {
  __typename?: 'Query'
  tax?: {
    __typename?: 'Tax'
    documentId: string
    accountCommunicationConsentText: string
    channelChangeEffectiveNextYearText?: string | null
    channelChangeEffectiveNextYearTitle?: string | null
    feedbackLinkDzn?: string | null
    feedbackLinkKo?: string | null
  } | null
}

export const AlertFragmentDoc = gql`
  fragment Alert on ComponentGeneralAlert {
    id
    content
    dateFrom
    dateTo
  }
`
export const FormBaseFragmentDoc = gql`
  fragment FormBase on Form {
    slug
    moreInformationUrl
  }
`
export const FormLandingPageLinkCtaFragmentDoc = gql`
  fragment FormLandingPageLinkCta on ComponentBlocksFormLandingPageLinkCta {
    __typename
    id
    title
    text
    buttonLabel
    url
  }
`
export const FormLandingPageFormCtaFragmentDoc = gql`
  fragment FormLandingPageFormCta on ComponentBlocksFormLandingPageFormCta {
    __typename
    title
    text
    buttonLabel
  }
`
export const FormLandingPageFragmentDoc = gql`
  fragment FormLandingPage on ComponentBlocksFormLandingPage {
    text
    linkCtas {
      ...FormLandingPageLinkCta
    }
    formCta {
      ...FormLandingPageFormCta
    }
  }
  ${FormLandingPageLinkCtaFragmentDoc}
  ${FormLandingPageFormCtaFragmentDoc}
`
export const FormWithLandingPageFragmentDoc = gql`
  fragment FormWithLandingPage on Form {
    ...FormBase
    landingPage {
      ...FormLandingPage
    }
  }
  ${FormBaseFragmentDoc}
  ${FormLandingPageFragmentDoc}
`
export const HelpItemFragmentDoc = gql`
  fragment HelpItem on ComponentBlocksHelpItem {
    id
    title
    content
  }
`
export const HelpCategoryFragmentDoc = gql`
  fragment HelpCategory on ComponentBlocksHelpCategory {
    id
    title
    items {
      ...HelpItem
    }
  }
  ${HelpItemFragmentDoc}
`
export const HelpPageFragmentDoc = gql`
  fragment HelpPage on HelpPage {
    categories {
      ...HelpCategory
    }
  }
  ${HelpCategoryFragmentDoc}
`
export const HomepageAnnouncementEntityFragmentDoc = gql`
  fragment HomepageAnnouncementEntity on HomepageAnnouncement {
    documentId
    title
    description
    buttonText
    href
    dateFrom
    dateTo
    image {
      url
      alternativeText
    }
  }
`
export const MunicipalServiceTagEntityFragmentDoc = gql`
  fragment MunicipalServiceTagEntity on MunicipalServiceTag {
    documentId
    title
  }
`
export const MunicipalServiceCardEntityFragmentDoc = gql`
  fragment MunicipalServiceCardEntity on MunicipalService {
    documentId
    title
    description
    buttonText
    href
    color
    icon
    tags {
      ...MunicipalServiceTagEntity
    }
  }
  ${MunicipalServiceTagEntityFragmentDoc}
`
export const MunicipalServiceCategoryEntityFragmentDoc = gql`
  fragment MunicipalServiceCategoryEntity on MunicipalServiceCategory {
    documentId
    title
  }
`
export const MunicipalServiceEntityFragmentDoc = gql`
  fragment MunicipalServiceEntity on MunicipalService {
    ...MunicipalServiceCardEntity
    categories {
      ...MunicipalServiceCategoryEntity
    }
  }
  ${MunicipalServiceCardEntityFragmentDoc}
  ${MunicipalServiceCategoryEntityFragmentDoc}
`
export const TaxFragmentDoc = gql`
  fragment Tax on Tax {
    documentId
    accountCommunicationConsentText
    channelChangeEffectiveNextYearText
    channelChangeEffectiveNextYearTitle
    feedbackLinkDzn
    feedbackLinkKo
  }
`
export const AlertsDocument = gql`
  query Alerts {
    general {
      alerts {
        ...Alert
      }
    }
  }
  ${AlertFragmentDoc}
`
export const FormBaseBySlugDocument = gql`
  query FormBaseBySlug($slug: String!) {
    forms(filters: { slug: { eq: $slug } }) {
      documentId
      ...FormBase
    }
  }
  ${FormBaseFragmentDoc}
`
export const FormWithLandingPageBySlugDocument = gql`
  query FormWithLandingPageBySlug($slug: String!) {
    forms(filters: { slug: { eq: $slug } }) {
      documentId
      ...FormWithLandingPage
    }
  }
  ${FormWithLandingPageFragmentDoc}
`
export const HelpPageDocument = gql`
  query HelpPage {
    helpPage {
      ...HelpPage
    }
  }
  ${HelpPageFragmentDoc}
`
export const HomepageDocument = gql`
  query Homepage {
    homepage {
      services(pagination: { limit: 4 }) {
        ...MunicipalServiceCardEntity
      }
      servicesLegalPerson(pagination: { limit: 4 }) {
        ...MunicipalServiceCardEntity
      }
      announcements {
        ...HomepageAnnouncementEntity
      }
      announcementsLegalPerson {
        ...HomepageAnnouncementEntity
      }
    }
  }
  ${MunicipalServiceCardEntityFragmentDoc}
  ${HomepageAnnouncementEntityFragmentDoc}
`
export const MunicipalServicesPageDocument = gql`
  query MunicipalServicesPage {
    municipalServicesPage {
      services {
        ...MunicipalServiceEntity
      }
      servicesLegalPerson {
        ...MunicipalServiceEntity
      }
    }
  }
  ${MunicipalServiceEntityFragmentDoc}
`
export const TaxDocument = gql`
  query Tax {
    tax {
      ...Tax
    }
  }
  ${TaxFragmentDoc}
`

export type SdkFunctionWrapper = <T>(
  action: (requestHeaders?: Record<string, string>) => Promise<T>,
  operationName: string,
  operationType?: string,
  variables?: any,
) => Promise<T>

const defaultWrapper: SdkFunctionWrapper = (action, _operationName, _operationType, _variables) =>
  action()

export function getSdk(client: GraphQLClient, withWrapper: SdkFunctionWrapper = defaultWrapper) {
  return {
    Alerts(
      variables?: AlertsQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit['signal'],
    ): Promise<AlertsQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<AlertsQuery>({
            document: AlertsDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        'Alerts',
        'query',
        variables,
      )
    },
    FormBaseBySlug(
      variables: FormBaseBySlugQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit['signal'],
    ): Promise<FormBaseBySlugQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<FormBaseBySlugQuery>({
            document: FormBaseBySlugDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        'FormBaseBySlug',
        'query',
        variables,
      )
    },
    FormWithLandingPageBySlug(
      variables: FormWithLandingPageBySlugQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit['signal'],
    ): Promise<FormWithLandingPageBySlugQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<FormWithLandingPageBySlugQuery>({
            document: FormWithLandingPageBySlugDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        'FormWithLandingPageBySlug',
        'query',
        variables,
      )
    },
    HelpPage(
      variables?: HelpPageQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit['signal'],
    ): Promise<HelpPageQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<HelpPageQuery>({
            document: HelpPageDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        'HelpPage',
        'query',
        variables,
      )
    },
    Homepage(
      variables?: HomepageQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit['signal'],
    ): Promise<HomepageQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<HomepageQuery>({
            document: HomepageDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        'Homepage',
        'query',
        variables,
      )
    },
    MunicipalServicesPage(
      variables?: MunicipalServicesPageQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit['signal'],
    ): Promise<MunicipalServicesPageQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<MunicipalServicesPageQuery>({
            document: MunicipalServicesPageDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        'MunicipalServicesPage',
        'query',
        variables,
      )
    },
    Tax(
      variables?: TaxQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit['signal'],
    ): Promise<TaxQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<TaxQuery>({
            document: TaxDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        'Tax',
        'query',
        variables,
      )
    },
  }
}
export type Sdk = ReturnType<typeof getSdk>

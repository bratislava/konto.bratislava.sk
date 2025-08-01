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
  /** A date string, such as 2007-12-03, compliant with the `full-date` format outlined in section 5.6 of the RFC 3339 profile of the ISO 8601 standard for representation of dates and times using the Gregorian calendar. */
  Date: { input: any; output: any }
  /** A date-time string at UTC, such as 2007-12-03T10:15:30Z, compliant with the `date-time` format outlined in section 5.6 of the RFC 3339 profile of the ISO 8601 standard for representation of dates and times using the Gregorian calendar. */
  DateTime: { input: any; output: any }
  /** A string used to identify an i18n locale */
  I18NLocaleCode: { input: any; output: any }
  /** The `JSON` scalar type represents JSON values as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
  JSON: { input: any; output: any }
  /** The `BigInt` scalar type represents non-fractional signed whole numeric values. */
  Long: { input: any; output: any }
  /** A time string with format HH:mm:ss.SSS */
  Time: { input: any; output: any }
  /** The `Upload` scalar type represents a file upload. */
  Upload: { input: any; output: any }
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

export type ContentReleasesRelease = {
  __typename?: 'ContentReleasesRelease'
  actions?: Maybe<ContentReleasesReleaseActionRelationResponseCollection>
  createdAt?: Maybe<Scalars['DateTime']['output']>
  name: Scalars['String']['output']
  releasedAt?: Maybe<Scalars['DateTime']['output']>
  scheduledAt?: Maybe<Scalars['DateTime']['output']>
  timezone?: Maybe<Scalars['String']['output']>
  updatedAt?: Maybe<Scalars['DateTime']['output']>
}

export type ContentReleasesReleaseActionsArgs = {
  filters?: InputMaybe<ContentReleasesReleaseActionFiltersInput>
  pagination?: InputMaybe<PaginationArg>
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
}

export type ContentReleasesReleaseAction = {
  __typename?: 'ContentReleasesReleaseAction'
  contentType: Scalars['String']['output']
  createdAt?: Maybe<Scalars['DateTime']['output']>
  entry?: Maybe<GenericMorph>
  locale?: Maybe<Scalars['String']['output']>
  release?: Maybe<ContentReleasesReleaseEntityResponse>
  type: Enum_Contentreleasesreleaseaction_Type
  updatedAt?: Maybe<Scalars['DateTime']['output']>
}

export type ContentReleasesReleaseActionEntity = {
  __typename?: 'ContentReleasesReleaseActionEntity'
  attributes?: Maybe<ContentReleasesReleaseAction>
  id?: Maybe<Scalars['ID']['output']>
}

export type ContentReleasesReleaseActionEntityResponse = {
  __typename?: 'ContentReleasesReleaseActionEntityResponse'
  data?: Maybe<ContentReleasesReleaseActionEntity>
}

export type ContentReleasesReleaseActionEntityResponseCollection = {
  __typename?: 'ContentReleasesReleaseActionEntityResponseCollection'
  data: Array<ContentReleasesReleaseActionEntity>
  meta: ResponseCollectionMeta
}

export type ContentReleasesReleaseActionFiltersInput = {
  and?: InputMaybe<Array<InputMaybe<ContentReleasesReleaseActionFiltersInput>>>
  contentType?: InputMaybe<StringFilterInput>
  createdAt?: InputMaybe<DateTimeFilterInput>
  id?: InputMaybe<IdFilterInput>
  locale?: InputMaybe<StringFilterInput>
  not?: InputMaybe<ContentReleasesReleaseActionFiltersInput>
  or?: InputMaybe<Array<InputMaybe<ContentReleasesReleaseActionFiltersInput>>>
  release?: InputMaybe<ContentReleasesReleaseFiltersInput>
  type?: InputMaybe<StringFilterInput>
  updatedAt?: InputMaybe<DateTimeFilterInput>
}

export type ContentReleasesReleaseActionInput = {
  contentType?: InputMaybe<Scalars['String']['input']>
  locale?: InputMaybe<Scalars['String']['input']>
  release?: InputMaybe<Scalars['ID']['input']>
  type?: InputMaybe<Enum_Contentreleasesreleaseaction_Type>
}

export type ContentReleasesReleaseActionRelationResponseCollection = {
  __typename?: 'ContentReleasesReleaseActionRelationResponseCollection'
  data: Array<ContentReleasesReleaseActionEntity>
}

export type ContentReleasesReleaseEntity = {
  __typename?: 'ContentReleasesReleaseEntity'
  attributes?: Maybe<ContentReleasesRelease>
  id?: Maybe<Scalars['ID']['output']>
}

export type ContentReleasesReleaseEntityResponse = {
  __typename?: 'ContentReleasesReleaseEntityResponse'
  data?: Maybe<ContentReleasesReleaseEntity>
}

export type ContentReleasesReleaseEntityResponseCollection = {
  __typename?: 'ContentReleasesReleaseEntityResponseCollection'
  data: Array<ContentReleasesReleaseEntity>
  meta: ResponseCollectionMeta
}

export type ContentReleasesReleaseFiltersInput = {
  actions?: InputMaybe<ContentReleasesReleaseActionFiltersInput>
  and?: InputMaybe<Array<InputMaybe<ContentReleasesReleaseFiltersInput>>>
  createdAt?: InputMaybe<DateTimeFilterInput>
  id?: InputMaybe<IdFilterInput>
  name?: InputMaybe<StringFilterInput>
  not?: InputMaybe<ContentReleasesReleaseFiltersInput>
  or?: InputMaybe<Array<InputMaybe<ContentReleasesReleaseFiltersInput>>>
  releasedAt?: InputMaybe<DateTimeFilterInput>
  scheduledAt?: InputMaybe<DateTimeFilterInput>
  timezone?: InputMaybe<StringFilterInput>
  updatedAt?: InputMaybe<DateTimeFilterInput>
}

export type ContentReleasesReleaseInput = {
  actions?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>
  name?: InputMaybe<Scalars['String']['input']>
  releasedAt?: InputMaybe<Scalars['DateTime']['input']>
  scheduledAt?: InputMaybe<Scalars['DateTime']['input']>
  timezone?: InputMaybe<Scalars['String']['input']>
}

export type ContentReleasesReleaseRelationResponseCollection = {
  __typename?: 'ContentReleasesReleaseRelationResponseCollection'
  data: Array<ContentReleasesReleaseEntity>
}

export type DateFilterInput = {
  and?: InputMaybe<Array<InputMaybe<Scalars['Date']['input']>>>
  between?: InputMaybe<Array<InputMaybe<Scalars['Date']['input']>>>
  contains?: InputMaybe<Scalars['Date']['input']>
  containsi?: InputMaybe<Scalars['Date']['input']>
  endsWith?: InputMaybe<Scalars['Date']['input']>
  eq?: InputMaybe<Scalars['Date']['input']>
  eqi?: InputMaybe<Scalars['Date']['input']>
  gt?: InputMaybe<Scalars['Date']['input']>
  gte?: InputMaybe<Scalars['Date']['input']>
  in?: InputMaybe<Array<InputMaybe<Scalars['Date']['input']>>>
  lt?: InputMaybe<Scalars['Date']['input']>
  lte?: InputMaybe<Scalars['Date']['input']>
  ne?: InputMaybe<Scalars['Date']['input']>
  nei?: InputMaybe<Scalars['Date']['input']>
  not?: InputMaybe<DateFilterInput>
  notContains?: InputMaybe<Scalars['Date']['input']>
  notContainsi?: InputMaybe<Scalars['Date']['input']>
  notIn?: InputMaybe<Array<InputMaybe<Scalars['Date']['input']>>>
  notNull?: InputMaybe<Scalars['Boolean']['input']>
  null?: InputMaybe<Scalars['Boolean']['input']>
  or?: InputMaybe<Array<InputMaybe<Scalars['Date']['input']>>>
  startsWith?: InputMaybe<Scalars['Date']['input']>
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

export enum Enum_Contentreleasesreleaseaction_Type {
  Publish = 'publish',
  Unpublish = 'unpublish',
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
  Security = 'security',
  SpatialPlanning = 'spatial_planning',
  SwimmingPool = 'swimming_pool',
  Taxes = 'taxes',
  Towing = 'towing',
  Transport = 'transport',
  Waste = 'waste',
  Zoo = 'zoo',
}

export type Error = {
  __typename?: 'Error'
  code: Scalars['String']['output']
  message?: Maybe<Scalars['String']['output']>
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
  landingPage?: Maybe<ComponentBlocksFormLandingPage>
  moreInformationUrl?: Maybe<Scalars['String']['output']>
  slug: Scalars['String']['output']
  updatedAt?: Maybe<Scalars['DateTime']['output']>
}

export type FormEntity = {
  __typename?: 'FormEntity'
  attributes?: Maybe<Form>
  id?: Maybe<Scalars['ID']['output']>
}

export type FormEntityResponse = {
  __typename?: 'FormEntityResponse'
  data?: Maybe<FormEntity>
}

export type FormEntityResponseCollection = {
  __typename?: 'FormEntityResponseCollection'
  data: Array<FormEntity>
  meta: ResponseCollectionMeta
}

export type FormFiltersInput = {
  and?: InputMaybe<Array<InputMaybe<FormFiltersInput>>>
  createdAt?: InputMaybe<DateTimeFilterInput>
  id?: InputMaybe<IdFilterInput>
  landingPage?: InputMaybe<ComponentBlocksFormLandingPageFiltersInput>
  moreInformationUrl?: InputMaybe<StringFilterInput>
  not?: InputMaybe<FormFiltersInput>
  or?: InputMaybe<Array<InputMaybe<FormFiltersInput>>>
  slug?: InputMaybe<StringFilterInput>
  updatedAt?: InputMaybe<DateTimeFilterInput>
}

export type FormInput = {
  landingPage?: InputMaybe<ComponentBlocksFormLandingPageInput>
  moreInformationUrl?: InputMaybe<Scalars['String']['input']>
  slug?: InputMaybe<Scalars['String']['input']>
}

export type FormRelationResponseCollection = {
  __typename?: 'FormRelationResponseCollection'
  data: Array<FormEntity>
}

export type General = {
  __typename?: 'General'
  alerts?: Maybe<Array<Maybe<ComponentGeneralAlert>>>
  createdAt?: Maybe<Scalars['DateTime']['output']>
  updatedAt?: Maybe<Scalars['DateTime']['output']>
}

export type GeneralAlertsArgs = {
  filters?: InputMaybe<ComponentGeneralAlertFiltersInput>
  pagination?: InputMaybe<PaginationArg>
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
}

export type GeneralEntity = {
  __typename?: 'GeneralEntity'
  attributes?: Maybe<General>
  id?: Maybe<Scalars['ID']['output']>
}

export type GeneralEntityResponse = {
  __typename?: 'GeneralEntityResponse'
  data?: Maybe<GeneralEntity>
}

export type GeneralEntityResponseCollection = {
  __typename?: 'GeneralEntityResponseCollection'
  data: Array<GeneralEntity>
  meta: ResponseCollectionMeta
}

export type GeneralFiltersInput = {
  alerts?: InputMaybe<ComponentGeneralAlertFiltersInput>
  and?: InputMaybe<Array<InputMaybe<GeneralFiltersInput>>>
  createdAt?: InputMaybe<DateTimeFilterInput>
  not?: InputMaybe<GeneralFiltersInput>
  or?: InputMaybe<Array<InputMaybe<GeneralFiltersInput>>>
  updatedAt?: InputMaybe<DateTimeFilterInput>
}

export type GeneralInput = {
  alerts?: InputMaybe<Array<InputMaybe<ComponentGeneralAlertInput>>>
}

export type GeneralRelationResponseCollection = {
  __typename?: 'GeneralRelationResponseCollection'
  data: Array<GeneralEntity>
}

export type GenericMorph =
  | ComponentBlocksFormLandingPage
  | ComponentBlocksFormLandingPageFormCta
  | ComponentBlocksFormLandingPageLinkCta
  | ComponentBlocksHelpCategory
  | ComponentBlocksHelpItem
  | ComponentGeneralAlert
  | ContentReleasesRelease
  | ContentReleasesReleaseAction
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
  | Tax
  | UploadFile
  | UploadFolder
  | UsersPermissionsPermission
  | UsersPermissionsRole
  | UsersPermissionsUser

export type HelpPage = {
  __typename?: 'HelpPage'
  categories: Array<Maybe<ComponentBlocksHelpCategory>>
  createdAt?: Maybe<Scalars['DateTime']['output']>
  updatedAt?: Maybe<Scalars['DateTime']['output']>
}

export type HelpPageCategoriesArgs = {
  filters?: InputMaybe<ComponentBlocksHelpCategoryFiltersInput>
  pagination?: InputMaybe<PaginationArg>
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
}

export type HelpPageEntity = {
  __typename?: 'HelpPageEntity'
  attributes?: Maybe<HelpPage>
  id?: Maybe<Scalars['ID']['output']>
}

export type HelpPageEntityResponse = {
  __typename?: 'HelpPageEntityResponse'
  data?: Maybe<HelpPageEntity>
}

export type HelpPageEntityResponseCollection = {
  __typename?: 'HelpPageEntityResponseCollection'
  data: Array<HelpPageEntity>
  meta: ResponseCollectionMeta
}

export type HelpPageFiltersInput = {
  and?: InputMaybe<Array<InputMaybe<HelpPageFiltersInput>>>
  categories?: InputMaybe<ComponentBlocksHelpCategoryFiltersInput>
  createdAt?: InputMaybe<DateTimeFilterInput>
  not?: InputMaybe<HelpPageFiltersInput>
  or?: InputMaybe<Array<InputMaybe<HelpPageFiltersInput>>>
  updatedAt?: InputMaybe<DateTimeFilterInput>
}

export type HelpPageInput = {
  categories?: InputMaybe<Array<InputMaybe<ComponentBlocksHelpCategoryInput>>>
}

export type HelpPageRelationResponseCollection = {
  __typename?: 'HelpPageRelationResponseCollection'
  data: Array<HelpPageEntity>
}

export type Homepage = {
  __typename?: 'Homepage'
  announcements?: Maybe<HomepageAnnouncementRelationResponseCollection>
  announcementsLegalPerson?: Maybe<HomepageAnnouncementRelationResponseCollection>
  createdAt?: Maybe<Scalars['DateTime']['output']>
  services?: Maybe<MunicipalServiceRelationResponseCollection>
  servicesLegalPerson?: Maybe<MunicipalServiceRelationResponseCollection>
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

export type HomepageAnnouncement = {
  __typename?: 'HomepageAnnouncement'
  buttonText: Scalars['String']['output']
  createdAt?: Maybe<Scalars['DateTime']['output']>
  dateFrom?: Maybe<Scalars['DateTime']['output']>
  dateTo?: Maybe<Scalars['DateTime']['output']>
  description: Scalars['String']['output']
  href: Scalars['String']['output']
  image: UploadFileEntityResponse
  title: Scalars['String']['output']
  updatedAt?: Maybe<Scalars['DateTime']['output']>
}

export type HomepageAnnouncementEntity = {
  __typename?: 'HomepageAnnouncementEntity'
  attributes?: Maybe<HomepageAnnouncement>
  id?: Maybe<Scalars['ID']['output']>
}

export type HomepageAnnouncementEntityResponse = {
  __typename?: 'HomepageAnnouncementEntityResponse'
  data?: Maybe<HomepageAnnouncementEntity>
}

export type HomepageAnnouncementEntityResponseCollection = {
  __typename?: 'HomepageAnnouncementEntityResponseCollection'
  data: Array<HomepageAnnouncementEntity>
  meta: ResponseCollectionMeta
}

export type HomepageAnnouncementFiltersInput = {
  and?: InputMaybe<Array<InputMaybe<HomepageAnnouncementFiltersInput>>>
  buttonText?: InputMaybe<StringFilterInput>
  createdAt?: InputMaybe<DateTimeFilterInput>
  dateFrom?: InputMaybe<DateTimeFilterInput>
  dateTo?: InputMaybe<DateTimeFilterInput>
  description?: InputMaybe<StringFilterInput>
  href?: InputMaybe<StringFilterInput>
  id?: InputMaybe<IdFilterInput>
  not?: InputMaybe<HomepageAnnouncementFiltersInput>
  or?: InputMaybe<Array<InputMaybe<HomepageAnnouncementFiltersInput>>>
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
  title?: InputMaybe<Scalars['String']['input']>
}

export type HomepageAnnouncementRelationResponseCollection = {
  __typename?: 'HomepageAnnouncementRelationResponseCollection'
  data: Array<HomepageAnnouncementEntity>
}

export type HomepageEntity = {
  __typename?: 'HomepageEntity'
  attributes?: Maybe<Homepage>
  id?: Maybe<Scalars['ID']['output']>
}

export type HomepageEntityResponse = {
  __typename?: 'HomepageEntityResponse'
  data?: Maybe<HomepageEntity>
}

export type HomepageEntityResponseCollection = {
  __typename?: 'HomepageEntityResponseCollection'
  data: Array<HomepageEntity>
  meta: ResponseCollectionMeta
}

export type HomepageFiltersInput = {
  and?: InputMaybe<Array<InputMaybe<HomepageFiltersInput>>>
  announcements?: InputMaybe<HomepageAnnouncementFiltersInput>
  announcementsLegalPerson?: InputMaybe<HomepageAnnouncementFiltersInput>
  createdAt?: InputMaybe<DateTimeFilterInput>
  not?: InputMaybe<HomepageFiltersInput>
  or?: InputMaybe<Array<InputMaybe<HomepageFiltersInput>>>
  services?: InputMaybe<MunicipalServiceFiltersInput>
  servicesLegalPerson?: InputMaybe<MunicipalServiceFiltersInput>
  updatedAt?: InputMaybe<DateTimeFilterInput>
}

export type HomepageInput = {
  announcements?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>
  announcementsLegalPerson?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>
  services?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>
  servicesLegalPerson?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>
}

export type HomepageRelationResponseCollection = {
  __typename?: 'HomepageRelationResponseCollection'
  data: Array<HomepageEntity>
}

export type I18NLocale = {
  __typename?: 'I18NLocale'
  code?: Maybe<Scalars['String']['output']>
  createdAt?: Maybe<Scalars['DateTime']['output']>
  name?: Maybe<Scalars['String']['output']>
  updatedAt?: Maybe<Scalars['DateTime']['output']>
}

export type I18NLocaleEntity = {
  __typename?: 'I18NLocaleEntity'
  attributes?: Maybe<I18NLocale>
  id?: Maybe<Scalars['ID']['output']>
}

export type I18NLocaleEntityResponse = {
  __typename?: 'I18NLocaleEntityResponse'
  data?: Maybe<I18NLocaleEntity>
}

export type I18NLocaleEntityResponseCollection = {
  __typename?: 'I18NLocaleEntityResponseCollection'
  data: Array<I18NLocaleEntity>
  meta: ResponseCollectionMeta
}

export type I18NLocaleFiltersInput = {
  and?: InputMaybe<Array<InputMaybe<I18NLocaleFiltersInput>>>
  code?: InputMaybe<StringFilterInput>
  createdAt?: InputMaybe<DateTimeFilterInput>
  id?: InputMaybe<IdFilterInput>
  name?: InputMaybe<StringFilterInput>
  not?: InputMaybe<I18NLocaleFiltersInput>
  or?: InputMaybe<Array<InputMaybe<I18NLocaleFiltersInput>>>
  updatedAt?: InputMaybe<DateTimeFilterInput>
}

export type I18NLocaleInput = {
  code?: InputMaybe<Scalars['String']['input']>
  name?: InputMaybe<Scalars['String']['input']>
}

export type I18NLocaleRelationResponseCollection = {
  __typename?: 'I18NLocaleRelationResponseCollection'
  data: Array<I18NLocaleEntity>
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

export type LongFilterInput = {
  and?: InputMaybe<Array<InputMaybe<Scalars['Long']['input']>>>
  between?: InputMaybe<Array<InputMaybe<Scalars['Long']['input']>>>
  contains?: InputMaybe<Scalars['Long']['input']>
  containsi?: InputMaybe<Scalars['Long']['input']>
  endsWith?: InputMaybe<Scalars['Long']['input']>
  eq?: InputMaybe<Scalars['Long']['input']>
  eqi?: InputMaybe<Scalars['Long']['input']>
  gt?: InputMaybe<Scalars['Long']['input']>
  gte?: InputMaybe<Scalars['Long']['input']>
  in?: InputMaybe<Array<InputMaybe<Scalars['Long']['input']>>>
  lt?: InputMaybe<Scalars['Long']['input']>
  lte?: InputMaybe<Scalars['Long']['input']>
  ne?: InputMaybe<Scalars['Long']['input']>
  nei?: InputMaybe<Scalars['Long']['input']>
  not?: InputMaybe<LongFilterInput>
  notContains?: InputMaybe<Scalars['Long']['input']>
  notContainsi?: InputMaybe<Scalars['Long']['input']>
  notIn?: InputMaybe<Array<InputMaybe<Scalars['Long']['input']>>>
  notNull?: InputMaybe<Scalars['Boolean']['input']>
  null?: InputMaybe<Scalars['Boolean']['input']>
  or?: InputMaybe<Array<InputMaybe<Scalars['Long']['input']>>>
  startsWith?: InputMaybe<Scalars['Long']['input']>
}

export type MunicipalService = {
  __typename?: 'MunicipalService'
  buttonText: Scalars['String']['output']
  categories?: Maybe<MunicipalServiceCategoryRelationResponseCollection>
  color: Enum_Municipalservice_Color
  createdAt?: Maybe<Scalars['DateTime']['output']>
  description: Scalars['String']['output']
  href: Scalars['String']['output']
  icon: Enum_Municipalservice_Icon
  tags?: Maybe<MunicipalServiceTagRelationResponseCollection>
  title: Scalars['String']['output']
  updatedAt?: Maybe<Scalars['DateTime']['output']>
}

export type MunicipalServiceCategoriesArgs = {
  filters?: InputMaybe<MunicipalServiceCategoryFiltersInput>
  pagination?: InputMaybe<PaginationArg>
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
}

export type MunicipalServiceTagsArgs = {
  filters?: InputMaybe<MunicipalServiceTagFiltersInput>
  pagination?: InputMaybe<PaginationArg>
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
}

export type MunicipalServiceCategory = {
  __typename?: 'MunicipalServiceCategory'
  createdAt?: Maybe<Scalars['DateTime']['output']>
  municipalServices?: Maybe<MunicipalServiceRelationResponseCollection>
  title: Scalars['String']['output']
  updatedAt?: Maybe<Scalars['DateTime']['output']>
}

export type MunicipalServiceCategoryMunicipalServicesArgs = {
  filters?: InputMaybe<MunicipalServiceFiltersInput>
  pagination?: InputMaybe<PaginationArg>
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
}

export type MunicipalServiceCategoryEntity = {
  __typename?: 'MunicipalServiceCategoryEntity'
  attributes?: Maybe<MunicipalServiceCategory>
  id?: Maybe<Scalars['ID']['output']>
}

export type MunicipalServiceCategoryEntityResponse = {
  __typename?: 'MunicipalServiceCategoryEntityResponse'
  data?: Maybe<MunicipalServiceCategoryEntity>
}

export type MunicipalServiceCategoryEntityResponseCollection = {
  __typename?: 'MunicipalServiceCategoryEntityResponseCollection'
  data: Array<MunicipalServiceCategoryEntity>
  meta: ResponseCollectionMeta
}

export type MunicipalServiceCategoryFiltersInput = {
  and?: InputMaybe<Array<InputMaybe<MunicipalServiceCategoryFiltersInput>>>
  createdAt?: InputMaybe<DateTimeFilterInput>
  id?: InputMaybe<IdFilterInput>
  municipalServices?: InputMaybe<MunicipalServiceFiltersInput>
  not?: InputMaybe<MunicipalServiceCategoryFiltersInput>
  or?: InputMaybe<Array<InputMaybe<MunicipalServiceCategoryFiltersInput>>>
  title?: InputMaybe<StringFilterInput>
  updatedAt?: InputMaybe<DateTimeFilterInput>
}

export type MunicipalServiceCategoryInput = {
  municipalServices?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>
  title?: InputMaybe<Scalars['String']['input']>
}

export type MunicipalServiceCategoryRelationResponseCollection = {
  __typename?: 'MunicipalServiceCategoryRelationResponseCollection'
  data: Array<MunicipalServiceCategoryEntity>
}

export type MunicipalServiceEntity = {
  __typename?: 'MunicipalServiceEntity'
  attributes?: Maybe<MunicipalService>
  id?: Maybe<Scalars['ID']['output']>
}

export type MunicipalServiceEntityResponse = {
  __typename?: 'MunicipalServiceEntityResponse'
  data?: Maybe<MunicipalServiceEntity>
}

export type MunicipalServiceEntityResponseCollection = {
  __typename?: 'MunicipalServiceEntityResponseCollection'
  data: Array<MunicipalServiceEntity>
  meta: ResponseCollectionMeta
}

export type MunicipalServiceFiltersInput = {
  and?: InputMaybe<Array<InputMaybe<MunicipalServiceFiltersInput>>>
  buttonText?: InputMaybe<StringFilterInput>
  categories?: InputMaybe<MunicipalServiceCategoryFiltersInput>
  color?: InputMaybe<StringFilterInput>
  createdAt?: InputMaybe<DateTimeFilterInput>
  description?: InputMaybe<StringFilterInput>
  href?: InputMaybe<StringFilterInput>
  icon?: InputMaybe<StringFilterInput>
  id?: InputMaybe<IdFilterInput>
  not?: InputMaybe<MunicipalServiceFiltersInput>
  or?: InputMaybe<Array<InputMaybe<MunicipalServiceFiltersInput>>>
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
  tags?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>
  title?: InputMaybe<Scalars['String']['input']>
}

export type MunicipalServiceRelationResponseCollection = {
  __typename?: 'MunicipalServiceRelationResponseCollection'
  data: Array<MunicipalServiceEntity>
}

export type MunicipalServiceTag = {
  __typename?: 'MunicipalServiceTag'
  createdAt?: Maybe<Scalars['DateTime']['output']>
  municipalServices?: Maybe<MunicipalServiceRelationResponseCollection>
  title: Scalars['String']['output']
  updatedAt?: Maybe<Scalars['DateTime']['output']>
}

export type MunicipalServiceTagMunicipalServicesArgs = {
  filters?: InputMaybe<MunicipalServiceFiltersInput>
  pagination?: InputMaybe<PaginationArg>
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
}

export type MunicipalServiceTagEntity = {
  __typename?: 'MunicipalServiceTagEntity'
  attributes?: Maybe<MunicipalServiceTag>
  id?: Maybe<Scalars['ID']['output']>
}

export type MunicipalServiceTagEntityResponse = {
  __typename?: 'MunicipalServiceTagEntityResponse'
  data?: Maybe<MunicipalServiceTagEntity>
}

export type MunicipalServiceTagEntityResponseCollection = {
  __typename?: 'MunicipalServiceTagEntityResponseCollection'
  data: Array<MunicipalServiceTagEntity>
  meta: ResponseCollectionMeta
}

export type MunicipalServiceTagFiltersInput = {
  and?: InputMaybe<Array<InputMaybe<MunicipalServiceTagFiltersInput>>>
  createdAt?: InputMaybe<DateTimeFilterInput>
  id?: InputMaybe<IdFilterInput>
  municipalServices?: InputMaybe<MunicipalServiceFiltersInput>
  not?: InputMaybe<MunicipalServiceTagFiltersInput>
  or?: InputMaybe<Array<InputMaybe<MunicipalServiceTagFiltersInput>>>
  title?: InputMaybe<StringFilterInput>
  updatedAt?: InputMaybe<DateTimeFilterInput>
}

export type MunicipalServiceTagInput = {
  municipalServices?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>
  title?: InputMaybe<Scalars['String']['input']>
}

export type MunicipalServiceTagRelationResponseCollection = {
  __typename?: 'MunicipalServiceTagRelationResponseCollection'
  data: Array<MunicipalServiceTagEntity>
}

export type MunicipalServicesPage = {
  __typename?: 'MunicipalServicesPage'
  createdAt?: Maybe<Scalars['DateTime']['output']>
  services?: Maybe<MunicipalServiceRelationResponseCollection>
  servicesLegalPerson?: Maybe<MunicipalServiceRelationResponseCollection>
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

export type MunicipalServicesPageEntity = {
  __typename?: 'MunicipalServicesPageEntity'
  attributes?: Maybe<MunicipalServicesPage>
  id?: Maybe<Scalars['ID']['output']>
}

export type MunicipalServicesPageEntityResponse = {
  __typename?: 'MunicipalServicesPageEntityResponse'
  data?: Maybe<MunicipalServicesPageEntity>
}

export type MunicipalServicesPageEntityResponseCollection = {
  __typename?: 'MunicipalServicesPageEntityResponseCollection'
  data: Array<MunicipalServicesPageEntity>
  meta: ResponseCollectionMeta
}

export type MunicipalServicesPageFiltersInput = {
  and?: InputMaybe<Array<InputMaybe<MunicipalServicesPageFiltersInput>>>
  createdAt?: InputMaybe<DateTimeFilterInput>
  not?: InputMaybe<MunicipalServicesPageFiltersInput>
  or?: InputMaybe<Array<InputMaybe<MunicipalServicesPageFiltersInput>>>
  services?: InputMaybe<MunicipalServiceFiltersInput>
  servicesLegalPerson?: InputMaybe<MunicipalServiceFiltersInput>
  updatedAt?: InputMaybe<DateTimeFilterInput>
}

export type MunicipalServicesPageInput = {
  services?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>
  servicesLegalPerson?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>
}

export type MunicipalServicesPageRelationResponseCollection = {
  __typename?: 'MunicipalServicesPageRelationResponseCollection'
  data: Array<MunicipalServicesPageEntity>
}

export type Mutation = {
  __typename?: 'Mutation'
  /** Change user password. Confirm with the current password. */
  changePassword?: Maybe<UsersPermissionsLoginPayload>
  createContentReleasesRelease?: Maybe<ContentReleasesReleaseEntityResponse>
  createContentReleasesReleaseAction?: Maybe<ContentReleasesReleaseActionEntityResponse>
  createForm?: Maybe<FormEntityResponse>
  createHomepageAnnouncement?: Maybe<HomepageAnnouncementEntityResponse>
  createMunicipalService?: Maybe<MunicipalServiceEntityResponse>
  createMunicipalServiceCategory?: Maybe<MunicipalServiceCategoryEntityResponse>
  createMunicipalServiceTag?: Maybe<MunicipalServiceTagEntityResponse>
  createUploadFile?: Maybe<UploadFileEntityResponse>
  createUploadFolder?: Maybe<UploadFolderEntityResponse>
  /** Create a new role */
  createUsersPermissionsRole?: Maybe<UsersPermissionsCreateRolePayload>
  /** Create a new user */
  createUsersPermissionsUser: UsersPermissionsUserEntityResponse
  deleteContentReleasesRelease?: Maybe<ContentReleasesReleaseEntityResponse>
  deleteContentReleasesReleaseAction?: Maybe<ContentReleasesReleaseActionEntityResponse>
  deleteForm?: Maybe<FormEntityResponse>
  deleteGeneral?: Maybe<GeneralEntityResponse>
  deleteHelpPage?: Maybe<HelpPageEntityResponse>
  deleteHomepage?: Maybe<HomepageEntityResponse>
  deleteHomepageAnnouncement?: Maybe<HomepageAnnouncementEntityResponse>
  deleteMunicipalService?: Maybe<MunicipalServiceEntityResponse>
  deleteMunicipalServiceCategory?: Maybe<MunicipalServiceCategoryEntityResponse>
  deleteMunicipalServiceTag?: Maybe<MunicipalServiceTagEntityResponse>
  deleteMunicipalServicesPage?: Maybe<MunicipalServicesPageEntityResponse>
  deleteTax?: Maybe<TaxEntityResponse>
  deleteUploadFile?: Maybe<UploadFileEntityResponse>
  deleteUploadFolder?: Maybe<UploadFolderEntityResponse>
  /** Delete an existing role */
  deleteUsersPermissionsRole?: Maybe<UsersPermissionsDeleteRolePayload>
  /** Delete an existing user */
  deleteUsersPermissionsUser: UsersPermissionsUserEntityResponse
  /** Confirm an email users email address */
  emailConfirmation?: Maybe<UsersPermissionsLoginPayload>
  /** Request a reset password token */
  forgotPassword?: Maybe<UsersPermissionsPasswordPayload>
  login: UsersPermissionsLoginPayload
  multipleUpload: Array<Maybe<UploadFileEntityResponse>>
  /** Register a user */
  register: UsersPermissionsLoginPayload
  removeFile?: Maybe<UploadFileEntityResponse>
  /** Reset user password. Confirm with a code (resetToken from forgotPassword) */
  resetPassword?: Maybe<UsersPermissionsLoginPayload>
  updateContentReleasesRelease?: Maybe<ContentReleasesReleaseEntityResponse>
  updateContentReleasesReleaseAction?: Maybe<ContentReleasesReleaseActionEntityResponse>
  updateFileInfo: UploadFileEntityResponse
  updateForm?: Maybe<FormEntityResponse>
  updateGeneral?: Maybe<GeneralEntityResponse>
  updateHelpPage?: Maybe<HelpPageEntityResponse>
  updateHomepage?: Maybe<HomepageEntityResponse>
  updateHomepageAnnouncement?: Maybe<HomepageAnnouncementEntityResponse>
  updateMunicipalService?: Maybe<MunicipalServiceEntityResponse>
  updateMunicipalServiceCategory?: Maybe<MunicipalServiceCategoryEntityResponse>
  updateMunicipalServiceTag?: Maybe<MunicipalServiceTagEntityResponse>
  updateMunicipalServicesPage?: Maybe<MunicipalServicesPageEntityResponse>
  updateTax?: Maybe<TaxEntityResponse>
  updateUploadFile?: Maybe<UploadFileEntityResponse>
  updateUploadFolder?: Maybe<UploadFolderEntityResponse>
  /** Update an existing role */
  updateUsersPermissionsRole?: Maybe<UsersPermissionsUpdateRolePayload>
  /** Update an existing user */
  updateUsersPermissionsUser: UsersPermissionsUserEntityResponse
  upload: UploadFileEntityResponse
}

export type MutationChangePasswordArgs = {
  currentPassword: Scalars['String']['input']
  password: Scalars['String']['input']
  passwordConfirmation: Scalars['String']['input']
}

export type MutationCreateContentReleasesReleaseArgs = {
  data: ContentReleasesReleaseInput
}

export type MutationCreateContentReleasesReleaseActionArgs = {
  data: ContentReleasesReleaseActionInput
}

export type MutationCreateFormArgs = {
  data: FormInput
}

export type MutationCreateHomepageAnnouncementArgs = {
  data: HomepageAnnouncementInput
}

export type MutationCreateMunicipalServiceArgs = {
  data: MunicipalServiceInput
}

export type MutationCreateMunicipalServiceCategoryArgs = {
  data: MunicipalServiceCategoryInput
}

export type MutationCreateMunicipalServiceTagArgs = {
  data: MunicipalServiceTagInput
}

export type MutationCreateUploadFileArgs = {
  data: UploadFileInput
}

export type MutationCreateUploadFolderArgs = {
  data: UploadFolderInput
}

export type MutationCreateUsersPermissionsRoleArgs = {
  data: UsersPermissionsRoleInput
}

export type MutationCreateUsersPermissionsUserArgs = {
  data: UsersPermissionsUserInput
}

export type MutationDeleteContentReleasesReleaseArgs = {
  id: Scalars['ID']['input']
}

export type MutationDeleteContentReleasesReleaseActionArgs = {
  id: Scalars['ID']['input']
}

export type MutationDeleteFormArgs = {
  id: Scalars['ID']['input']
}

export type MutationDeleteHomepageAnnouncementArgs = {
  id: Scalars['ID']['input']
}

export type MutationDeleteMunicipalServiceArgs = {
  id: Scalars['ID']['input']
}

export type MutationDeleteMunicipalServiceCategoryArgs = {
  id: Scalars['ID']['input']
}

export type MutationDeleteMunicipalServiceTagArgs = {
  id: Scalars['ID']['input']
}

export type MutationDeleteUploadFileArgs = {
  id: Scalars['ID']['input']
}

export type MutationDeleteUploadFolderArgs = {
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

export type MutationMultipleUploadArgs = {
  field?: InputMaybe<Scalars['String']['input']>
  files: Array<InputMaybe<Scalars['Upload']['input']>>
  ref?: InputMaybe<Scalars['String']['input']>
  refId?: InputMaybe<Scalars['ID']['input']>
}

export type MutationRegisterArgs = {
  input: UsersPermissionsRegisterInput
}

export type MutationRemoveFileArgs = {
  id: Scalars['ID']['input']
}

export type MutationResetPasswordArgs = {
  code: Scalars['String']['input']
  password: Scalars['String']['input']
  passwordConfirmation: Scalars['String']['input']
}

export type MutationUpdateContentReleasesReleaseArgs = {
  data: ContentReleasesReleaseInput
  id: Scalars['ID']['input']
}

export type MutationUpdateContentReleasesReleaseActionArgs = {
  data: ContentReleasesReleaseActionInput
  id: Scalars['ID']['input']
}

export type MutationUpdateFileInfoArgs = {
  id: Scalars['ID']['input']
  info?: InputMaybe<FileInfoInput>
}

export type MutationUpdateFormArgs = {
  data: FormInput
  id: Scalars['ID']['input']
}

export type MutationUpdateGeneralArgs = {
  data: GeneralInput
}

export type MutationUpdateHelpPageArgs = {
  data: HelpPageInput
}

export type MutationUpdateHomepageArgs = {
  data: HomepageInput
}

export type MutationUpdateHomepageAnnouncementArgs = {
  data: HomepageAnnouncementInput
  id: Scalars['ID']['input']
}

export type MutationUpdateMunicipalServiceArgs = {
  data: MunicipalServiceInput
  id: Scalars['ID']['input']
}

export type MutationUpdateMunicipalServiceCategoryArgs = {
  data: MunicipalServiceCategoryInput
  id: Scalars['ID']['input']
}

export type MutationUpdateMunicipalServiceTagArgs = {
  data: MunicipalServiceTagInput
  id: Scalars['ID']['input']
}

export type MutationUpdateMunicipalServicesPageArgs = {
  data: MunicipalServicesPageInput
}

export type MutationUpdateTaxArgs = {
  data: TaxInput
}

export type MutationUpdateUploadFileArgs = {
  data: UploadFileInput
  id: Scalars['ID']['input']
}

export type MutationUpdateUploadFolderArgs = {
  data: UploadFolderInput
  id: Scalars['ID']['input']
}

export type MutationUpdateUsersPermissionsRoleArgs = {
  data: UsersPermissionsRoleInput
  id: Scalars['ID']['input']
}

export type MutationUpdateUsersPermissionsUserArgs = {
  data: UsersPermissionsUserInput
  id: Scalars['ID']['input']
}

export type MutationUploadArgs = {
  field?: InputMaybe<Scalars['String']['input']>
  file: Scalars['Upload']['input']
  info?: InputMaybe<FileInfoInput>
  ref?: InputMaybe<Scalars['String']['input']>
  refId?: InputMaybe<Scalars['ID']['input']>
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

export enum PublicationState {
  Live = 'LIVE',
  Preview = 'PREVIEW',
}

export type Query = {
  __typename?: 'Query'
  contentReleasesRelease?: Maybe<ContentReleasesReleaseEntityResponse>
  contentReleasesReleaseAction?: Maybe<ContentReleasesReleaseActionEntityResponse>
  contentReleasesReleaseActions?: Maybe<ContentReleasesReleaseActionEntityResponseCollection>
  contentReleasesReleases?: Maybe<ContentReleasesReleaseEntityResponseCollection>
  form?: Maybe<FormEntityResponse>
  forms?: Maybe<FormEntityResponseCollection>
  general?: Maybe<GeneralEntityResponse>
  helpPage?: Maybe<HelpPageEntityResponse>
  homepage?: Maybe<HomepageEntityResponse>
  homepageAnnouncement?: Maybe<HomepageAnnouncementEntityResponse>
  homepageAnnouncements?: Maybe<HomepageAnnouncementEntityResponseCollection>
  i18NLocale?: Maybe<I18NLocaleEntityResponse>
  i18NLocales?: Maybe<I18NLocaleEntityResponseCollection>
  me?: Maybe<UsersPermissionsMe>
  municipalService?: Maybe<MunicipalServiceEntityResponse>
  municipalServiceCategories?: Maybe<MunicipalServiceCategoryEntityResponseCollection>
  municipalServiceCategory?: Maybe<MunicipalServiceCategoryEntityResponse>
  municipalServiceTag?: Maybe<MunicipalServiceTagEntityResponse>
  municipalServiceTags?: Maybe<MunicipalServiceTagEntityResponseCollection>
  municipalServices?: Maybe<MunicipalServiceEntityResponseCollection>
  municipalServicesPage?: Maybe<MunicipalServicesPageEntityResponse>
  tax?: Maybe<TaxEntityResponse>
  uploadFile?: Maybe<UploadFileEntityResponse>
  uploadFiles?: Maybe<UploadFileEntityResponseCollection>
  uploadFolder?: Maybe<UploadFolderEntityResponse>
  uploadFolders?: Maybe<UploadFolderEntityResponseCollection>
  usersPermissionsRole?: Maybe<UsersPermissionsRoleEntityResponse>
  usersPermissionsRoles?: Maybe<UsersPermissionsRoleEntityResponseCollection>
  usersPermissionsUser?: Maybe<UsersPermissionsUserEntityResponse>
  usersPermissionsUsers?: Maybe<UsersPermissionsUserEntityResponseCollection>
}

export type QueryContentReleasesReleaseArgs = {
  id?: InputMaybe<Scalars['ID']['input']>
}

export type QueryContentReleasesReleaseActionArgs = {
  id?: InputMaybe<Scalars['ID']['input']>
}

export type QueryContentReleasesReleaseActionsArgs = {
  filters?: InputMaybe<ContentReleasesReleaseActionFiltersInput>
  pagination?: InputMaybe<PaginationArg>
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
}

export type QueryContentReleasesReleasesArgs = {
  filters?: InputMaybe<ContentReleasesReleaseFiltersInput>
  pagination?: InputMaybe<PaginationArg>
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
}

export type QueryFormArgs = {
  id?: InputMaybe<Scalars['ID']['input']>
}

export type QueryFormsArgs = {
  filters?: InputMaybe<FormFiltersInput>
  pagination?: InputMaybe<PaginationArg>
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
}

export type QueryHomepageAnnouncementArgs = {
  id?: InputMaybe<Scalars['ID']['input']>
}

export type QueryHomepageAnnouncementsArgs = {
  filters?: InputMaybe<HomepageAnnouncementFiltersInput>
  pagination?: InputMaybe<PaginationArg>
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
}

export type QueryI18NLocaleArgs = {
  id?: InputMaybe<Scalars['ID']['input']>
}

export type QueryI18NLocalesArgs = {
  filters?: InputMaybe<I18NLocaleFiltersInput>
  pagination?: InputMaybe<PaginationArg>
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
}

export type QueryMunicipalServiceArgs = {
  id?: InputMaybe<Scalars['ID']['input']>
}

export type QueryMunicipalServiceCategoriesArgs = {
  filters?: InputMaybe<MunicipalServiceCategoryFiltersInput>
  pagination?: InputMaybe<PaginationArg>
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
}

export type QueryMunicipalServiceCategoryArgs = {
  id?: InputMaybe<Scalars['ID']['input']>
}

export type QueryMunicipalServiceTagArgs = {
  id?: InputMaybe<Scalars['ID']['input']>
}

export type QueryMunicipalServiceTagsArgs = {
  filters?: InputMaybe<MunicipalServiceTagFiltersInput>
  pagination?: InputMaybe<PaginationArg>
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
}

export type QueryMunicipalServicesArgs = {
  filters?: InputMaybe<MunicipalServiceFiltersInput>
  pagination?: InputMaybe<PaginationArg>
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
}

export type QueryUploadFileArgs = {
  id?: InputMaybe<Scalars['ID']['input']>
}

export type QueryUploadFilesArgs = {
  filters?: InputMaybe<UploadFileFiltersInput>
  pagination?: InputMaybe<PaginationArg>
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
}

export type QueryUploadFolderArgs = {
  id?: InputMaybe<Scalars['ID']['input']>
}

export type QueryUploadFoldersArgs = {
  filters?: InputMaybe<UploadFolderFiltersInput>
  pagination?: InputMaybe<PaginationArg>
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
}

export type QueryUsersPermissionsRoleArgs = {
  id?: InputMaybe<Scalars['ID']['input']>
}

export type QueryUsersPermissionsRolesArgs = {
  filters?: InputMaybe<UsersPermissionsRoleFiltersInput>
  pagination?: InputMaybe<PaginationArg>
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
}

export type QueryUsersPermissionsUserArgs = {
  id?: InputMaybe<Scalars['ID']['input']>
}

export type QueryUsersPermissionsUsersArgs = {
  filters?: InputMaybe<UsersPermissionsUserFiltersInput>
  pagination?: InputMaybe<PaginationArg>
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
}

export type ResponseCollectionMeta = {
  __typename?: 'ResponseCollectionMeta'
  pagination: Pagination
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
  currentYearTaxInPreparationText?: Maybe<Scalars['String']['output']>
  currentYearTaxInPreparationTitle?: Maybe<Scalars['String']['output']>
  displayCurrentYearTaxInPreparation: Scalars['Boolean']['output']
  paymentSuccessFaqLink?: Maybe<Scalars['String']['output']>
  paymentSuccessFeedbackLink?: Maybe<Scalars['String']['output']>
  paymentSuccessPrivacyPolicyLink?: Maybe<Scalars['String']['output']>
  updatedAt?: Maybe<Scalars['DateTime']['output']>
}

export type TaxEntity = {
  __typename?: 'TaxEntity'
  attributes?: Maybe<Tax>
  id?: Maybe<Scalars['ID']['output']>
}

export type TaxEntityResponse = {
  __typename?: 'TaxEntityResponse'
  data?: Maybe<TaxEntity>
}

export type TaxEntityResponseCollection = {
  __typename?: 'TaxEntityResponseCollection'
  data: Array<TaxEntity>
  meta: ResponseCollectionMeta
}

export type TaxFiltersInput = {
  accountCommunicationConsentText?: InputMaybe<StringFilterInput>
  and?: InputMaybe<Array<InputMaybe<TaxFiltersInput>>>
  channelChangeEffectiveNextYearText?: InputMaybe<StringFilterInput>
  channelChangeEffectiveNextYearTitle?: InputMaybe<StringFilterInput>
  createdAt?: InputMaybe<DateTimeFilterInput>
  currentYearTaxInPreparationText?: InputMaybe<StringFilterInput>
  currentYearTaxInPreparationTitle?: InputMaybe<StringFilterInput>
  displayCurrentYearTaxInPreparation?: InputMaybe<BooleanFilterInput>
  not?: InputMaybe<TaxFiltersInput>
  or?: InputMaybe<Array<InputMaybe<TaxFiltersInput>>>
  paymentSuccessFaqLink?: InputMaybe<StringFilterInput>
  paymentSuccessFeedbackLink?: InputMaybe<StringFilterInput>
  paymentSuccessPrivacyPolicyLink?: InputMaybe<StringFilterInput>
  updatedAt?: InputMaybe<DateTimeFilterInput>
}

export type TaxInput = {
  accountCommunicationConsentText?: InputMaybe<Scalars['String']['input']>
  channelChangeEffectiveNextYearText?: InputMaybe<Scalars['String']['input']>
  channelChangeEffectiveNextYearTitle?: InputMaybe<Scalars['String']['input']>
  currentYearTaxInPreparationText?: InputMaybe<Scalars['String']['input']>
  currentYearTaxInPreparationTitle?: InputMaybe<Scalars['String']['input']>
  displayCurrentYearTaxInPreparation?: InputMaybe<Scalars['Boolean']['input']>
  paymentSuccessFaqLink?: InputMaybe<Scalars['String']['input']>
  paymentSuccessFeedbackLink?: InputMaybe<Scalars['String']['input']>
  paymentSuccessPrivacyPolicyLink?: InputMaybe<Scalars['String']['input']>
}

export type TaxRelationResponseCollection = {
  __typename?: 'TaxRelationResponseCollection'
  data: Array<TaxEntity>
}

export type TimeFilterInput = {
  and?: InputMaybe<Array<InputMaybe<Scalars['Time']['input']>>>
  between?: InputMaybe<Array<InputMaybe<Scalars['Time']['input']>>>
  contains?: InputMaybe<Scalars['Time']['input']>
  containsi?: InputMaybe<Scalars['Time']['input']>
  endsWith?: InputMaybe<Scalars['Time']['input']>
  eq?: InputMaybe<Scalars['Time']['input']>
  eqi?: InputMaybe<Scalars['Time']['input']>
  gt?: InputMaybe<Scalars['Time']['input']>
  gte?: InputMaybe<Scalars['Time']['input']>
  in?: InputMaybe<Array<InputMaybe<Scalars['Time']['input']>>>
  lt?: InputMaybe<Scalars['Time']['input']>
  lte?: InputMaybe<Scalars['Time']['input']>
  ne?: InputMaybe<Scalars['Time']['input']>
  nei?: InputMaybe<Scalars['Time']['input']>
  not?: InputMaybe<TimeFilterInput>
  notContains?: InputMaybe<Scalars['Time']['input']>
  notContainsi?: InputMaybe<Scalars['Time']['input']>
  notIn?: InputMaybe<Array<InputMaybe<Scalars['Time']['input']>>>
  notNull?: InputMaybe<Scalars['Boolean']['input']>
  null?: InputMaybe<Scalars['Boolean']['input']>
  or?: InputMaybe<Array<InputMaybe<Scalars['Time']['input']>>>
  startsWith?: InputMaybe<Scalars['Time']['input']>
}

export type UploadFile = {
  __typename?: 'UploadFile'
  alternativeText?: Maybe<Scalars['String']['output']>
  caption?: Maybe<Scalars['String']['output']>
  createdAt?: Maybe<Scalars['DateTime']['output']>
  ext?: Maybe<Scalars['String']['output']>
  formats?: Maybe<Scalars['JSON']['output']>
  hash: Scalars['String']['output']
  height?: Maybe<Scalars['Int']['output']>
  mime: Scalars['String']['output']
  name: Scalars['String']['output']
  previewUrl?: Maybe<Scalars['String']['output']>
  provider: Scalars['String']['output']
  provider_metadata?: Maybe<Scalars['JSON']['output']>
  related?: Maybe<Array<Maybe<GenericMorph>>>
  size: Scalars['Float']['output']
  updatedAt?: Maybe<Scalars['DateTime']['output']>
  url: Scalars['String']['output']
  width?: Maybe<Scalars['Int']['output']>
}

export type UploadFileEntity = {
  __typename?: 'UploadFileEntity'
  attributes?: Maybe<UploadFile>
  id?: Maybe<Scalars['ID']['output']>
}

export type UploadFileEntityResponse = {
  __typename?: 'UploadFileEntityResponse'
  data?: Maybe<UploadFileEntity>
}

export type UploadFileEntityResponseCollection = {
  __typename?: 'UploadFileEntityResponseCollection'
  data: Array<UploadFileEntity>
  meta: ResponseCollectionMeta
}

export type UploadFileFiltersInput = {
  alternativeText?: InputMaybe<StringFilterInput>
  and?: InputMaybe<Array<InputMaybe<UploadFileFiltersInput>>>
  caption?: InputMaybe<StringFilterInput>
  createdAt?: InputMaybe<DateTimeFilterInput>
  ext?: InputMaybe<StringFilterInput>
  folder?: InputMaybe<UploadFolderFiltersInput>
  folderPath?: InputMaybe<StringFilterInput>
  formats?: InputMaybe<JsonFilterInput>
  hash?: InputMaybe<StringFilterInput>
  height?: InputMaybe<IntFilterInput>
  id?: InputMaybe<IdFilterInput>
  mime?: InputMaybe<StringFilterInput>
  name?: InputMaybe<StringFilterInput>
  not?: InputMaybe<UploadFileFiltersInput>
  or?: InputMaybe<Array<InputMaybe<UploadFileFiltersInput>>>
  previewUrl?: InputMaybe<StringFilterInput>
  provider?: InputMaybe<StringFilterInput>
  provider_metadata?: InputMaybe<JsonFilterInput>
  size?: InputMaybe<FloatFilterInput>
  updatedAt?: InputMaybe<DateTimeFilterInput>
  url?: InputMaybe<StringFilterInput>
  width?: InputMaybe<IntFilterInput>
}

export type UploadFileInput = {
  alternativeText?: InputMaybe<Scalars['String']['input']>
  caption?: InputMaybe<Scalars['String']['input']>
  ext?: InputMaybe<Scalars['String']['input']>
  folder?: InputMaybe<Scalars['ID']['input']>
  folderPath?: InputMaybe<Scalars['String']['input']>
  formats?: InputMaybe<Scalars['JSON']['input']>
  hash?: InputMaybe<Scalars['String']['input']>
  height?: InputMaybe<Scalars['Int']['input']>
  mime?: InputMaybe<Scalars['String']['input']>
  name?: InputMaybe<Scalars['String']['input']>
  previewUrl?: InputMaybe<Scalars['String']['input']>
  provider?: InputMaybe<Scalars['String']['input']>
  provider_metadata?: InputMaybe<Scalars['JSON']['input']>
  size?: InputMaybe<Scalars['Float']['input']>
  url?: InputMaybe<Scalars['String']['input']>
  width?: InputMaybe<Scalars['Int']['input']>
}

export type UploadFileRelationResponseCollection = {
  __typename?: 'UploadFileRelationResponseCollection'
  data: Array<UploadFileEntity>
}

export type UploadFolder = {
  __typename?: 'UploadFolder'
  children?: Maybe<UploadFolderRelationResponseCollection>
  createdAt?: Maybe<Scalars['DateTime']['output']>
  files?: Maybe<UploadFileRelationResponseCollection>
  name: Scalars['String']['output']
  parent?: Maybe<UploadFolderEntityResponse>
  path: Scalars['String']['output']
  pathId: Scalars['Int']['output']
  updatedAt?: Maybe<Scalars['DateTime']['output']>
}

export type UploadFolderChildrenArgs = {
  filters?: InputMaybe<UploadFolderFiltersInput>
  pagination?: InputMaybe<PaginationArg>
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
}

export type UploadFolderFilesArgs = {
  filters?: InputMaybe<UploadFileFiltersInput>
  pagination?: InputMaybe<PaginationArg>
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
}

export type UploadFolderEntity = {
  __typename?: 'UploadFolderEntity'
  attributes?: Maybe<UploadFolder>
  id?: Maybe<Scalars['ID']['output']>
}

export type UploadFolderEntityResponse = {
  __typename?: 'UploadFolderEntityResponse'
  data?: Maybe<UploadFolderEntity>
}

export type UploadFolderEntityResponseCollection = {
  __typename?: 'UploadFolderEntityResponseCollection'
  data: Array<UploadFolderEntity>
  meta: ResponseCollectionMeta
}

export type UploadFolderFiltersInput = {
  and?: InputMaybe<Array<InputMaybe<UploadFolderFiltersInput>>>
  children?: InputMaybe<UploadFolderFiltersInput>
  createdAt?: InputMaybe<DateTimeFilterInput>
  files?: InputMaybe<UploadFileFiltersInput>
  id?: InputMaybe<IdFilterInput>
  name?: InputMaybe<StringFilterInput>
  not?: InputMaybe<UploadFolderFiltersInput>
  or?: InputMaybe<Array<InputMaybe<UploadFolderFiltersInput>>>
  parent?: InputMaybe<UploadFolderFiltersInput>
  path?: InputMaybe<StringFilterInput>
  pathId?: InputMaybe<IntFilterInput>
  updatedAt?: InputMaybe<DateTimeFilterInput>
}

export type UploadFolderInput = {
  children?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>
  files?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>
  name?: InputMaybe<Scalars['String']['input']>
  parent?: InputMaybe<Scalars['ID']['input']>
  path?: InputMaybe<Scalars['String']['input']>
  pathId?: InputMaybe<Scalars['Int']['input']>
}

export type UploadFolderRelationResponseCollection = {
  __typename?: 'UploadFolderRelationResponseCollection'
  data: Array<UploadFolderEntity>
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
  role?: Maybe<UsersPermissionsRoleEntityResponse>
  updatedAt?: Maybe<Scalars['DateTime']['output']>
}

export type UsersPermissionsPermissionEntity = {
  __typename?: 'UsersPermissionsPermissionEntity'
  attributes?: Maybe<UsersPermissionsPermission>
  id?: Maybe<Scalars['ID']['output']>
}

export type UsersPermissionsPermissionEntityResponse = {
  __typename?: 'UsersPermissionsPermissionEntityResponse'
  data?: Maybe<UsersPermissionsPermissionEntity>
}

export type UsersPermissionsPermissionEntityResponseCollection = {
  __typename?: 'UsersPermissionsPermissionEntityResponseCollection'
  data: Array<UsersPermissionsPermissionEntity>
  meta: ResponseCollectionMeta
}

export type UsersPermissionsPermissionFiltersInput = {
  action?: InputMaybe<StringFilterInput>
  and?: InputMaybe<Array<InputMaybe<UsersPermissionsPermissionFiltersInput>>>
  createdAt?: InputMaybe<DateTimeFilterInput>
  id?: InputMaybe<IdFilterInput>
  not?: InputMaybe<UsersPermissionsPermissionFiltersInput>
  or?: InputMaybe<Array<InputMaybe<UsersPermissionsPermissionFiltersInput>>>
  role?: InputMaybe<UsersPermissionsRoleFiltersInput>
  updatedAt?: InputMaybe<DateTimeFilterInput>
}

export type UsersPermissionsPermissionInput = {
  action?: InputMaybe<Scalars['String']['input']>
  role?: InputMaybe<Scalars['ID']['input']>
}

export type UsersPermissionsPermissionRelationResponseCollection = {
  __typename?: 'UsersPermissionsPermissionRelationResponseCollection'
  data: Array<UsersPermissionsPermissionEntity>
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
  name: Scalars['String']['output']
  permissions?: Maybe<UsersPermissionsPermissionRelationResponseCollection>
  type?: Maybe<Scalars['String']['output']>
  updatedAt?: Maybe<Scalars['DateTime']['output']>
  users?: Maybe<UsersPermissionsUserRelationResponseCollection>
}

export type UsersPermissionsRolePermissionsArgs = {
  filters?: InputMaybe<UsersPermissionsPermissionFiltersInput>
  pagination?: InputMaybe<PaginationArg>
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
}

export type UsersPermissionsRoleUsersArgs = {
  filters?: InputMaybe<UsersPermissionsUserFiltersInput>
  pagination?: InputMaybe<PaginationArg>
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
}

export type UsersPermissionsRoleEntity = {
  __typename?: 'UsersPermissionsRoleEntity'
  attributes?: Maybe<UsersPermissionsRole>
  id?: Maybe<Scalars['ID']['output']>
}

export type UsersPermissionsRoleEntityResponse = {
  __typename?: 'UsersPermissionsRoleEntityResponse'
  data?: Maybe<UsersPermissionsRoleEntity>
}

export type UsersPermissionsRoleEntityResponseCollection = {
  __typename?: 'UsersPermissionsRoleEntityResponseCollection'
  data: Array<UsersPermissionsRoleEntity>
  meta: ResponseCollectionMeta
}

export type UsersPermissionsRoleFiltersInput = {
  and?: InputMaybe<Array<InputMaybe<UsersPermissionsRoleFiltersInput>>>
  createdAt?: InputMaybe<DateTimeFilterInput>
  description?: InputMaybe<StringFilterInput>
  id?: InputMaybe<IdFilterInput>
  name?: InputMaybe<StringFilterInput>
  not?: InputMaybe<UsersPermissionsRoleFiltersInput>
  or?: InputMaybe<Array<InputMaybe<UsersPermissionsRoleFiltersInput>>>
  permissions?: InputMaybe<UsersPermissionsPermissionFiltersInput>
  type?: InputMaybe<StringFilterInput>
  updatedAt?: InputMaybe<DateTimeFilterInput>
  users?: InputMaybe<UsersPermissionsUserFiltersInput>
}

export type UsersPermissionsRoleInput = {
  description?: InputMaybe<Scalars['String']['input']>
  name?: InputMaybe<Scalars['String']['input']>
  permissions?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>
  type?: InputMaybe<Scalars['String']['input']>
  users?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>
}

export type UsersPermissionsRoleRelationResponseCollection = {
  __typename?: 'UsersPermissionsRoleRelationResponseCollection'
  data: Array<UsersPermissionsRoleEntity>
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
  email: Scalars['String']['output']
  provider?: Maybe<Scalars['String']['output']>
  role?: Maybe<UsersPermissionsRoleEntityResponse>
  updatedAt?: Maybe<Scalars['DateTime']['output']>
  username: Scalars['String']['output']
}

export type UsersPermissionsUserEntity = {
  __typename?: 'UsersPermissionsUserEntity'
  attributes?: Maybe<UsersPermissionsUser>
  id?: Maybe<Scalars['ID']['output']>
}

export type UsersPermissionsUserEntityResponse = {
  __typename?: 'UsersPermissionsUserEntityResponse'
  data?: Maybe<UsersPermissionsUserEntity>
}

export type UsersPermissionsUserEntityResponseCollection = {
  __typename?: 'UsersPermissionsUserEntityResponseCollection'
  data: Array<UsersPermissionsUserEntity>
  meta: ResponseCollectionMeta
}

export type UsersPermissionsUserFiltersInput = {
  and?: InputMaybe<Array<InputMaybe<UsersPermissionsUserFiltersInput>>>
  blocked?: InputMaybe<BooleanFilterInput>
  confirmationToken?: InputMaybe<StringFilterInput>
  confirmed?: InputMaybe<BooleanFilterInput>
  createdAt?: InputMaybe<DateTimeFilterInput>
  email?: InputMaybe<StringFilterInput>
  id?: InputMaybe<IdFilterInput>
  not?: InputMaybe<UsersPermissionsUserFiltersInput>
  or?: InputMaybe<Array<InputMaybe<UsersPermissionsUserFiltersInput>>>
  password?: InputMaybe<StringFilterInput>
  provider?: InputMaybe<StringFilterInput>
  resetPasswordToken?: InputMaybe<StringFilterInput>
  role?: InputMaybe<UsersPermissionsRoleFiltersInput>
  updatedAt?: InputMaybe<DateTimeFilterInput>
  username?: InputMaybe<StringFilterInput>
}

export type UsersPermissionsUserInput = {
  blocked?: InputMaybe<Scalars['Boolean']['input']>
  confirmationToken?: InputMaybe<Scalars['String']['input']>
  confirmed?: InputMaybe<Scalars['Boolean']['input']>
  email?: InputMaybe<Scalars['String']['input']>
  password?: InputMaybe<Scalars['String']['input']>
  provider?: InputMaybe<Scalars['String']['input']>
  resetPasswordToken?: InputMaybe<Scalars['String']['input']>
  role?: InputMaybe<Scalars['ID']['input']>
  username?: InputMaybe<Scalars['String']['input']>
}

export type UsersPermissionsUserRelationResponseCollection = {
  __typename?: 'UsersPermissionsUserRelationResponseCollection'
  data: Array<UsersPermissionsUserEntity>
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
  forms?: {
    __typename?: 'FormEntityResponseCollection'
    data: Array<{
      __typename?: 'FormEntity'
      id?: string | null
      attributes?: { __typename?: 'Form'; slug: string; moreInformationUrl?: string | null } | null
    }>
  } | null
}

export type FormWithLandingPageBySlugQueryVariables = Exact<{
  slug: Scalars['String']['input']
}>

export type FormWithLandingPageBySlugQuery = {
  __typename?: 'Query'
  forms?: {
    __typename?: 'FormEntityResponseCollection'
    data: Array<{
      __typename?: 'FormEntity'
      id?: string | null
      attributes?: {
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
      } | null
    }>
  } | null
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
    __typename?: 'HelpPageEntityResponse'
    data?: {
      __typename?: 'HelpPageEntity'
      attributes?: {
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
    } | null
  } | null
}

export type HomepageQueryVariables = Exact<{ [key: string]: never }>

export type HomepageQuery = {
  __typename?: 'Query'
  homepage?: {
    __typename?: 'HomepageEntityResponse'
    data?: {
      __typename?: 'HomepageEntity'
      attributes?: {
        __typename?: 'Homepage'
        services?: {
          __typename?: 'MunicipalServiceRelationResponseCollection'
          data: Array<{
            __typename?: 'MunicipalServiceEntity'
            id?: string | null
            attributes?: {
              __typename?: 'MunicipalService'
              title: string
              description: string
              buttonText: string
              href: string
              color: Enum_Municipalservice_Color
              icon: Enum_Municipalservice_Icon
              tags?: {
                __typename?: 'MunicipalServiceTagRelationResponseCollection'
                data: Array<{
                  __typename?: 'MunicipalServiceTagEntity'
                  id?: string | null
                  attributes?: { __typename?: 'MunicipalServiceTag'; title: string } | null
                }>
              } | null
            } | null
          }>
        } | null
        servicesLegalPerson?: {
          __typename?: 'MunicipalServiceRelationResponseCollection'
          data: Array<{
            __typename?: 'MunicipalServiceEntity'
            id?: string | null
            attributes?: {
              __typename?: 'MunicipalService'
              title: string
              description: string
              buttonText: string
              href: string
              color: Enum_Municipalservice_Color
              icon: Enum_Municipalservice_Icon
              tags?: {
                __typename?: 'MunicipalServiceTagRelationResponseCollection'
                data: Array<{
                  __typename?: 'MunicipalServiceTagEntity'
                  id?: string | null
                  attributes?: { __typename?: 'MunicipalServiceTag'; title: string } | null
                }>
              } | null
            } | null
          }>
        } | null
        announcements?: {
          __typename?: 'HomepageAnnouncementRelationResponseCollection'
          data: Array<{
            __typename?: 'HomepageAnnouncementEntity'
            id?: string | null
            attributes?: {
              __typename?: 'HomepageAnnouncement'
              title: string
              description: string
              buttonText: string
              href: string
              dateFrom?: any | null
              dateTo?: any | null
              image: {
                __typename?: 'UploadFileEntityResponse'
                data?: {
                  __typename?: 'UploadFileEntity'
                  attributes?: {
                    __typename?: 'UploadFile'
                    url: string
                    alternativeText?: string | null
                  } | null
                } | null
              }
            } | null
          }>
        } | null
        announcementsLegalPerson?: {
          __typename?: 'HomepageAnnouncementRelationResponseCollection'
          data: Array<{
            __typename?: 'HomepageAnnouncementEntity'
            id?: string | null
            attributes?: {
              __typename?: 'HomepageAnnouncement'
              title: string
              description: string
              buttonText: string
              href: string
              dateFrom?: any | null
              dateTo?: any | null
              image: {
                __typename?: 'UploadFileEntityResponse'
                data?: {
                  __typename?: 'UploadFileEntity'
                  attributes?: {
                    __typename?: 'UploadFile'
                    url: string
                    alternativeText?: string | null
                  } | null
                } | null
              }
            } | null
          }>
        } | null
      } | null
    } | null
  } | null
}

export type HomepageAnnouncementEntityFragment = {
  __typename?: 'HomepageAnnouncementEntity'
  id?: string | null
  attributes?: {
    __typename?: 'HomepageAnnouncement'
    title: string
    description: string
    buttonText: string
    href: string
    dateFrom?: any | null
    dateTo?: any | null
    image: {
      __typename?: 'UploadFileEntityResponse'
      data?: {
        __typename?: 'UploadFileEntity'
        attributes?: {
          __typename?: 'UploadFile'
          url: string
          alternativeText?: string | null
        } | null
      } | null
    }
  } | null
}

export type MunicipalServiceTagEntityFragment = {
  __typename?: 'MunicipalServiceTagEntity'
  id?: string | null
  attributes?: { __typename?: 'MunicipalServiceTag'; title: string } | null
}

export type MunicipalServiceCategoryEntityFragment = {
  __typename?: 'MunicipalServiceCategoryEntity'
  id?: string | null
  attributes?: { __typename?: 'MunicipalServiceCategory'; title: string } | null
}

export type MunicipalServiceCardEntityFragment = {
  __typename?: 'MunicipalServiceEntity'
  id?: string | null
  attributes?: {
    __typename?: 'MunicipalService'
    title: string
    description: string
    buttonText: string
    href: string
    color: Enum_Municipalservice_Color
    icon: Enum_Municipalservice_Icon
    tags?: {
      __typename?: 'MunicipalServiceTagRelationResponseCollection'
      data: Array<{
        __typename?: 'MunicipalServiceTagEntity'
        id?: string | null
        attributes?: { __typename?: 'MunicipalServiceTag'; title: string } | null
      }>
    } | null
  } | null
}

export type MunicipalServiceEntityFragment = {
  __typename?: 'MunicipalServiceEntity'
  id?: string | null
  attributes?: {
    __typename?: 'MunicipalService'
    title: string
    description: string
    buttonText: string
    href: string
    color: Enum_Municipalservice_Color
    icon: Enum_Municipalservice_Icon
    categories?: {
      __typename?: 'MunicipalServiceCategoryRelationResponseCollection'
      data: Array<{
        __typename?: 'MunicipalServiceCategoryEntity'
        id?: string | null
        attributes?: { __typename?: 'MunicipalServiceCategory'; title: string } | null
      }>
    } | null
    tags?: {
      __typename?: 'MunicipalServiceTagRelationResponseCollection'
      data: Array<{
        __typename?: 'MunicipalServiceTagEntity'
        id?: string | null
        attributes?: { __typename?: 'MunicipalServiceTag'; title: string } | null
      }>
    } | null
  } | null
}

export type MunicipalServicesPageQueryVariables = Exact<{ [key: string]: never }>

export type MunicipalServicesPageQuery = {
  __typename?: 'Query'
  municipalServicesPage?: {
    __typename?: 'MunicipalServicesPageEntityResponse'
    data?: {
      __typename?: 'MunicipalServicesPageEntity'
      attributes?: {
        __typename?: 'MunicipalServicesPage'
        services?: {
          __typename?: 'MunicipalServiceRelationResponseCollection'
          data: Array<{
            __typename?: 'MunicipalServiceEntity'
            id?: string | null
            attributes?: {
              __typename?: 'MunicipalService'
              title: string
              description: string
              buttonText: string
              href: string
              color: Enum_Municipalservice_Color
              icon: Enum_Municipalservice_Icon
              categories?: {
                __typename?: 'MunicipalServiceCategoryRelationResponseCollection'
                data: Array<{
                  __typename?: 'MunicipalServiceCategoryEntity'
                  id?: string | null
                  attributes?: { __typename?: 'MunicipalServiceCategory'; title: string } | null
                }>
              } | null
              tags?: {
                __typename?: 'MunicipalServiceTagRelationResponseCollection'
                data: Array<{
                  __typename?: 'MunicipalServiceTagEntity'
                  id?: string | null
                  attributes?: { __typename?: 'MunicipalServiceTag'; title: string } | null
                }>
              } | null
            } | null
          }>
        } | null
        servicesLegalPerson?: {
          __typename?: 'MunicipalServiceRelationResponseCollection'
          data: Array<{
            __typename?: 'MunicipalServiceEntity'
            id?: string | null
            attributes?: {
              __typename?: 'MunicipalService'
              title: string
              description: string
              buttonText: string
              href: string
              color: Enum_Municipalservice_Color
              icon: Enum_Municipalservice_Icon
              categories?: {
                __typename?: 'MunicipalServiceCategoryRelationResponseCollection'
                data: Array<{
                  __typename?: 'MunicipalServiceCategoryEntity'
                  id?: string | null
                  attributes?: { __typename?: 'MunicipalServiceCategory'; title: string } | null
                }>
              } | null
              tags?: {
                __typename?: 'MunicipalServiceTagRelationResponseCollection'
                data: Array<{
                  __typename?: 'MunicipalServiceTagEntity'
                  id?: string | null
                  attributes?: { __typename?: 'MunicipalServiceTag'; title: string } | null
                }>
              } | null
            } | null
          }>
        } | null
      } | null
    } | null
  } | null
}

export type TaxFragment = {
  __typename?: 'Tax'
  accountCommunicationConsentText: string
  currentYearTaxInPreparationText?: string | null
  currentYearTaxInPreparationTitle?: string | null
  displayCurrentYearTaxInPreparation: boolean
  channelChangeEffectiveNextYearText?: string | null
  channelChangeEffectiveNextYearTitle?: string | null
  paymentSuccessFeedbackLink?: string | null
  paymentSuccessPrivacyPolicyLink?: string | null
  paymentSuccessFaqLink?: string | null
}

export type TaxQueryVariables = Exact<{ [key: string]: never }>

export type TaxQuery = {
  __typename?: 'Query'
  tax?: {
    __typename?: 'TaxEntityResponse'
    data?: {
      __typename?: 'TaxEntity'
      attributes?: {
        __typename?: 'Tax'
        accountCommunicationConsentText: string
        currentYearTaxInPreparationText?: string | null
        currentYearTaxInPreparationTitle?: string | null
        displayCurrentYearTaxInPreparation: boolean
        channelChangeEffectiveNextYearText?: string | null
        channelChangeEffectiveNextYearTitle?: string | null
        paymentSuccessFeedbackLink?: string | null
        paymentSuccessPrivacyPolicyLink?: string | null
        paymentSuccessFaqLink?: string | null
      } | null
    } | null
  } | null
}

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
  fragment HomepageAnnouncementEntity on HomepageAnnouncementEntity {
    id
    attributes {
      title
      description
      buttonText
      href
      dateFrom
      dateTo
      image {
        data {
          attributes {
            url
            alternativeText
          }
        }
      }
    }
  }
`
export const MunicipalServiceTagEntityFragmentDoc = gql`
  fragment MunicipalServiceTagEntity on MunicipalServiceTagEntity {
    id
    attributes {
      title
    }
  }
`
export const MunicipalServiceCardEntityFragmentDoc = gql`
  fragment MunicipalServiceCardEntity on MunicipalServiceEntity {
    id
    attributes {
      title
      description
      buttonText
      href
      color
      icon
      tags {
        data {
          ...MunicipalServiceTagEntity
        }
      }
    }
  }
  ${MunicipalServiceTagEntityFragmentDoc}
`
export const MunicipalServiceCategoryEntityFragmentDoc = gql`
  fragment MunicipalServiceCategoryEntity on MunicipalServiceCategoryEntity {
    id
    attributes {
      title
    }
  }
`
export const MunicipalServiceEntityFragmentDoc = gql`
  fragment MunicipalServiceEntity on MunicipalServiceEntity {
    ...MunicipalServiceCardEntity
    attributes {
      categories {
        data {
          ...MunicipalServiceCategoryEntity
        }
      }
    }
  }
  ${MunicipalServiceCardEntityFragmentDoc}
  ${MunicipalServiceCategoryEntityFragmentDoc}
`
export const TaxFragmentDoc = gql`
  fragment Tax on Tax {
    accountCommunicationConsentText
    currentYearTaxInPreparationText
    currentYearTaxInPreparationTitle
    displayCurrentYearTaxInPreparation
    channelChangeEffectiveNextYearText
    channelChangeEffectiveNextYearTitle
    paymentSuccessFeedbackLink
    paymentSuccessPrivacyPolicyLink
    paymentSuccessFaqLink
  }
`
export const FormBaseBySlugDocument = gql`
  query FormBaseBySlug($slug: String!) {
    forms(filters: { slug: { eq: $slug } }) {
      data {
        id
        attributes {
          ...FormBase
        }
      }
    }
  }
  ${FormBaseFragmentDoc}
`
export const FormWithLandingPageBySlugDocument = gql`
  query FormWithLandingPageBySlug($slug: String!) {
    forms(filters: { slug: { eq: $slug } }) {
      data {
        id
        attributes {
          ...FormWithLandingPage
        }
      }
    }
  }
  ${FormWithLandingPageFragmentDoc}
`
export const HelpPageDocument = gql`
  query HelpPage {
    helpPage {
      data {
        attributes {
          ...HelpPage
        }
      }
    }
  }
  ${HelpPageFragmentDoc}
`
export const HomepageDocument = gql`
  query Homepage {
    homepage {
      data {
        attributes {
          services(pagination: { limit: 4 }) {
            data {
              ...MunicipalServiceCardEntity
            }
          }
          servicesLegalPerson(pagination: { limit: 4 }) {
            data {
              ...MunicipalServiceCardEntity
            }
          }
          announcements {
            data {
              ...HomepageAnnouncementEntity
            }
          }
          announcementsLegalPerson {
            data {
              ...HomepageAnnouncementEntity
            }
          }
        }
      }
    }
  }
  ${MunicipalServiceCardEntityFragmentDoc}
  ${HomepageAnnouncementEntityFragmentDoc}
`
export const MunicipalServicesPageDocument = gql`
  query MunicipalServicesPage {
    municipalServicesPage {
      data {
        attributes {
          services {
            data {
              ...MunicipalServiceEntity
            }
          }
          servicesLegalPerson {
            data {
              ...MunicipalServiceEntity
            }
          }
        }
      }
    }
  }
  ${MunicipalServiceEntityFragmentDoc}
`
export const TaxDocument = gql`
  query Tax {
    tax {
      data {
        attributes {
          ...Tax
        }
      }
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

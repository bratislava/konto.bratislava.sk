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

export type GeneralInput = {
  alerts?: InputMaybe<Array<InputMaybe<ComponentGeneralAlertInput>>>
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
  | I18NLocale
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

export type HelpPageInput = {
  categories?: InputMaybe<Array<InputMaybe<ComponentBlocksHelpCategoryInput>>>
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

export type Mutation = {
  __typename?: 'Mutation'
  /** Change user password. Confirm with the current password. */
  changePassword?: Maybe<UsersPermissionsLoginPayload>
  createContentReleasesRelease?: Maybe<ContentReleasesReleaseEntityResponse>
  createContentReleasesReleaseAction?: Maybe<ContentReleasesReleaseActionEntityResponse>
  createForm?: Maybe<FormEntityResponse>
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
  i18NLocale?: Maybe<I18NLocaleEntityResponse>
  i18NLocales?: Maybe<I18NLocaleEntityResponseCollection>
  me?: Maybe<UsersPermissionsMe>
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

export type QueryI18NLocaleArgs = {
  id?: InputMaybe<Scalars['ID']['input']>
}

export type QueryI18NLocalesArgs = {
  filters?: InputMaybe<I18NLocaleFiltersInput>
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

export type TaxInput = {
  accountCommunicationConsentText?: InputMaybe<Scalars['String']['input']>
  channelChangeEffectiveNextYearText?: InputMaybe<Scalars['String']['input']>
  channelChangeEffectiveNextYearTitle?: InputMaybe<Scalars['String']['input']>
  currentYearTaxInPreparationText?: InputMaybe<Scalars['String']['input']>
  currentYearTaxInPreparationTitle?: InputMaybe<Scalars['String']['input']>
  displayCurrentYearTaxInPreparation?: InputMaybe<Scalars['Boolean']['input']>
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

export type TaxFragment = {
  __typename?: 'Tax'
  accountCommunicationConsentText: string
  currentYearTaxInPreparationText?: string | null
  currentYearTaxInPreparationTitle?: string | null
  displayCurrentYearTaxInPreparation: boolean
  channelChangeEffectiveNextYearText?: string | null
  channelChangeEffectiveNextYearTitle?: string | null
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
export const TaxFragmentDoc = gql`
  fragment Tax on Tax {
    accountCommunicationConsentText
    currentYearTaxInPreparationText
    currentYearTaxInPreparationTitle
    displayCurrentYearTaxInPreparation
    channelChangeEffectiveNextYearText
    channelChangeEffectiveNextYearTitle
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
    ): Promise<FormBaseBySlugQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<FormBaseBySlugQuery>(FormBaseBySlugDocument, variables, {
            ...requestHeaders,
            ...wrappedRequestHeaders,
          }),
        'FormBaseBySlug',
        'query',
        variables,
      )
    },
    FormWithLandingPageBySlug(
      variables: FormWithLandingPageBySlugQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
    ): Promise<FormWithLandingPageBySlugQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<FormWithLandingPageBySlugQuery>(
            FormWithLandingPageBySlugDocument,
            variables,
            { ...requestHeaders, ...wrappedRequestHeaders },
          ),
        'FormWithLandingPageBySlug',
        'query',
        variables,
      )
    },
    HelpPage(
      variables?: HelpPageQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
    ): Promise<HelpPageQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<HelpPageQuery>(HelpPageDocument, variables, {
            ...requestHeaders,
            ...wrappedRequestHeaders,
          }),
        'HelpPage',
        'query',
        variables,
      )
    },
    Tax(
      variables?: TaxQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
    ): Promise<TaxQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<TaxQuery>(TaxDocument, variables, {
            ...requestHeaders,
            ...wrappedRequestHeaders,
          }),
        'Tax',
        'query',
        variables,
      )
    },
  }
}
export type Sdk = ReturnType<typeof getSdk>

/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] }
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> =
  T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never }
import { GraphQLClient, type RequestOptions } from 'graphql-request'
import gql from 'graphql-tag'
type GraphQLClientRequestHeaders = RequestOptions['requestHeaders']
export enum Enum_Componentblocksmunicipalservicecard_Color {
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

export enum Enum_Componentblocksmunicipalservicecard_Pictogram {
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

export enum Enum_Componentsectionscontacts_Titlelevel {
  H2 = 'h2',
  H3 = 'h3',
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

export type AlertFragment = {
  id: string
  content: string
  dateFrom: string | null
  dateTo: string | null
}

export type AlertsQueryVariables = Exact<{ [key: string]: never }>

export type AlertsQuery = {
  general: {
    alerts: Array<{
      id: string
      content: string
      dateFrom: string | null
      dateTo: string | null
    } | null> | null
  } | null
}

export type FormLandingPageLinkCtaFragment = {
  __typename: 'ComponentBlocksFormLandingPageLinkCta'
  id: string
  title: string
  text: string | null
  buttonLabel: string
  url: string
}

export type FormLandingPageFormCtaFragment = {
  __typename: 'ComponentBlocksFormLandingPageFormCta'
  title: string
  text: string | null
  buttonLabel: string
}

export type FormSentPageFragment = {
  feedbackLink: string | null
  content: string | null
  isContentCentered: boolean | null
  alert: { title: string | null; content: string | null } | null
}

export type FormLandingPageFragment = {
  text: string | null
  linkCtas: Array<{
    __typename: 'ComponentBlocksFormLandingPageLinkCta'
    id: string
    title: string
    text: string | null
    buttonLabel: string
    url: string
  } | null> | null
  formCta: {
    __typename: 'ComponentBlocksFormLandingPageFormCta'
    title: string
    text: string | null
    buttonLabel: string
  } | null
}

export type FormTemporarilyDisabledFragment = {
  isTemporarilyDisabled: boolean | null
  temporarilyDisabledUntil: string | null
  temporarilyDisabledReason: string | null
}

export type FormBaseFragment = {
  slug: string
  moreInformationUrl: string | null
  isTemporarilyDisabled: boolean | null
  temporarilyDisabledUntil: string | null
  temporarilyDisabledReason: string | null
}

export type FormWithLandingPageFragment = {
  slug: string
  moreInformationUrl: string | null
  isTemporarilyDisabled: boolean | null
  temporarilyDisabledUntil: string | null
  temporarilyDisabledReason: string | null
  landingPage: {
    text: string | null
    linkCtas: Array<{
      __typename: 'ComponentBlocksFormLandingPageLinkCta'
      id: string
      title: string
      text: string | null
      buttonLabel: string
      url: string
    } | null> | null
    formCta: {
      __typename: 'ComponentBlocksFormLandingPageFormCta'
      title: string
      text: string | null
      buttonLabel: string
    } | null
  } | null
}

export type FormWithSentPageFragment = {
  slug: string
  moreInformationUrl: string | null
  isTemporarilyDisabled: boolean | null
  temporarilyDisabledUntil: string | null
  temporarilyDisabledReason: string | null
  formSentPage: {
    feedbackLink: string | null
    content: string | null
    isContentCentered: boolean | null
    alert: { title: string | null; content: string | null } | null
  } | null
}

export type FormWithSentPageBySlugQueryVariables = Exact<{
  slug: string
}>

export type FormWithSentPageBySlugQuery = {
  forms: Array<{
    documentId: string
    slug: string
    moreInformationUrl: string | null
    isTemporarilyDisabled: boolean | null
    temporarilyDisabledUntil: string | null
    temporarilyDisabledReason: string | null
    formSentPage: {
      feedbackLink: string | null
      content: string | null
      isContentCentered: boolean | null
      alert: { title: string | null; content: string | null } | null
    } | null
  } | null>
}

export type FormWithLandingPageBySlugQueryVariables = Exact<{
  slug: string
}>

export type FormWithLandingPageBySlugQuery = {
  forms: Array<{
    documentId: string
    slug: string
    moreInformationUrl: string | null
    isTemporarilyDisabled: boolean | null
    temporarilyDisabledUntil: string | null
    temporarilyDisabledReason: string | null
    landingPage: {
      text: string | null
      linkCtas: Array<{
        __typename: 'ComponentBlocksFormLandingPageLinkCta'
        id: string
        title: string
        text: string | null
        buttonLabel: string
        url: string
      } | null> | null
      formCta: {
        __typename: 'ComponentBlocksFormLandingPageFormCta'
        title: string
        text: string | null
        buttonLabel: string
      } | null
    } | null
  } | null>
}

export type CommonLinkFragment = {
  label: string | null
  url: string | null
  municipalService: {
    title: string
    slug: string
    href: string | null
    form: {
      documentId: string
      isTemporarilyDisabled: boolean | null
      temporarilyDisabledUntil: string | null
      temporarilyDisabledReason: string | null
    } | null
    sections: Array<
      | { __typename: 'ComponentSectionsContacts' }
      | { __typename: 'ComponentSectionsDocuments' }
      | { __typename: 'ComponentSectionsFaq' }
      | { __typename: 'ComponentSectionsRichtext' }
      | { __typename: 'ComponentSectionsStepper' }
      | { __typename: 'ComponentSectionsTowing' }
      | { __typename: 'Error' }
      | null
    > | null
  } | null
}

export type FooterColumnBlockFragment = {
  title: string
  links: Array<{
    label: string | null
    url: string | null
    municipalService: {
      title: string
      slug: string
      href: string | null
      form: {
        documentId: string
        isTemporarilyDisabled: boolean | null
        temporarilyDisabledUntil: string | null
        temporarilyDisabledReason: string | null
      } | null
      sections: Array<
        | { __typename: 'ComponentSectionsContacts' }
        | { __typename: 'ComponentSectionsDocuments' }
        | { __typename: 'ComponentSectionsFaq' }
        | { __typename: 'ComponentSectionsRichtext' }
        | { __typename: 'ComponentSectionsStepper' }
        | { __typename: 'ComponentSectionsTowing' }
        | { __typename: 'Error' }
        | null
      > | null
    } | null
  } | null> | null
}

export type FooterFragment = {
  facebookUrl: string | null
  instagramUrl: string | null
  youtubeUrl: string | null
  linkedinUrl: string | null
  tiktokUrl: string | null
  contactText: string | null
  columns: Array<{
    title: string
    links: Array<{
      label: string | null
      url: string | null
      municipalService: {
        title: string
        slug: string
        href: string | null
        form: {
          documentId: string
          isTemporarilyDisabled: boolean | null
          temporarilyDisabledUntil: string | null
          temporarilyDisabledReason: string | null
        } | null
        sections: Array<
          | { __typename: 'ComponentSectionsContacts' }
          | { __typename: 'ComponentSectionsDocuments' }
          | { __typename: 'ComponentSectionsFaq' }
          | { __typename: 'ComponentSectionsRichtext' }
          | { __typename: 'ComponentSectionsStepper' }
          | { __typename: 'ComponentSectionsTowing' }
          | { __typename: 'Error' }
          | null
        > | null
      } | null
    } | null> | null
  } | null> | null
  accessibilityPageLink: {
    label: string | null
    url: string | null
    municipalService: {
      title: string
      slug: string
      href: string | null
      form: {
        documentId: string
        isTemporarilyDisabled: boolean | null
        temporarilyDisabledUntil: string | null
        temporarilyDisabledReason: string | null
      } | null
      sections: Array<
        | { __typename: 'ComponentSectionsContacts' }
        | { __typename: 'ComponentSectionsDocuments' }
        | { __typename: 'ComponentSectionsFaq' }
        | { __typename: 'ComponentSectionsRichtext' }
        | { __typename: 'ComponentSectionsStepper' }
        | { __typename: 'ComponentSectionsTowing' }
        | { __typename: 'Error' }
        | null
      > | null
    } | null
  } | null
}

export type GeneralQueryVariables = Exact<{ [key: string]: never }>

export type GeneralQuery = {
  footer: {
    facebookUrl: string | null
    instagramUrl: string | null
    youtubeUrl: string | null
    linkedinUrl: string | null
    tiktokUrl: string | null
    contactText: string | null
    columns: Array<{
      title: string
      links: Array<{
        label: string | null
        url: string | null
        municipalService: {
          title: string
          slug: string
          href: string | null
          form: {
            documentId: string
            isTemporarilyDisabled: boolean | null
            temporarilyDisabledUntil: string | null
            temporarilyDisabledReason: string | null
          } | null
          sections: Array<
            | { __typename: 'ComponentSectionsContacts' }
            | { __typename: 'ComponentSectionsDocuments' }
            | { __typename: 'ComponentSectionsFaq' }
            | { __typename: 'ComponentSectionsRichtext' }
            | { __typename: 'ComponentSectionsStepper' }
            | { __typename: 'ComponentSectionsTowing' }
            | { __typename: 'Error' }
            | null
          > | null
        } | null
      } | null> | null
    } | null> | null
    accessibilityPageLink: {
      label: string | null
      url: string | null
      municipalService: {
        title: string
        slug: string
        href: string | null
        form: {
          documentId: string
          isTemporarilyDisabled: boolean | null
          temporarilyDisabledUntil: string | null
          temporarilyDisabledReason: string | null
        } | null
        sections: Array<
          | { __typename: 'ComponentSectionsContacts' }
          | { __typename: 'ComponentSectionsDocuments' }
          | { __typename: 'ComponentSectionsFaq' }
          | { __typename: 'ComponentSectionsRichtext' }
          | { __typename: 'ComponentSectionsStepper' }
          | { __typename: 'ComponentSectionsTowing' }
          | { __typename: 'Error' }
          | null
        > | null
      } | null
    } | null
  } | null
}

export type HelpItemFragment = { id: string; title: string; content: string }

export type HelpCategoryFragment = {
  id: string
  title: string
  items: Array<{ id: string; title: string; content: string } | null>
}

export type HelpPageFragment = {
  categories: Array<{
    id: string
    title: string
    items: Array<{ id: string; title: string; content: string } | null>
  } | null>
}

export type HelpPageQueryVariables = Exact<{ [key: string]: never }>

export type HelpPageQuery = {
  helpPage: {
    categories: Array<{
      id: string
      title: string
      items: Array<{ id: string; title: string; content: string } | null>
    } | null>
  } | null
}

export type HomepageQueryVariables = Exact<{ [key: string]: never }>

export type HomepageQuery = {
  homepage: {
    services: Array<{
      description: string
      buttonText: string
      color: Enum_Municipalservice_Color
      icon: Enum_Municipalservice_Icon
      documentId: string
      title: string
      slug: string
      href: string | null
      tags: Array<{ documentId: string; title: string; slug: string } | null>
      form: {
        documentId: string
        isTemporarilyDisabled: boolean | null
        temporarilyDisabledUntil: string | null
        temporarilyDisabledReason: string | null
      } | null
      sections: Array<
        | { __typename: 'ComponentSectionsContacts' }
        | { __typename: 'ComponentSectionsDocuments' }
        | { __typename: 'ComponentSectionsFaq' }
        | { __typename: 'ComponentSectionsRichtext' }
        | { __typename: 'ComponentSectionsStepper' }
        | { __typename: 'ComponentSectionsTowing' }
        | { __typename: 'Error' }
        | null
      > | null
    } | null>
    servicesLegalPerson: Array<{
      description: string
      buttonText: string
      color: Enum_Municipalservice_Color
      icon: Enum_Municipalservice_Icon
      documentId: string
      title: string
      slug: string
      href: string | null
      tags: Array<{ documentId: string; title: string; slug: string } | null>
      form: {
        documentId: string
        isTemporarilyDisabled: boolean | null
        temporarilyDisabledUntil: string | null
        temporarilyDisabledReason: string | null
      } | null
      sections: Array<
        | { __typename: 'ComponentSectionsContacts' }
        | { __typename: 'ComponentSectionsDocuments' }
        | { __typename: 'ComponentSectionsFaq' }
        | { __typename: 'ComponentSectionsRichtext' }
        | { __typename: 'ComponentSectionsStepper' }
        | { __typename: 'ComponentSectionsTowing' }
        | { __typename: 'Error' }
        | null
      > | null
    } | null>
    announcements: Array<{
      documentId: string
      title: string
      description: string
      dateFrom: string | null
      dateTo: string | null
      primaryButton: {
        label: string | null
        url: string | null
        municipalService: {
          title: string
          slug: string
          href: string | null
          form: {
            documentId: string
            isTemporarilyDisabled: boolean | null
            temporarilyDisabledUntil: string | null
            temporarilyDisabledReason: string | null
          } | null
          sections: Array<
            | { __typename: 'ComponentSectionsContacts' }
            | { __typename: 'ComponentSectionsDocuments' }
            | { __typename: 'ComponentSectionsFaq' }
            | { __typename: 'ComponentSectionsRichtext' }
            | { __typename: 'ComponentSectionsStepper' }
            | { __typename: 'ComponentSectionsTowing' }
            | { __typename: 'Error' }
            | null
          > | null
        } | null
      } | null
      image: { url: string; alternativeText: string | null }
    } | null>
    announcementsLegalPerson: Array<{
      documentId: string
      title: string
      description: string
      dateFrom: string | null
      dateTo: string | null
      primaryButton: {
        label: string | null
        url: string | null
        municipalService: {
          title: string
          slug: string
          href: string | null
          form: {
            documentId: string
            isTemporarilyDisabled: boolean | null
            temporarilyDisabledUntil: string | null
            temporarilyDisabledReason: string | null
          } | null
          sections: Array<
            | { __typename: 'ComponentSectionsContacts' }
            | { __typename: 'ComponentSectionsDocuments' }
            | { __typename: 'ComponentSectionsFaq' }
            | { __typename: 'ComponentSectionsRichtext' }
            | { __typename: 'ComponentSectionsStepper' }
            | { __typename: 'ComponentSectionsTowing' }
            | { __typename: 'Error' }
            | null
          > | null
        } | null
      } | null
      image: { url: string; alternativeText: string | null }
    } | null>
  } | null
}

export type HomepageAnnouncementEntityFragment = {
  documentId: string
  title: string
  description: string
  dateFrom: string | null
  dateTo: string | null
  primaryButton: {
    label: string | null
    url: string | null
    municipalService: {
      title: string
      slug: string
      href: string | null
      form: {
        documentId: string
        isTemporarilyDisabled: boolean | null
        temporarilyDisabledUntil: string | null
        temporarilyDisabledReason: string | null
      } | null
      sections: Array<
        | { __typename: 'ComponentSectionsContacts' }
        | { __typename: 'ComponentSectionsDocuments' }
        | { __typename: 'ComponentSectionsFaq' }
        | { __typename: 'ComponentSectionsRichtext' }
        | { __typename: 'ComponentSectionsStepper' }
        | { __typename: 'ComponentSectionsTowing' }
        | { __typename: 'Error' }
        | null
      > | null
    } | null
  } | null
  image: { url: string; alternativeText: string | null }
}

export type MunicipalChargeFragment = {
  documentId: string
  title: string
  slug: string
  feedbackLink: string | null
}

export type MunicipalChargeConfigFragment = {
  deliveryMethod: {
    consentText: string
    deliveryMethodChangePendingAlert: { title: string | null; content: string | null } | null
  }
  municipalChargeIdentifier: {
    dzn: { documentId: string; title: string; slug: string; feedbackLink: string | null } | null
    ko: { documentId: string; title: string; slug: string; feedbackLink: string | null } | null
  } | null
}

export type DeliveryMethodFragment = {
  consentText: string
  deliveryMethodChangePendingAlert: { title: string | null; content: string | null } | null
}

export type MunicipalChargeConfigQueryVariables = Exact<{ [key: string]: never }>

export type MunicipalChargeConfigQuery = {
  municipalChargeConfig: {
    deliveryMethod: {
      consentText: string
      deliveryMethodChangePendingAlert: { title: string | null; content: string | null } | null
    }
    municipalChargeIdentifier: {
      dzn: { documentId: string; title: string; slug: string; feedbackLink: string | null } | null
      ko: { documentId: string; title: string; slug: string; feedbackLink: string | null } | null
    } | null
  } | null
}

export type MunicipalServiceTagEntityFragment = { documentId: string; title: string; slug: string }

export type MunicipalServiceCategoryEntityFragment = {
  documentId: string
  title: string
  slug: string
}

export type MunicipalServiceRedirectFragment = {
  slug: string
  href: string | null
  form: {
    documentId: string
    isTemporarilyDisabled: boolean | null
    temporarilyDisabledUntil: string | null
    temporarilyDisabledReason: string | null
  } | null
  sections: Array<
    | { __typename: 'ComponentSectionsContacts' }
    | { __typename: 'ComponentSectionsDocuments' }
    | { __typename: 'ComponentSectionsFaq' }
    | { __typename: 'ComponentSectionsRichtext' }
    | { __typename: 'ComponentSectionsStepper' }
    | { __typename: 'ComponentSectionsTowing' }
    | { __typename: 'Error' }
    | null
  > | null
}

export type MunicipalServiceLinkFragment = { id: string; label: string | null; url: string | null }

export type MunicipalServiceCardFragment = {
  id: string
  overrideTitle: string | null
  text: string
  linkLabel: string
  pictogram: Enum_Componentblocksmunicipalservicecard_Pictogram
  color: Enum_Componentblocksmunicipalservicecard_Color
}

export type MunicipalServiceSlugEntityFragment = { documentId: string; title: string; slug: string }

export type MunicipalServiceCardEntityFragment = {
  description: string
  buttonText: string
  color: Enum_Municipalservice_Color
  icon: Enum_Municipalservice_Icon
  documentId: string
  title: string
  slug: string
  href: string | null
  tags: Array<{ documentId: string; title: string; slug: string } | null>
  form: {
    documentId: string
    isTemporarilyDisabled: boolean | null
    temporarilyDisabledUntil: string | null
    temporarilyDisabledReason: string | null
  } | null
  sections: Array<
    | { __typename: 'ComponentSectionsContacts' }
    | { __typename: 'ComponentSectionsDocuments' }
    | { __typename: 'ComponentSectionsFaq' }
    | { __typename: 'ComponentSectionsRichtext' }
    | { __typename: 'ComponentSectionsStepper' }
    | { __typename: 'ComponentSectionsTowing' }
    | { __typename: 'Error' }
    | null
  > | null
}

export type MunicipalServiceEntityFragment = {
  pageHeaderText: string | null
  moreInformationUrl: string | null
  formButtonLabel: string | null
  description: string
  buttonText: string
  color: Enum_Municipalservice_Color
  icon: Enum_Municipalservice_Icon
  documentId: string
  title: string
  slug: string
  href: string | null
  form: {
    documentId: string
    isTemporarilyDisabled: boolean | null
    temporarilyDisabledUntil: string | null
    temporarilyDisabledReason: string | null
    slug: string
    moreInformationUrl: string | null
    landingPage: {
      text: string | null
      linkCtas: Array<{
        __typename: 'ComponentBlocksFormLandingPageLinkCta'
        id: string
        title: string
        text: string | null
        buttonLabel: string
        url: string
      } | null> | null
      formCta: {
        __typename: 'ComponentBlocksFormLandingPageFormCta'
        title: string
        text: string | null
        buttonLabel: string
      } | null
    } | null
  } | null
  categories: Array<{ documentId: string; title: string; slug: string } | null>
  links: Array<{ id: string; label: string | null; url: string | null } | null> | null
  sections: Array<
    | {
        __typename: 'ComponentSectionsContacts'
        id: string
        title: string | null
        description: string | null
        titleLevelContacts: Enum_Componentsectionscontacts_Titlelevel | null
        addressContacts: Array<{ overrideLabel: string | null; value: string } | null> | null
        openingHoursContacts: Array<{ overrideLabel: string | null; value: string } | null> | null
        emailContacts: Array<{ overrideLabel: string | null; value: string } | null> | null
        phoneContacts: Array<{ overrideLabel: string | null; value: string } | null> | null
        webContacts: Array<{ overrideLabel: string | null; value: string } | null> | null
        postalAddressContacts: Array<{ overrideLabel: string | null; value: string } | null> | null
        billingInfoContacts: Array<{ overrideLabel: string | null; value: string } | null> | null
        bankConnectionContacts: Array<{ overrideLabel: string | null; value: string } | null> | null
        personContacts: Array<{
          title: string
          subtext: string | null
          email: string | null
          phone: string | null
        } | null> | null
        directionsContact: {
          overrideLabel: string | null
          address: string
          parkingInfo: string | null
          publicTransportInfo: string | null
          barrierFreeInfo: string | null
          iframeUrl: string | null
        } | null
      }
    | {
        __typename: 'ComponentSectionsDocuments'
        allowCollapsingDocuments: boolean | null
        title: string | null
        text: string | null
        externalDocuments: Array<{ title: string | null; url: string } | null> | null
      }
    | {
        __typename: 'ComponentSectionsFaq'
        title: string | null
        questions: Array<{ title: string; content: string } | null>
      }
    | { __typename: 'ComponentSectionsRichtext'; content: string | null }
    | {
        __typename: 'ComponentSectionsStepper'
        title: string | null
        description: string | null
        checklists: Array<{
          title: string | null
          description: string | null
          checklistItems: Array<{ title: string | null; content: string | null } | null> | null
        } | null> | null
      }
    | { __typename: 'ComponentSectionsTowing'; title: string | null; text: string | null }
    | { __typename: 'Error' }
    | null
  > | null
  tags: Array<{ documentId: string; title: string; slug: string } | null>
}

export type MunicipalServiceBySlugQueryVariables = Exact<{
  slug: string
}>

export type MunicipalServiceBySlugQuery = {
  municipalServices: Array<{
    pageHeaderText: string | null
    moreInformationUrl: string | null
    formButtonLabel: string | null
    description: string
    buttonText: string
    color: Enum_Municipalservice_Color
    icon: Enum_Municipalservice_Icon
    documentId: string
    title: string
    slug: string
    href: string | null
    form: {
      documentId: string
      isTemporarilyDisabled: boolean | null
      temporarilyDisabledUntil: string | null
      temporarilyDisabledReason: string | null
      slug: string
      moreInformationUrl: string | null
      landingPage: {
        text: string | null
        linkCtas: Array<{
          __typename: 'ComponentBlocksFormLandingPageLinkCta'
          id: string
          title: string
          text: string | null
          buttonLabel: string
          url: string
        } | null> | null
        formCta: {
          __typename: 'ComponentBlocksFormLandingPageFormCta'
          title: string
          text: string | null
          buttonLabel: string
        } | null
      } | null
    } | null
    categories: Array<{ documentId: string; title: string; slug: string } | null>
    links: Array<{ id: string; label: string | null; url: string | null } | null> | null
    sections: Array<
      | {
          __typename: 'ComponentSectionsContacts'
          id: string
          title: string | null
          description: string | null
          titleLevelContacts: Enum_Componentsectionscontacts_Titlelevel | null
          addressContacts: Array<{ overrideLabel: string | null; value: string } | null> | null
          openingHoursContacts: Array<{ overrideLabel: string | null; value: string } | null> | null
          emailContacts: Array<{ overrideLabel: string | null; value: string } | null> | null
          phoneContacts: Array<{ overrideLabel: string | null; value: string } | null> | null
          webContacts: Array<{ overrideLabel: string | null; value: string } | null> | null
          postalAddressContacts: Array<{
            overrideLabel: string | null
            value: string
          } | null> | null
          billingInfoContacts: Array<{ overrideLabel: string | null; value: string } | null> | null
          bankConnectionContacts: Array<{
            overrideLabel: string | null
            value: string
          } | null> | null
          personContacts: Array<{
            title: string
            subtext: string | null
            email: string | null
            phone: string | null
          } | null> | null
          directionsContact: {
            overrideLabel: string | null
            address: string
            parkingInfo: string | null
            publicTransportInfo: string | null
            barrierFreeInfo: string | null
            iframeUrl: string | null
          } | null
        }
      | {
          __typename: 'ComponentSectionsDocuments'
          allowCollapsingDocuments: boolean | null
          title: string | null
          text: string | null
          externalDocuments: Array<{ title: string | null; url: string } | null> | null
        }
      | {
          __typename: 'ComponentSectionsFaq'
          title: string | null
          questions: Array<{ title: string; content: string } | null>
        }
      | { __typename: 'ComponentSectionsRichtext'; content: string | null }
      | {
          __typename: 'ComponentSectionsStepper'
          title: string | null
          description: string | null
          checklists: Array<{
            title: string | null
            description: string | null
            checklistItems: Array<{ title: string | null; content: string | null } | null> | null
          } | null> | null
        }
      | { __typename: 'ComponentSectionsTowing'; title: string | null; text: string | null }
      | { __typename: 'Error' }
      | null
    > | null
    tags: Array<{ documentId: string; title: string; slug: string } | null>
  } | null>
}

export type MunicipalServicesStaticPathsForSitemapQueryVariables = Exact<{
  limit?: number | null | undefined
}>

export type MunicipalServicesStaticPathsForSitemapQuery = {
  municipalServices: Array<{ documentId: string; slug: string; updatedAt: string | null } | null>
}

export type MunicipalServicesPageQueryVariables = Exact<{ [key: string]: never }>

export type MunicipalServicesPageQuery = {
  municipalServicesPage: {
    services: Array<{
      pageHeaderText: string | null
      moreInformationUrl: string | null
      formButtonLabel: string | null
      description: string
      buttonText: string
      color: Enum_Municipalservice_Color
      icon: Enum_Municipalservice_Icon
      documentId: string
      title: string
      slug: string
      href: string | null
      form: {
        documentId: string
        isTemporarilyDisabled: boolean | null
        temporarilyDisabledUntil: string | null
        temporarilyDisabledReason: string | null
        slug: string
        moreInformationUrl: string | null
        landingPage: {
          text: string | null
          linkCtas: Array<{
            __typename: 'ComponentBlocksFormLandingPageLinkCta'
            id: string
            title: string
            text: string | null
            buttonLabel: string
            url: string
          } | null> | null
          formCta: {
            __typename: 'ComponentBlocksFormLandingPageFormCta'
            title: string
            text: string | null
            buttonLabel: string
          } | null
        } | null
      } | null
      categories: Array<{ documentId: string; title: string; slug: string } | null>
      links: Array<{ id: string; label: string | null; url: string | null } | null> | null
      sections: Array<
        | {
            __typename: 'ComponentSectionsContacts'
            id: string
            title: string | null
            description: string | null
            titleLevelContacts: Enum_Componentsectionscontacts_Titlelevel | null
            addressContacts: Array<{ overrideLabel: string | null; value: string } | null> | null
            openingHoursContacts: Array<{
              overrideLabel: string | null
              value: string
            } | null> | null
            emailContacts: Array<{ overrideLabel: string | null; value: string } | null> | null
            phoneContacts: Array<{ overrideLabel: string | null; value: string } | null> | null
            webContacts: Array<{ overrideLabel: string | null; value: string } | null> | null
            postalAddressContacts: Array<{
              overrideLabel: string | null
              value: string
            } | null> | null
            billingInfoContacts: Array<{
              overrideLabel: string | null
              value: string
            } | null> | null
            bankConnectionContacts: Array<{
              overrideLabel: string | null
              value: string
            } | null> | null
            personContacts: Array<{
              title: string
              subtext: string | null
              email: string | null
              phone: string | null
            } | null> | null
            directionsContact: {
              overrideLabel: string | null
              address: string
              parkingInfo: string | null
              publicTransportInfo: string | null
              barrierFreeInfo: string | null
              iframeUrl: string | null
            } | null
          }
        | {
            __typename: 'ComponentSectionsDocuments'
            allowCollapsingDocuments: boolean | null
            title: string | null
            text: string | null
            externalDocuments: Array<{ title: string | null; url: string } | null> | null
          }
        | {
            __typename: 'ComponentSectionsFaq'
            title: string | null
            questions: Array<{ title: string; content: string } | null>
          }
        | { __typename: 'ComponentSectionsRichtext'; content: string | null }
        | {
            __typename: 'ComponentSectionsStepper'
            title: string | null
            description: string | null
            checklists: Array<{
              title: string | null
              description: string | null
              checklistItems: Array<{ title: string | null; content: string | null } | null> | null
            } | null> | null
          }
        | { __typename: 'ComponentSectionsTowing'; title: string | null; text: string | null }
        | { __typename: 'Error' }
        | null
      > | null
      tags: Array<{ documentId: string; title: string; slug: string } | null>
    } | null>
    servicesLegalPerson: Array<{
      pageHeaderText: string | null
      moreInformationUrl: string | null
      formButtonLabel: string | null
      description: string
      buttonText: string
      color: Enum_Municipalservice_Color
      icon: Enum_Municipalservice_Icon
      documentId: string
      title: string
      slug: string
      href: string | null
      form: {
        documentId: string
        isTemporarilyDisabled: boolean | null
        temporarilyDisabledUntil: string | null
        temporarilyDisabledReason: string | null
        slug: string
        moreInformationUrl: string | null
        landingPage: {
          text: string | null
          linkCtas: Array<{
            __typename: 'ComponentBlocksFormLandingPageLinkCta'
            id: string
            title: string
            text: string | null
            buttonLabel: string
            url: string
          } | null> | null
          formCta: {
            __typename: 'ComponentBlocksFormLandingPageFormCta'
            title: string
            text: string | null
            buttonLabel: string
          } | null
        } | null
      } | null
      categories: Array<{ documentId: string; title: string; slug: string } | null>
      links: Array<{ id: string; label: string | null; url: string | null } | null> | null
      sections: Array<
        | {
            __typename: 'ComponentSectionsContacts'
            id: string
            title: string | null
            description: string | null
            titleLevelContacts: Enum_Componentsectionscontacts_Titlelevel | null
            addressContacts: Array<{ overrideLabel: string | null; value: string } | null> | null
            openingHoursContacts: Array<{
              overrideLabel: string | null
              value: string
            } | null> | null
            emailContacts: Array<{ overrideLabel: string | null; value: string } | null> | null
            phoneContacts: Array<{ overrideLabel: string | null; value: string } | null> | null
            webContacts: Array<{ overrideLabel: string | null; value: string } | null> | null
            postalAddressContacts: Array<{
              overrideLabel: string | null
              value: string
            } | null> | null
            billingInfoContacts: Array<{
              overrideLabel: string | null
              value: string
            } | null> | null
            bankConnectionContacts: Array<{
              overrideLabel: string | null
              value: string
            } | null> | null
            personContacts: Array<{
              title: string
              subtext: string | null
              email: string | null
              phone: string | null
            } | null> | null
            directionsContact: {
              overrideLabel: string | null
              address: string
              parkingInfo: string | null
              publicTransportInfo: string | null
              barrierFreeInfo: string | null
              iframeUrl: string | null
            } | null
          }
        | {
            __typename: 'ComponentSectionsDocuments'
            allowCollapsingDocuments: boolean | null
            title: string | null
            text: string | null
            externalDocuments: Array<{ title: string | null; url: string } | null> | null
          }
        | {
            __typename: 'ComponentSectionsFaq'
            title: string | null
            questions: Array<{ title: string; content: string } | null>
          }
        | { __typename: 'ComponentSectionsRichtext'; content: string | null }
        | {
            __typename: 'ComponentSectionsStepper'
            title: string | null
            description: string | null
            checklists: Array<{
              title: string | null
              description: string | null
              checklistItems: Array<{ title: string | null; content: string | null } | null> | null
            } | null> | null
          }
        | { __typename: 'ComponentSectionsTowing'; title: string | null; text: string | null }
        | { __typename: 'Error' }
        | null
      > | null
      tags: Array<{ documentId: string; title: string; slug: string } | null>
    } | null>
  } | null
}

export type RichtextSectionFragment = { content: string | null }

export type ChecklistItemFragment = { title: string | null; content: string | null }

export type ChecklistFragment = {
  title: string | null
  description: string | null
  checklistItems: Array<{ title: string | null; content: string | null } | null> | null
}

export type StepperSectionFragment = {
  title: string | null
  description: string | null
  checklists: Array<{
    title: string | null
    description: string | null
    checklistItems: Array<{ title: string | null; content: string | null } | null> | null
  } | null> | null
}

export type ContactCardBlockFragment = { overrideLabel: string | null; value: string }

export type ContactPersonCardBlockFragment = {
  title: string
  subtext: string | null
  email: string | null
  phone: string | null
}

export type ContactDirectionsCardBlockFragment = {
  overrideLabel: string | null
  address: string
  parkingInfo: string | null
  publicTransportInfo: string | null
  barrierFreeInfo: string | null
  iframeUrl: string | null
}

export type ContactsSectionFragment = {
  id: string
  title: string | null
  description: string | null
  titleLevelContacts: Enum_Componentsectionscontacts_Titlelevel | null
  addressContacts: Array<{ overrideLabel: string | null; value: string } | null> | null
  openingHoursContacts: Array<{ overrideLabel: string | null; value: string } | null> | null
  emailContacts: Array<{ overrideLabel: string | null; value: string } | null> | null
  phoneContacts: Array<{ overrideLabel: string | null; value: string } | null> | null
  webContacts: Array<{ overrideLabel: string | null; value: string } | null> | null
  postalAddressContacts: Array<{ overrideLabel: string | null; value: string } | null> | null
  billingInfoContacts: Array<{ overrideLabel: string | null; value: string } | null> | null
  bankConnectionContacts: Array<{ overrideLabel: string | null; value: string } | null> | null
  personContacts: Array<{
    title: string
    subtext: string | null
    email: string | null
    phone: string | null
  } | null> | null
  directionsContact: {
    overrideLabel: string | null
    address: string
    parkingInfo: string | null
    publicTransportInfo: string | null
    barrierFreeInfo: string | null
    iframeUrl: string | null
  } | null
}

export type QuestionFragment = { title: string; content: string }

export type FaqSectionFragment = {
  title: string | null
  questions: Array<{ title: string; content: string } | null>
}

export type ExternalDocumentBlockFragment = { title: string | null; url: string }

export type DocumentsSectionFragment = {
  allowCollapsingDocuments: boolean | null
  title: string | null
  text: string | null
  externalDocuments: Array<{ title: string | null; url: string } | null> | null
}

export type TowingSectionFragment = { title: string | null; text: string | null }

type MunicipalServiceSections_ComponentSectionsContacts_Fragment = {
  __typename: 'ComponentSectionsContacts'
  id: string
  title: string | null
  description: string | null
  titleLevelContacts: Enum_Componentsectionscontacts_Titlelevel | null
  addressContacts: Array<{ overrideLabel: string | null; value: string } | null> | null
  openingHoursContacts: Array<{ overrideLabel: string | null; value: string } | null> | null
  emailContacts: Array<{ overrideLabel: string | null; value: string } | null> | null
  phoneContacts: Array<{ overrideLabel: string | null; value: string } | null> | null
  webContacts: Array<{ overrideLabel: string | null; value: string } | null> | null
  postalAddressContacts: Array<{ overrideLabel: string | null; value: string } | null> | null
  billingInfoContacts: Array<{ overrideLabel: string | null; value: string } | null> | null
  bankConnectionContacts: Array<{ overrideLabel: string | null; value: string } | null> | null
  personContacts: Array<{
    title: string
    subtext: string | null
    email: string | null
    phone: string | null
  } | null> | null
  directionsContact: {
    overrideLabel: string | null
    address: string
    parkingInfo: string | null
    publicTransportInfo: string | null
    barrierFreeInfo: string | null
    iframeUrl: string | null
  } | null
}

type MunicipalServiceSections_ComponentSectionsDocuments_Fragment = {
  __typename: 'ComponentSectionsDocuments'
  allowCollapsingDocuments: boolean | null
  title: string | null
  text: string | null
  externalDocuments: Array<{ title: string | null; url: string } | null> | null
}

type MunicipalServiceSections_ComponentSectionsFaq_Fragment = {
  __typename: 'ComponentSectionsFaq'
  title: string | null
  questions: Array<{ title: string; content: string } | null>
}

type MunicipalServiceSections_ComponentSectionsRichtext_Fragment = {
  __typename: 'ComponentSectionsRichtext'
  content: string | null
}

type MunicipalServiceSections_ComponentSectionsStepper_Fragment = {
  __typename: 'ComponentSectionsStepper'
  title: string | null
  description: string | null
  checklists: Array<{
    title: string | null
    description: string | null
    checklistItems: Array<{ title: string | null; content: string | null } | null> | null
  } | null> | null
}

type MunicipalServiceSections_ComponentSectionsTowing_Fragment = {
  __typename: 'ComponentSectionsTowing'
  title: string | null
  text: string | null
}

type MunicipalServiceSections_Error_Fragment = { __typename: 'Error' }

export type MunicipalServiceSectionsFragment =
  | MunicipalServiceSections_ComponentSectionsContacts_Fragment
  | MunicipalServiceSections_ComponentSectionsDocuments_Fragment
  | MunicipalServiceSections_ComponentSectionsFaq_Fragment
  | MunicipalServiceSections_ComponentSectionsRichtext_Fragment
  | MunicipalServiceSections_ComponentSectionsStepper_Fragment
  | MunicipalServiceSections_ComponentSectionsTowing_Fragment
  | MunicipalServiceSections_Error_Fragment

export const AlertFragmentDoc = gql`
  fragment Alert on ComponentGeneralAlert {
    id
    content
    dateFrom
    dateTo
  }
`
export const FormTemporarilyDisabledFragmentDoc = gql`
  fragment FormTemporarilyDisabled on Form {
    isTemporarilyDisabled
    temporarilyDisabledUntil
    temporarilyDisabledReason
  }
`
export const FormBaseFragmentDoc = gql`
  fragment FormBase on Form {
    slug
    moreInformationUrl
    ...FormTemporarilyDisabled
  }
  ${FormTemporarilyDisabledFragmentDoc}
`
export const FormSentPageFragmentDoc = gql`
  fragment FormSentPage on ComponentBlocksFormSentPage {
    feedbackLink
    content
    isContentCentered
    alert {
      title
      content
    }
  }
`
export const FormWithSentPageFragmentDoc = gql`
  fragment FormWithSentPage on Form {
    ...FormBase
    formSentPage {
      ...FormSentPage
    }
  }
  ${FormBaseFragmentDoc}
  ${FormSentPageFragmentDoc}
`
export const MunicipalServiceRedirectFragmentDoc = gql`
  fragment MunicipalServiceRedirect on MunicipalService {
    slug
    href
    form {
      documentId
      ...FormTemporarilyDisabled
    }
    sections {
      __typename
    }
  }
  ${FormTemporarilyDisabledFragmentDoc}
`
export const CommonLinkFragmentDoc = gql`
  fragment CommonLink on ComponentBlocksCommonLink {
    label
    municipalService {
      title
      ...MunicipalServiceRedirect
    }
    url
  }
  ${MunicipalServiceRedirectFragmentDoc}
`
export const FooterColumnBlockFragmentDoc = gql`
  fragment FooterColumnBlock on ComponentBlocksFooterColumn {
    title
    links {
      ...CommonLink
    }
  }
  ${CommonLinkFragmentDoc}
`
export const FooterFragmentDoc = gql`
  fragment Footer on Footer {
    facebookUrl
    instagramUrl
    youtubeUrl
    linkedinUrl
    tiktokUrl
    columns {
      ...FooterColumnBlock
    }
    accessibilityPageLink {
      ...CommonLink
    }
    contactText
  }
  ${FooterColumnBlockFragmentDoc}
  ${CommonLinkFragmentDoc}
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
    primaryButton {
      ...CommonLink
    }
    dateFrom
    dateTo
    image {
      url
      alternativeText
    }
  }
  ${CommonLinkFragmentDoc}
`
export const DeliveryMethodFragmentDoc = gql`
  fragment DeliveryMethod on ComponentMunicipalChargeDeliveryMethod {
    consentText
    deliveryMethodChangePendingAlert {
      title
      content
    }
  }
`
export const MunicipalChargeFragmentDoc = gql`
  fragment MunicipalCharge on MunicipalCharge {
    documentId
    title
    slug
    feedbackLink
  }
`
export const MunicipalChargeConfigFragmentDoc = gql`
  fragment MunicipalChargeConfig on MunicipalChargeConfig {
    deliveryMethod {
      ...DeliveryMethod
    }
    municipalChargeIdentifier {
      dzn {
        ...MunicipalCharge
      }
      ko {
        ...MunicipalCharge
      }
    }
  }
  ${DeliveryMethodFragmentDoc}
  ${MunicipalChargeFragmentDoc}
`
export const MunicipalServiceCardFragmentDoc = gql`
  fragment MunicipalServiceCard on ComponentBlocksMunicipalServiceCard {
    id
    overrideTitle
    text
    linkLabel
    pictogram
    color
  }
`
export const MunicipalServiceSlugEntityFragmentDoc = gql`
  fragment MunicipalServiceSlugEntity on MunicipalService {
    documentId
    title
    slug
  }
`
export const MunicipalServiceTagEntityFragmentDoc = gql`
  fragment MunicipalServiceTagEntity on MunicipalServiceTag {
    documentId
    title
    slug
  }
`
export const MunicipalServiceCardEntityFragmentDoc = gql`
  fragment MunicipalServiceCardEntity on MunicipalService {
    ...MunicipalServiceSlugEntity
    description
    buttonText
    color
    icon
    ...MunicipalServiceRedirect
    tags {
      ...MunicipalServiceTagEntity
    }
  }
  ${MunicipalServiceSlugEntityFragmentDoc}
  ${MunicipalServiceRedirectFragmentDoc}
  ${MunicipalServiceTagEntityFragmentDoc}
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
export const MunicipalServiceCategoryEntityFragmentDoc = gql`
  fragment MunicipalServiceCategoryEntity on MunicipalServiceCategory {
    documentId
    title
    slug
  }
`
export const MunicipalServiceLinkFragmentDoc = gql`
  fragment MunicipalServiceLink on ComponentBlocksMunicipalServiceLink {
    id
    label
    url
  }
`
export const RichtextSectionFragmentDoc = gql`
  fragment RichtextSection on ComponentSectionsRichtext {
    content
  }
`
export const ChecklistItemFragmentDoc = gql`
  fragment ChecklistItem on ComponentBlocksChecklistItem {
    title
    content
  }
`
export const ChecklistFragmentDoc = gql`
  fragment Checklist on ComponentBlocksChecklist {
    title
    description
    checklistItems {
      ...ChecklistItem
    }
  }
  ${ChecklistItemFragmentDoc}
`
export const StepperSectionFragmentDoc = gql`
  fragment StepperSection on ComponentSectionsStepper {
    title
    description
    checklists {
      ...Checklist
    }
  }
  ${ChecklistFragmentDoc}
`
export const ContactCardBlockFragmentDoc = gql`
  fragment ContactCardBlock on ComponentBlocksContactCard {
    overrideLabel
    value
  }
`
export const ContactPersonCardBlockFragmentDoc = gql`
  fragment ContactPersonCardBlock on ComponentBlocksContactPersonCard {
    title
    subtext
    email
    phone
  }
`
export const ContactDirectionsCardBlockFragmentDoc = gql`
  fragment ContactDirectionsCardBlock on ComponentBlocksContactDirectionsCard {
    overrideLabel
    address
    parkingInfo
    publicTransportInfo
    barrierFreeInfo
    iframeUrl
  }
`
export const ContactsSectionFragmentDoc = gql`
  fragment ContactsSection on ComponentSectionsContacts {
    id
    title
    description
    addressContacts {
      ...ContactCardBlock
    }
    openingHoursContacts {
      ...ContactCardBlock
    }
    emailContacts {
      ...ContactCardBlock
    }
    phoneContacts {
      ...ContactCardBlock
    }
    webContacts {
      ...ContactCardBlock
    }
    postalAddressContacts {
      ...ContactCardBlock
    }
    billingInfoContacts {
      ...ContactCardBlock
    }
    bankConnectionContacts {
      ...ContactCardBlock
    }
    personContacts {
      ...ContactPersonCardBlock
    }
    directionsContact {
      ...ContactDirectionsCardBlock
    }
    titleLevelContacts: titleLevel
  }
  ${ContactCardBlockFragmentDoc}
  ${ContactPersonCardBlockFragmentDoc}
  ${ContactDirectionsCardBlockFragmentDoc}
`
export const QuestionFragmentDoc = gql`
  fragment Question on ComponentBlocksQuestion {
    title
    content
  }
`
export const FaqSectionFragmentDoc = gql`
  fragment FaqSection on ComponentSectionsFaq {
    title
    questions {
      ...Question
    }
  }
  ${QuestionFragmentDoc}
`
export const ExternalDocumentBlockFragmentDoc = gql`
  fragment ExternalDocumentBlock on ComponentBlocksExternalDocument {
    title
    url
  }
`
export const DocumentsSectionFragmentDoc = gql`
  fragment DocumentsSection on ComponentSectionsDocuments {
    allowCollapsingDocuments
    title
    text
    externalDocuments {
      ...ExternalDocumentBlock
    }
  }
  ${ExternalDocumentBlockFragmentDoc}
`
export const TowingSectionFragmentDoc = gql`
  fragment TowingSection on ComponentSectionsTowing {
    title
    text
  }
`
export const MunicipalServiceSectionsFragmentDoc = gql`
  fragment MunicipalServiceSections on MunicipalServiceSectionsDynamicZone {
    __typename
    ... on ComponentSectionsRichtext {
      ...RichtextSection
    }
    ... on ComponentSectionsStepper {
      ...StepperSection
    }
    ... on ComponentSectionsContacts {
      ...ContactsSection
    }
    ... on ComponentSectionsFaq {
      ...FaqSection
    }
    ... on ComponentSectionsDocuments {
      ...DocumentsSection
    }
    ... on ComponentSectionsTowing {
      ...TowingSection
    }
  }
  ${RichtextSectionFragmentDoc}
  ${StepperSectionFragmentDoc}
  ${ContactsSectionFragmentDoc}
  ${FaqSectionFragmentDoc}
  ${DocumentsSectionFragmentDoc}
  ${TowingSectionFragmentDoc}
`
export const MunicipalServiceEntityFragmentDoc = gql`
  fragment MunicipalServiceEntity on MunicipalService {
    ...MunicipalServiceCardEntity
    pageHeaderText
    moreInformationUrl
    formButtonLabel
    form {
      ...FormWithLandingPage
    }
    categories {
      ...MunicipalServiceCategoryEntity
    }
    links {
      ...MunicipalServiceLink
    }
    sections {
      ...MunicipalServiceSections
    }
  }
  ${MunicipalServiceCardEntityFragmentDoc}
  ${FormWithLandingPageFragmentDoc}
  ${MunicipalServiceCategoryEntityFragmentDoc}
  ${MunicipalServiceLinkFragmentDoc}
  ${MunicipalServiceSectionsFragmentDoc}
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
export const FormWithSentPageBySlugDocument = gql`
  query FormWithSentPageBySlug($slug: String!) {
    forms(filters: { slug: { eq: $slug } }) {
      documentId
      ...FormWithSentPage
    }
  }
  ${FormWithSentPageFragmentDoc}
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
export const GeneralDocument = gql`
  query General {
    footer {
      ...Footer
    }
  }
  ${FooterFragmentDoc}
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
export const MunicipalChargeConfigDocument = gql`
  query MunicipalChargeConfig {
    municipalChargeConfig {
      ...MunicipalChargeConfig
    }
  }
  ${MunicipalChargeConfigFragmentDoc}
`
export const MunicipalServiceBySlugDocument = gql`
  query MunicipalServiceBySlug($slug: String!) {
    municipalServices(filters: { slug: { eq: $slug } }) {
      ...MunicipalServiceEntity
    }
  }
  ${MunicipalServiceEntityFragmentDoc}
`
export const MunicipalServicesStaticPathsForSitemapDocument = gql`
  query MunicipalServicesStaticPathsForSitemap($limit: Int = -1) {
    municipalServices(sort: "createdAt:desc", pagination: { limit: $limit }) {
      documentId
      slug
      updatedAt
    }
  }
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
    FormWithSentPageBySlug(
      variables: FormWithSentPageBySlugQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit['signal'],
    ): Promise<FormWithSentPageBySlugQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<FormWithSentPageBySlugQuery>({
            document: FormWithSentPageBySlugDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        'FormWithSentPageBySlug',
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
    General(
      variables?: GeneralQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit['signal'],
    ): Promise<GeneralQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<GeneralQuery>({
            document: GeneralDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        'General',
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
    MunicipalChargeConfig(
      variables?: MunicipalChargeConfigQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit['signal'],
    ): Promise<MunicipalChargeConfigQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<MunicipalChargeConfigQuery>({
            document: MunicipalChargeConfigDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        'MunicipalChargeConfig',
        'query',
        variables,
      )
    },
    MunicipalServiceBySlug(
      variables: MunicipalServiceBySlugQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit['signal'],
    ): Promise<MunicipalServiceBySlugQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<MunicipalServiceBySlugQuery>({
            document: MunicipalServiceBySlugDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        'MunicipalServiceBySlug',
        'query',
        variables,
      )
    },
    MunicipalServicesStaticPathsForSitemap(
      variables?: MunicipalServicesStaticPathsForSitemapQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit['signal'],
    ): Promise<MunicipalServicesStaticPathsForSitemapQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<MunicipalServicesStaticPathsForSitemapQuery>({
            document: MunicipalServicesStaticPathsForSitemapDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        'MunicipalServicesStaticPathsForSitemap',
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
  }
}
export type Sdk = ReturnType<typeof getSdk>

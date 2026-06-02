import type { Schema, Struct } from '@strapi/strapi'

export interface BlocksCommonLink extends Struct.ComponentSchema {
  collectionName: 'components_blocks_common_links'
  info: {
    displayName: 'Common link'
  }
  attributes: {
    label: Schema.Attribute.String
    municipalService: Schema.Attribute.Relation<
      'oneToOne',
      'api::municipal-service.municipal-service'
    >
    url: Schema.Attribute.String
  }
}

export interface BlocksContactCard extends Struct.ComponentSchema {
  collectionName: 'components_blocks_contact_cards'
  info: {
    description: ''
    displayName: 'Contact card'
  }
  attributes: {
    overrideLabel: Schema.Attribute.String
    value: Schema.Attribute.Text & Schema.Attribute.Required
  }
}

export interface BlocksContactDirectionsCard extends Struct.ComponentSchema {
  collectionName: 'components_blocks_contact_directions_cards'
  info: {
    displayName: 'Contact directions card'
  }
  attributes: {
    address: Schema.Attribute.String & Schema.Attribute.Required
    barrierFreeInfo: Schema.Attribute.Text
    iframeUrl: Schema.Attribute.Text
    overrideLabel: Schema.Attribute.String
    parkingInfo: Schema.Attribute.Text
    publicTransportInfo: Schema.Attribute.Text
  }
}

export interface BlocksContactPersonCard extends Struct.ComponentSchema {
  collectionName: 'components_blocks_contact_person_cards'
  info: {
    displayName: 'Contact person card'
  }
  attributes: {
    email: Schema.Attribute.Email
    phone: Schema.Attribute.String
    subtext: Schema.Attribute.String
    title: Schema.Attribute.String & Schema.Attribute.Required
  }
}

export interface BlocksFooterColumn extends Struct.ComponentSchema {
  collectionName: 'components_blocks_footer_columns'
  info: {
    displayName: 'Footer Column'
  }
  attributes: {
    links: Schema.Attribute.Component<'blocks.common-link', true>
    title: Schema.Attribute.String & Schema.Attribute.Required
  }
}

export interface BlocksFormLandingPage extends Struct.ComponentSchema {
  collectionName: 'components_blocks_form_landing_pages'
  info: {
    description: ''
    displayName: 'Form landing page'
  }
  attributes: {
    formCta: Schema.Attribute.Component<'blocks.form-landing-page-form-cta', false> &
      Schema.Attribute.Required
    linkCtas: Schema.Attribute.Component<'blocks.form-landing-page-link-cta', true>
    sections: Schema.Attribute.DynamicZone<['sections.richtext', 'sections.contacts']>
    text: Schema.Attribute.RichText
  }
}

export interface BlocksFormLandingPageFormCta extends Struct.ComponentSchema {
  collectionName: 'components_blocks_form_landing_page_form_ctas'
  info: {
    displayName: 'Form landing page form CTA'
  }
  attributes: {
    buttonLabel: Schema.Attribute.String & Schema.Attribute.Required
    text: Schema.Attribute.Text
    title: Schema.Attribute.String & Schema.Attribute.Required
  }
}

export interface BlocksFormLandingPageLinkCta extends Struct.ComponentSchema {
  collectionName: 'components_blocks_form_landing_page_link_ctas'
  info: {
    displayName: 'Form landing page link CTA'
  }
  attributes: {
    buttonLabel: Schema.Attribute.String & Schema.Attribute.Required
    text: Schema.Attribute.Text
    title: Schema.Attribute.String & Schema.Attribute.Required
    url: Schema.Attribute.String & Schema.Attribute.Required
  }
}

export interface BlocksHelpCategory extends Struct.ComponentSchema {
  collectionName: 'components_blocks_help_categories'
  info: {
    description: ''
    displayName: 'Help category'
  }
  attributes: {
    items: Schema.Attribute.Component<'blocks.help-item', true> & Schema.Attribute.Required
    title: Schema.Attribute.String & Schema.Attribute.Required
  }
}

export interface BlocksHelpItem extends Struct.ComponentSchema {
  collectionName: 'components_blocks_help_items'
  info: {
    displayName: 'Help item'
  }
  attributes: {
    content: Schema.Attribute.RichText & Schema.Attribute.Required
    title: Schema.Attribute.String & Schema.Attribute.Required
  }
}

export interface GeneralAlert extends Struct.ComponentSchema {
  collectionName: 'components_general_alerts'
  info: {
    description: ''
    displayName: 'Alert'
  }
  attributes: {
    content: Schema.Attribute.RichText & Schema.Attribute.Required
    dateFrom: Schema.Attribute.DateTime
    dateTo: Schema.Attribute.DateTime
  }
}

export interface SectionsContacts extends Struct.ComponentSchema {
  collectionName: 'components_sections_contacts_sections'
  info: {
    description: ''
    displayName: 'Kontakty'
  }
  attributes: {
    addressContacts: Schema.Attribute.Component<'blocks.contact-card', true>
    bankConnectionContacts: Schema.Attribute.Component<'blocks.contact-card', true>
    billingInfoContacts: Schema.Attribute.Component<'blocks.contact-card', true>
    description: Schema.Attribute.RichText
    directionsContact: Schema.Attribute.Component<'blocks.contact-directions-card', false>
    emailContacts: Schema.Attribute.Component<'blocks.contact-card', true>
    openingHoursContacts: Schema.Attribute.Component<'blocks.contact-card', true>
    personContacts: Schema.Attribute.Component<'blocks.contact-person-card', true>
    phoneContacts: Schema.Attribute.Component<'blocks.contact-card', true>
    postalAddressContacts: Schema.Attribute.Component<'blocks.contact-card', true>
    title: Schema.Attribute.String
    titleLevel: Schema.Attribute.Enumeration<['h2', 'h3']> & Schema.Attribute.DefaultTo<'h2'>
    webContacts: Schema.Attribute.Component<'blocks.contact-card', true>
  }
}

export interface SectionsRichtext extends Struct.ComponentSchema {
  collectionName: 'components_sections_richtexts'
  info: {
    displayName: 'Richtext'
  }
  attributes: {
    content: Schema.Attribute.RichText
  }
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'blocks.common-link': BlocksCommonLink
      'blocks.contact-card': BlocksContactCard
      'blocks.contact-directions-card': BlocksContactDirectionsCard
      'blocks.contact-person-card': BlocksContactPersonCard
      'blocks.footer-column': BlocksFooterColumn
      'blocks.form-landing-page': BlocksFormLandingPage
      'blocks.form-landing-page-form-cta': BlocksFormLandingPageFormCta
      'blocks.form-landing-page-link-cta': BlocksFormLandingPageLinkCta
      'blocks.help-category': BlocksHelpCategory
      'blocks.help-item': BlocksHelpItem
      'general.alert': GeneralAlert
      'sections.contacts': SectionsContacts
      'sections.richtext': SectionsRichtext
    }
  }
}

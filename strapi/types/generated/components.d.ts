import type { Attribute, Schema } from '@strapi/strapi'

export interface BlocksFormLandingPage extends Schema.Component {
  collectionName: 'components_blocks_form_landing_pages'
  info: {
    description: ''
    displayName: 'Form landing page'
  }
  attributes: {
    formCta: Attribute.Component<'blocks.form-landing-page-form-cta'> & Attribute.Required
    linkCtas: Attribute.Component<'blocks.form-landing-page-link-cta', true>
    text: Attribute.RichText
  }
}

export interface BlocksFormLandingPageFormCta extends Schema.Component {
  collectionName: 'components_blocks_form_landing_page_form_ctas'
  info: {
    displayName: 'Form landing page form CTA'
  }
  attributes: {
    buttonLabel: Attribute.String & Attribute.Required
    text: Attribute.Text
    title: Attribute.String & Attribute.Required
  }
}

export interface BlocksFormLandingPageLinkCta extends Schema.Component {
  collectionName: 'components_blocks_form_landing_page_link_ctas'
  info: {
    displayName: 'Form landing page link CTA'
  }
  attributes: {
    buttonLabel: Attribute.String & Attribute.Required
    text: Attribute.Text
    title: Attribute.String & Attribute.Required
    url: Attribute.String & Attribute.Required
  }
}

export interface BlocksHelpCategory extends Schema.Component {
  collectionName: 'components_blocks_help_categories'
  info: {
    description: ''
    displayName: 'Help category'
  }
  attributes: {
    items: Attribute.Component<'blocks.help-item', true> & Attribute.Required
    title: Attribute.String & Attribute.Required
  }
}

export interface BlocksHelpItem extends Schema.Component {
  collectionName: 'components_blocks_help_items'
  info: {
    displayName: 'Help item'
  }
  attributes: {
    content: Attribute.RichText & Attribute.Required
    title: Attribute.String & Attribute.Required
  }
}

export interface GeneralAlert extends Schema.Component {
  collectionName: 'components_general_alerts'
  info: {
    description: ''
    displayName: 'Alert'
  }
  attributes: {
    content: Attribute.RichText & Attribute.Required
    dateFrom: Attribute.DateTime
    dateTo: Attribute.DateTime
  }
}

declare module '@strapi/types' {
  export module Shared {
    export interface Components {
      'blocks.form-landing-page': BlocksFormLandingPage
      'blocks.form-landing-page-form-cta': BlocksFormLandingPageFormCta
      'blocks.form-landing-page-link-cta': BlocksFormLandingPageLinkCta
      'blocks.help-category': BlocksHelpCategory
      'blocks.help-item': BlocksHelpItem
      'general.alert': GeneralAlert
    }
  }
}

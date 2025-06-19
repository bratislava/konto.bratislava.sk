import type { Schema, Attribute } from '@strapi/strapi'

export interface BlocksFormLandingPageFormCta extends Schema.Component {
  collectionName: 'components_blocks_form_landing_page_form_ctas'
  info: {
    displayName: 'Form landing page form CTA'
  }
  attributes: {
    title: Attribute.String & Attribute.Required
    text: Attribute.Text
    buttonLabel: Attribute.String & Attribute.Required
  }
}

export interface BlocksFormLandingPageLinkCta extends Schema.Component {
  collectionName: 'components_blocks_form_landing_page_link_ctas'
  info: {
    displayName: 'Form landing page link CTA'
  }
  attributes: {
    title: Attribute.String & Attribute.Required
    text: Attribute.Text
    buttonLabel: Attribute.String & Attribute.Required
    url: Attribute.String & Attribute.Required
  }
}

export interface BlocksFormLandingPage extends Schema.Component {
  collectionName: 'components_blocks_form_landing_pages'
  info: {
    displayName: 'Form landing page'
    description: ''
  }
  attributes: {
    text: Attribute.RichText
    linkCtas: Attribute.Component<'blocks.form-landing-page-link-cta', true>
    formCta: Attribute.Component<'blocks.form-landing-page-form-cta'> & Attribute.Required
  }
}

export interface BlocksHelpCategory extends Schema.Component {
  collectionName: 'components_blocks_help_categories'
  info: {
    displayName: 'Help category'
    description: ''
  }
  attributes: {
    title: Attribute.String & Attribute.Required
    items: Attribute.Component<'blocks.help-item', true> & Attribute.Required
  }
}

export interface BlocksHelpItem extends Schema.Component {
  collectionName: 'components_blocks_help_items'
  info: {
    displayName: 'Help item'
  }
  attributes: {
    title: Attribute.String & Attribute.Required
    content: Attribute.RichText & Attribute.Required
  }
}

export interface BlocksHomepageBanner extends Schema.Component {
  collectionName: 'components_blocks_homepage_banners'
  info: {
    displayName: 'Homepage banner'
    description: ''
  }
  attributes: {
    title: Attribute.String & Attribute.Required
    description: Attribute.Text & Attribute.Required
    buttonText: Attribute.String & Attribute.Required
    href: Attribute.String & Attribute.Required
    image: Attribute.Media & Attribute.Required
    dateFrom: Attribute.DateTime
    dateTo: Attribute.DateTime
  }
}

export interface GeneralAlert extends Schema.Component {
  collectionName: 'components_general_alerts'
  info: {
    displayName: 'Alert'
    description: ''
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
      'blocks.form-landing-page-form-cta': BlocksFormLandingPageFormCta
      'blocks.form-landing-page-link-cta': BlocksFormLandingPageLinkCta
      'blocks.form-landing-page': BlocksFormLandingPage
      'blocks.help-category': BlocksHelpCategory
      'blocks.help-item': BlocksHelpItem
      'blocks.homepage-banner': BlocksHomepageBanner
      'general.alert': GeneralAlert
    }
  }
}

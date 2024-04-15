import type { Schema, Attribute } from '@strapi/strapi'

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
      'blocks.help-category': BlocksHelpCategory
      'blocks.help-item': BlocksHelpItem
      'general.alert': GeneralAlert
    }
  }
}

import type { Attribute, Schema } from '@strapi/strapi'

export interface AdminApiToken extends Schema.CollectionType {
  collectionName: 'strapi_api_tokens'
  info: {
    description: ''
    displayName: 'Api Token'
    name: 'Api Token'
    pluralName: 'api-tokens'
    singularName: 'api-token'
  }
  pluginOptions: {
    'content-manager': {
      visible: false
    }
    'content-type-builder': {
      visible: false
    }
  }
  attributes: {
    accessKey: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 1
      }>
    createdAt: Attribute.DateTime
    createdBy: Attribute.Relation<'admin::api-token', 'oneToOne', 'admin::user'> & Attribute.Private
    description: Attribute.String &
      Attribute.SetMinMaxLength<{
        minLength: 1
      }> &
      Attribute.DefaultTo<''>
    expiresAt: Attribute.DateTime
    lastUsedAt: Attribute.DateTime
    lifespan: Attribute.BigInteger
    name: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 1
      }>
    permissions: Attribute.Relation<'admin::api-token', 'oneToMany', 'admin::api-token-permission'>
    type: Attribute.Enumeration<['read-only', 'full-access', 'custom']> &
      Attribute.Required &
      Attribute.DefaultTo<'read-only'>
    updatedAt: Attribute.DateTime
    updatedBy: Attribute.Relation<'admin::api-token', 'oneToOne', 'admin::user'> & Attribute.Private
  }
}

export interface AdminApiTokenPermission extends Schema.CollectionType {
  collectionName: 'strapi_api_token_permissions'
  info: {
    description: ''
    displayName: 'API Token Permission'
    name: 'API Token Permission'
    pluralName: 'api-token-permissions'
    singularName: 'api-token-permission'
  }
  pluginOptions: {
    'content-manager': {
      visible: false
    }
    'content-type-builder': {
      visible: false
    }
  }
  attributes: {
    action: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 1
      }>
    createdAt: Attribute.DateTime
    createdBy: Attribute.Relation<'admin::api-token-permission', 'oneToOne', 'admin::user'> &
      Attribute.Private
    token: Attribute.Relation<'admin::api-token-permission', 'manyToOne', 'admin::api-token'>
    updatedAt: Attribute.DateTime
    updatedBy: Attribute.Relation<'admin::api-token-permission', 'oneToOne', 'admin::user'> &
      Attribute.Private
  }
}

export interface AdminPermission extends Schema.CollectionType {
  collectionName: 'admin_permissions'
  info: {
    description: ''
    displayName: 'Permission'
    name: 'Permission'
    pluralName: 'permissions'
    singularName: 'permission'
  }
  pluginOptions: {
    'content-manager': {
      visible: false
    }
    'content-type-builder': {
      visible: false
    }
  }
  attributes: {
    action: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 1
      }>
    actionParameters: Attribute.JSON & Attribute.DefaultTo<{}>
    conditions: Attribute.JSON & Attribute.DefaultTo<[]>
    createdAt: Attribute.DateTime
    createdBy: Attribute.Relation<'admin::permission', 'oneToOne', 'admin::user'> &
      Attribute.Private
    properties: Attribute.JSON & Attribute.DefaultTo<{}>
    role: Attribute.Relation<'admin::permission', 'manyToOne', 'admin::role'>
    subject: Attribute.String &
      Attribute.SetMinMaxLength<{
        minLength: 1
      }>
    updatedAt: Attribute.DateTime
    updatedBy: Attribute.Relation<'admin::permission', 'oneToOne', 'admin::user'> &
      Attribute.Private
  }
}

export interface AdminRole extends Schema.CollectionType {
  collectionName: 'admin_roles'
  info: {
    description: ''
    displayName: 'Role'
    name: 'Role'
    pluralName: 'roles'
    singularName: 'role'
  }
  pluginOptions: {
    'content-manager': {
      visible: false
    }
    'content-type-builder': {
      visible: false
    }
  }
  attributes: {
    code: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 1
      }>
    createdAt: Attribute.DateTime
    createdBy: Attribute.Relation<'admin::role', 'oneToOne', 'admin::user'> & Attribute.Private
    description: Attribute.String
    name: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 1
      }>
    permissions: Attribute.Relation<'admin::role', 'oneToMany', 'admin::permission'>
    updatedAt: Attribute.DateTime
    updatedBy: Attribute.Relation<'admin::role', 'oneToOne', 'admin::user'> & Attribute.Private
    users: Attribute.Relation<'admin::role', 'manyToMany', 'admin::user'>
  }
}

export interface AdminTransferToken extends Schema.CollectionType {
  collectionName: 'strapi_transfer_tokens'
  info: {
    description: ''
    displayName: 'Transfer Token'
    name: 'Transfer Token'
    pluralName: 'transfer-tokens'
    singularName: 'transfer-token'
  }
  pluginOptions: {
    'content-manager': {
      visible: false
    }
    'content-type-builder': {
      visible: false
    }
  }
  attributes: {
    accessKey: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 1
      }>
    createdAt: Attribute.DateTime
    createdBy: Attribute.Relation<'admin::transfer-token', 'oneToOne', 'admin::user'> &
      Attribute.Private
    description: Attribute.String &
      Attribute.SetMinMaxLength<{
        minLength: 1
      }> &
      Attribute.DefaultTo<''>
    expiresAt: Attribute.DateTime
    lastUsedAt: Attribute.DateTime
    lifespan: Attribute.BigInteger
    name: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 1
      }>
    permissions: Attribute.Relation<
      'admin::transfer-token',
      'oneToMany',
      'admin::transfer-token-permission'
    >
    updatedAt: Attribute.DateTime
    updatedBy: Attribute.Relation<'admin::transfer-token', 'oneToOne', 'admin::user'> &
      Attribute.Private
  }
}

export interface AdminTransferTokenPermission extends Schema.CollectionType {
  collectionName: 'strapi_transfer_token_permissions'
  info: {
    description: ''
    displayName: 'Transfer Token Permission'
    name: 'Transfer Token Permission'
    pluralName: 'transfer-token-permissions'
    singularName: 'transfer-token-permission'
  }
  pluginOptions: {
    'content-manager': {
      visible: false
    }
    'content-type-builder': {
      visible: false
    }
  }
  attributes: {
    action: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 1
      }>
    createdAt: Attribute.DateTime
    createdBy: Attribute.Relation<'admin::transfer-token-permission', 'oneToOne', 'admin::user'> &
      Attribute.Private
    token: Attribute.Relation<
      'admin::transfer-token-permission',
      'manyToOne',
      'admin::transfer-token'
    >
    updatedAt: Attribute.DateTime
    updatedBy: Attribute.Relation<'admin::transfer-token-permission', 'oneToOne', 'admin::user'> &
      Attribute.Private
  }
}

export interface AdminUser extends Schema.CollectionType {
  collectionName: 'admin_users'
  info: {
    description: ''
    displayName: 'User'
    name: 'User'
    pluralName: 'users'
    singularName: 'user'
  }
  pluginOptions: {
    'content-manager': {
      visible: false
    }
    'content-type-builder': {
      visible: false
    }
  }
  attributes: {
    blocked: Attribute.Boolean & Attribute.Private & Attribute.DefaultTo<false>
    createdAt: Attribute.DateTime
    createdBy: Attribute.Relation<'admin::user', 'oneToOne', 'admin::user'> & Attribute.Private
    email: Attribute.Email &
      Attribute.Required &
      Attribute.Private &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 6
      }>
    firstname: Attribute.String &
      Attribute.SetMinMaxLength<{
        minLength: 1
      }>
    isActive: Attribute.Boolean & Attribute.Private & Attribute.DefaultTo<false>
    lastname: Attribute.String &
      Attribute.SetMinMaxLength<{
        minLength: 1
      }>
    password: Attribute.Password &
      Attribute.Private &
      Attribute.SetMinMaxLength<{
        minLength: 6
      }>
    preferedLanguage: Attribute.String
    registrationToken: Attribute.String & Attribute.Private
    resetPasswordToken: Attribute.String & Attribute.Private
    roles: Attribute.Relation<'admin::user', 'manyToMany', 'admin::role'> & Attribute.Private
    updatedAt: Attribute.DateTime
    updatedBy: Attribute.Relation<'admin::user', 'oneToOne', 'admin::user'> & Attribute.Private
    username: Attribute.String
  }
}

export interface ApiFormForm extends Schema.CollectionType {
  collectionName: 'forms'
  info: {
    description: ''
    displayName: 'Form'
    pluralName: 'forms'
    singularName: 'form'
  }
  options: {
    draftAndPublish: false
  }
  attributes: {
    createdAt: Attribute.DateTime
    createdBy: Attribute.Relation<'api::form.form', 'oneToOne', 'admin::user'> & Attribute.Private
    landingPage: Attribute.Component<'blocks.form-landing-page'>
    moreInformationUrl: Attribute.String
    slug: Attribute.UID & Attribute.Required
    updatedAt: Attribute.DateTime
    updatedBy: Attribute.Relation<'api::form.form', 'oneToOne', 'admin::user'> & Attribute.Private
  }
}

export interface ApiGeneralGeneral extends Schema.SingleType {
  collectionName: 'generals'
  info: {
    displayName: 'General'
    pluralName: 'generals'
    singularName: 'general'
  }
  options: {
    draftAndPublish: false
  }
  attributes: {
    alerts: Attribute.Component<'general.alert', true>
    createdAt: Attribute.DateTime
    createdBy: Attribute.Relation<'api::general.general', 'oneToOne', 'admin::user'> &
      Attribute.Private
    updatedAt: Attribute.DateTime
    updatedBy: Attribute.Relation<'api::general.general', 'oneToOne', 'admin::user'> &
      Attribute.Private
  }
}

export interface ApiHelpPageHelpPage extends Schema.SingleType {
  collectionName: 'help_pages'
  info: {
    description: ''
    displayName: 'Help page'
    pluralName: 'help-pages'
    singularName: 'help-page'
  }
  options: {
    draftAndPublish: false
  }
  attributes: {
    categories: Attribute.Component<'blocks.help-category', true> & Attribute.Required
    createdAt: Attribute.DateTime
    createdBy: Attribute.Relation<'api::help-page.help-page', 'oneToOne', 'admin::user'> &
      Attribute.Private
    updatedAt: Attribute.DateTime
    updatedBy: Attribute.Relation<'api::help-page.help-page', 'oneToOne', 'admin::user'> &
      Attribute.Private
  }
}

export interface ApiHomepageAnnouncementHomepageAnnouncement extends Schema.CollectionType {
  collectionName: 'homepage_announcements'
  info: {
    displayName: 'Homepage announcement'
    pluralName: 'homepage-announcements'
    singularName: 'homepage-announcement'
  }
  options: {
    draftAndPublish: false
  }
  attributes: {
    buttonText: Attribute.String & Attribute.Required
    createdAt: Attribute.DateTime
    createdBy: Attribute.Relation<
      'api::homepage-announcement.homepage-announcement',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private
    dateFrom: Attribute.DateTime
    dateTo: Attribute.DateTime
    description: Attribute.Text & Attribute.Required
    href: Attribute.String & Attribute.Required
    image: Attribute.Media<'images'> & Attribute.Required
    title: Attribute.String & Attribute.Required
    updatedAt: Attribute.DateTime
    updatedBy: Attribute.Relation<
      'api::homepage-announcement.homepage-announcement',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private
  }
}

export interface ApiHomepageHomepage extends Schema.SingleType {
  collectionName: 'homepages'
  info: {
    description: ''
    displayName: 'Homepage'
    pluralName: 'homepages'
    singularName: 'homepage'
  }
  options: {
    draftAndPublish: false
  }
  attributes: {
    announcements: Attribute.Relation<
      'api::homepage.homepage',
      'oneToMany',
      'api::homepage-announcement.homepage-announcement'
    >
    announcementsLegalPerson: Attribute.Relation<
      'api::homepage.homepage',
      'oneToMany',
      'api::homepage-announcement.homepage-announcement'
    >
    createdAt: Attribute.DateTime
    createdBy: Attribute.Relation<'api::homepage.homepage', 'oneToOne', 'admin::user'> &
      Attribute.Private
    services: Attribute.Relation<
      'api::homepage.homepage',
      'oneToMany',
      'api::municipal-service.municipal-service'
    >
    servicesLegalPerson: Attribute.Relation<
      'api::homepage.homepage',
      'oneToMany',
      'api::municipal-service.municipal-service'
    >
    updatedAt: Attribute.DateTime
    updatedBy: Attribute.Relation<'api::homepage.homepage', 'oneToOne', 'admin::user'> &
      Attribute.Private
  }
}

export interface ApiMunicipalServiceCategoryMunicipalServiceCategory extends Schema.CollectionType {
  collectionName: 'municipal_service_categories'
  info: {
    displayName: 'Municipal service category'
    pluralName: 'municipal-service-categories'
    singularName: 'municipal-service-category'
  }
  options: {
    draftAndPublish: false
  }
  attributes: {
    createdAt: Attribute.DateTime
    createdBy: Attribute.Relation<
      'api::municipal-service-category.municipal-service-category',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private
    municipalServices: Attribute.Relation<
      'api::municipal-service-category.municipal-service-category',
      'manyToMany',
      'api::municipal-service.municipal-service'
    >
    title: Attribute.String & Attribute.Required
    updatedAt: Attribute.DateTime
    updatedBy: Attribute.Relation<
      'api::municipal-service-category.municipal-service-category',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private
  }
}

export interface ApiMunicipalServiceTagMunicipalServiceTag extends Schema.CollectionType {
  collectionName: 'municipal_service_tags'
  info: {
    displayName: 'Municipal service tag'
    pluralName: 'municipal-service-tags'
    singularName: 'municipal-service-tag'
  }
  options: {
    draftAndPublish: false
  }
  attributes: {
    createdAt: Attribute.DateTime
    createdBy: Attribute.Relation<
      'api::municipal-service-tag.municipal-service-tag',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private
    municipalServices: Attribute.Relation<
      'api::municipal-service-tag.municipal-service-tag',
      'manyToMany',
      'api::municipal-service.municipal-service'
    >
    title: Attribute.String & Attribute.Required
    updatedAt: Attribute.DateTime
    updatedBy: Attribute.Relation<
      'api::municipal-service-tag.municipal-service-tag',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private
  }
}

export interface ApiMunicipalServiceMunicipalService extends Schema.CollectionType {
  collectionName: 'municipal_services'
  info: {
    description: ''
    displayName: 'Municipal service'
    pluralName: 'municipal-services'
    singularName: 'municipal-service'
  }
  options: {
    draftAndPublish: false
  }
  attributes: {
    buttonText: Attribute.String & Attribute.Required
    categories: Attribute.Relation<
      'api::municipal-service.municipal-service',
      'manyToMany',
      'api::municipal-service-category.municipal-service-category'
    >
    color: Attribute.Enumeration<
      [
        'main',
        'transport',
        'environment',
        'social',
        'education',
        'culture',
        'marianum',
        'olo',
        'tsb'
      ]
    > &
      Attribute.Required &
      Attribute.DefaultTo<'main'>
    createdAt: Attribute.DateTime
    createdBy: Attribute.Relation<
      'api::municipal-service.municipal-service',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private
    description: Attribute.Text & Attribute.Required
    href: Attribute.String & Attribute.Required
    icon: Attribute.Enumeration<
      [
        'administration',
        'public-space-occupation',
        'taxes',
        'cultural-organizations',
        'events-support',
        'library',
        'zoo',
        'kids-teenagers',
        'swimming-pool',
        'community-gardens',
        'connector',
        'front-gardens',
        'greenery',
        'lamp',
        'spatial-planning',
        'waste',
        'security',
        'marianum',
        'mosquito',
        'christmas-tree',
        'housing',
        'transport',
        'excavations',
        'management-communications',
        'parking',
        'towing'
      ]
    > &
      Attribute.Required
    tags: Attribute.Relation<
      'api::municipal-service.municipal-service',
      'manyToMany',
      'api::municipal-service-tag.municipal-service-tag'
    >
    title: Attribute.String & Attribute.Required
    updatedAt: Attribute.DateTime
    updatedBy: Attribute.Relation<
      'api::municipal-service.municipal-service',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private
  }
}

export interface ApiMunicipalServicesPageMunicipalServicesPage extends Schema.SingleType {
  collectionName: 'municipal_services_pages'
  info: {
    description: ''
    displayName: 'Municipal services page'
    pluralName: 'municipal-services-pages'
    singularName: 'municipal-services-page'
  }
  options: {
    draftAndPublish: false
  }
  attributes: {
    createdAt: Attribute.DateTime
    createdBy: Attribute.Relation<
      'api::municipal-services-page.municipal-services-page',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private
    services: Attribute.Relation<
      'api::municipal-services-page.municipal-services-page',
      'oneToMany',
      'api::municipal-service.municipal-service'
    >
    servicesLegalPerson: Attribute.Relation<
      'api::municipal-services-page.municipal-services-page',
      'oneToMany',
      'api::municipal-service.municipal-service'
    >
    updatedAt: Attribute.DateTime
    updatedBy: Attribute.Relation<
      'api::municipal-services-page.municipal-services-page',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private
  }
}

export interface ApiTaxTax extends Schema.SingleType {
  collectionName: 'taxes'
  info: {
    description: ''
    displayName: 'Tax'
    pluralName: 'taxes'
    singularName: 'tax'
  }
  options: {
    draftAndPublish: false
  }
  attributes: {
    accountCommunicationConsentText: Attribute.RichText & Attribute.Required
    channelChangeEffectiveNextYearText: Attribute.RichText
    channelChangeEffectiveNextYearTitle: Attribute.String
    createdAt: Attribute.DateTime
    createdBy: Attribute.Relation<'api::tax.tax', 'oneToOne', 'admin::user'> & Attribute.Private
    paymentAlertText: Attribute.RichText
    paymentSuccessFeedbackLink: Attribute.String
    updatedAt: Attribute.DateTime
    updatedBy: Attribute.Relation<'api::tax.tax', 'oneToOne', 'admin::user'> & Attribute.Private
  }
}

export interface PluginContentReleasesRelease extends Schema.CollectionType {
  collectionName: 'strapi_releases'
  info: {
    displayName: 'Release'
    pluralName: 'releases'
    singularName: 'release'
  }
  options: {
    draftAndPublish: false
  }
  pluginOptions: {
    'content-manager': {
      visible: false
    }
    'content-type-builder': {
      visible: false
    }
  }
  attributes: {
    actions: Attribute.Relation<
      'plugin::content-releases.release',
      'oneToMany',
      'plugin::content-releases.release-action'
    >
    createdAt: Attribute.DateTime
    createdBy: Attribute.Relation<'plugin::content-releases.release', 'oneToOne', 'admin::user'> &
      Attribute.Private
    name: Attribute.String & Attribute.Required
    releasedAt: Attribute.DateTime
    scheduledAt: Attribute.DateTime
    status: Attribute.Enumeration<['ready', 'blocked', 'failed', 'done', 'empty']> &
      Attribute.Required
    timezone: Attribute.String
    updatedAt: Attribute.DateTime
    updatedBy: Attribute.Relation<'plugin::content-releases.release', 'oneToOne', 'admin::user'> &
      Attribute.Private
  }
}

export interface PluginContentReleasesReleaseAction extends Schema.CollectionType {
  collectionName: 'strapi_release_actions'
  info: {
    displayName: 'Release Action'
    pluralName: 'release-actions'
    singularName: 'release-action'
  }
  options: {
    draftAndPublish: false
  }
  pluginOptions: {
    'content-manager': {
      visible: false
    }
    'content-type-builder': {
      visible: false
    }
  }
  attributes: {
    contentType: Attribute.String & Attribute.Required
    createdAt: Attribute.DateTime
    createdBy: Attribute.Relation<
      'plugin::content-releases.release-action',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private
    entry: Attribute.Relation<'plugin::content-releases.release-action', 'morphToOne'>
    isEntryValid: Attribute.Boolean
    locale: Attribute.String
    release: Attribute.Relation<
      'plugin::content-releases.release-action',
      'manyToOne',
      'plugin::content-releases.release'
    >
    type: Attribute.Enumeration<['publish', 'unpublish']> & Attribute.Required
    updatedAt: Attribute.DateTime
    updatedBy: Attribute.Relation<
      'plugin::content-releases.release-action',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private
  }
}

export interface PluginI18NLocale extends Schema.CollectionType {
  collectionName: 'i18n_locale'
  info: {
    collectionName: 'locales'
    description: ''
    displayName: 'Locale'
    pluralName: 'locales'
    singularName: 'locale'
  }
  options: {
    draftAndPublish: false
  }
  pluginOptions: {
    'content-manager': {
      visible: false
    }
    'content-type-builder': {
      visible: false
    }
  }
  attributes: {
    code: Attribute.String & Attribute.Unique
    createdAt: Attribute.DateTime
    createdBy: Attribute.Relation<'plugin::i18n.locale', 'oneToOne', 'admin::user'> &
      Attribute.Private
    name: Attribute.String &
      Attribute.SetMinMax<
        {
          max: 50
          min: 1
        },
        number
      >
    updatedAt: Attribute.DateTime
    updatedBy: Attribute.Relation<'plugin::i18n.locale', 'oneToOne', 'admin::user'> &
      Attribute.Private
  }
}

export interface PluginUploadFile extends Schema.CollectionType {
  collectionName: 'files'
  info: {
    description: ''
    displayName: 'File'
    pluralName: 'files'
    singularName: 'file'
  }
  pluginOptions: {
    'content-manager': {
      visible: false
    }
    'content-type-builder': {
      visible: false
    }
  }
  attributes: {
    alternativeText: Attribute.String
    caption: Attribute.String
    createdAt: Attribute.DateTime
    createdBy: Attribute.Relation<'plugin::upload.file', 'oneToOne', 'admin::user'> &
      Attribute.Private
    ext: Attribute.String
    folder: Attribute.Relation<'plugin::upload.file', 'manyToOne', 'plugin::upload.folder'> &
      Attribute.Private
    folderPath: Attribute.String &
      Attribute.Required &
      Attribute.Private &
      Attribute.SetMinMax<
        {
          min: 1
        },
        number
      >
    formats: Attribute.JSON
    hash: Attribute.String & Attribute.Required
    height: Attribute.Integer
    mime: Attribute.String & Attribute.Required
    name: Attribute.String & Attribute.Required
    previewUrl: Attribute.String
    provider: Attribute.String & Attribute.Required
    provider_metadata: Attribute.JSON
    related: Attribute.Relation<'plugin::upload.file', 'morphToMany'>
    size: Attribute.Decimal & Attribute.Required
    updatedAt: Attribute.DateTime
    updatedBy: Attribute.Relation<'plugin::upload.file', 'oneToOne', 'admin::user'> &
      Attribute.Private
    url: Attribute.String & Attribute.Required
    width: Attribute.Integer
  }
}

export interface PluginUploadFolder extends Schema.CollectionType {
  collectionName: 'upload_folders'
  info: {
    displayName: 'Folder'
    pluralName: 'folders'
    singularName: 'folder'
  }
  pluginOptions: {
    'content-manager': {
      visible: false
    }
    'content-type-builder': {
      visible: false
    }
  }
  attributes: {
    children: Attribute.Relation<'plugin::upload.folder', 'oneToMany', 'plugin::upload.folder'>
    createdAt: Attribute.DateTime
    createdBy: Attribute.Relation<'plugin::upload.folder', 'oneToOne', 'admin::user'> &
      Attribute.Private
    files: Attribute.Relation<'plugin::upload.folder', 'oneToMany', 'plugin::upload.file'>
    name: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMax<
        {
          min: 1
        },
        number
      >
    parent: Attribute.Relation<'plugin::upload.folder', 'manyToOne', 'plugin::upload.folder'>
    path: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMax<
        {
          min: 1
        },
        number
      >
    pathId: Attribute.Integer & Attribute.Required & Attribute.Unique
    updatedAt: Attribute.DateTime
    updatedBy: Attribute.Relation<'plugin::upload.folder', 'oneToOne', 'admin::user'> &
      Attribute.Private
  }
}

export interface PluginUsersPermissionsPermission extends Schema.CollectionType {
  collectionName: 'up_permissions'
  info: {
    description: ''
    displayName: 'Permission'
    name: 'permission'
    pluralName: 'permissions'
    singularName: 'permission'
  }
  pluginOptions: {
    'content-manager': {
      visible: false
    }
    'content-type-builder': {
      visible: false
    }
  }
  attributes: {
    action: Attribute.String & Attribute.Required
    createdAt: Attribute.DateTime
    createdBy: Attribute.Relation<
      'plugin::users-permissions.permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private
    role: Attribute.Relation<
      'plugin::users-permissions.permission',
      'manyToOne',
      'plugin::users-permissions.role'
    >
    updatedAt: Attribute.DateTime
    updatedBy: Attribute.Relation<
      'plugin::users-permissions.permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private
  }
}

export interface PluginUsersPermissionsRole extends Schema.CollectionType {
  collectionName: 'up_roles'
  info: {
    description: ''
    displayName: 'Role'
    name: 'role'
    pluralName: 'roles'
    singularName: 'role'
  }
  pluginOptions: {
    'content-manager': {
      visible: false
    }
    'content-type-builder': {
      visible: false
    }
  }
  attributes: {
    createdAt: Attribute.DateTime
    createdBy: Attribute.Relation<'plugin::users-permissions.role', 'oneToOne', 'admin::user'> &
      Attribute.Private
    description: Attribute.String
    name: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 3
      }>
    permissions: Attribute.Relation<
      'plugin::users-permissions.role',
      'oneToMany',
      'plugin::users-permissions.permission'
    >
    type: Attribute.String & Attribute.Unique
    updatedAt: Attribute.DateTime
    updatedBy: Attribute.Relation<'plugin::users-permissions.role', 'oneToOne', 'admin::user'> &
      Attribute.Private
    users: Attribute.Relation<
      'plugin::users-permissions.role',
      'oneToMany',
      'plugin::users-permissions.user'
    >
  }
}

export interface PluginUsersPermissionsUser extends Schema.CollectionType {
  collectionName: 'up_users'
  info: {
    description: ''
    displayName: 'User'
    name: 'user'
    pluralName: 'users'
    singularName: 'user'
  }
  options: {
    draftAndPublish: false
    timestamps: true
  }
  attributes: {
    blocked: Attribute.Boolean & Attribute.DefaultTo<false>
    confirmationToken: Attribute.String & Attribute.Private
    confirmed: Attribute.Boolean & Attribute.DefaultTo<false>
    createdAt: Attribute.DateTime
    createdBy: Attribute.Relation<'plugin::users-permissions.user', 'oneToOne', 'admin::user'> &
      Attribute.Private
    email: Attribute.Email &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 6
      }>
    password: Attribute.Password &
      Attribute.Private &
      Attribute.SetMinMaxLength<{
        minLength: 6
      }>
    provider: Attribute.String
    resetPasswordToken: Attribute.String & Attribute.Private
    role: Attribute.Relation<
      'plugin::users-permissions.user',
      'manyToOne',
      'plugin::users-permissions.role'
    >
    updatedAt: Attribute.DateTime
    updatedBy: Attribute.Relation<'plugin::users-permissions.user', 'oneToOne', 'admin::user'> &
      Attribute.Private
    username: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 3
      }>
  }
}

declare module '@strapi/types' {
  export module Shared {
    export interface ContentTypes {
      'admin::api-token': AdminApiToken
      'admin::api-token-permission': AdminApiTokenPermission
      'admin::permission': AdminPermission
      'admin::role': AdminRole
      'admin::transfer-token': AdminTransferToken
      'admin::transfer-token-permission': AdminTransferTokenPermission
      'admin::user': AdminUser
      'api::form.form': ApiFormForm
      'api::general.general': ApiGeneralGeneral
      'api::help-page.help-page': ApiHelpPageHelpPage
      'api::homepage-announcement.homepage-announcement': ApiHomepageAnnouncementHomepageAnnouncement
      'api::homepage.homepage': ApiHomepageHomepage
      'api::municipal-service-category.municipal-service-category': ApiMunicipalServiceCategoryMunicipalServiceCategory
      'api::municipal-service-tag.municipal-service-tag': ApiMunicipalServiceTagMunicipalServiceTag
      'api::municipal-service.municipal-service': ApiMunicipalServiceMunicipalService
      'api::municipal-services-page.municipal-services-page': ApiMunicipalServicesPageMunicipalServicesPage
      'api::tax.tax': ApiTaxTax
      'plugin::content-releases.release': PluginContentReleasesRelease
      'plugin::content-releases.release-action': PluginContentReleasesReleaseAction
      'plugin::i18n.locale': PluginI18NLocale
      'plugin::upload.file': PluginUploadFile
      'plugin::upload.folder': PluginUploadFolder
      'plugin::users-permissions.permission': PluginUsersPermissionsPermission
      'plugin::users-permissions.role': PluginUsersPermissionsRole
      'plugin::users-permissions.user': PluginUsersPermissionsUser
    }
  }
}

import type { Schema, Attribute } from '@strapi/strapi'

export interface AdminPermission extends Schema.CollectionType {
  collectionName: 'admin_permissions'
  info: {
    name: 'Permission'
    description: ''
    singularName: 'permission'
    pluralName: 'permissions'
    displayName: 'Permission'
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
    subject: Attribute.String &
      Attribute.SetMinMaxLength<{
        minLength: 1
      }>
    properties: Attribute.JSON & Attribute.DefaultTo<{}>
    conditions: Attribute.JSON & Attribute.DefaultTo<[]>
    role: Attribute.Relation<'admin::permission', 'manyToOne', 'admin::role'>
    createdAt: Attribute.DateTime
    updatedAt: Attribute.DateTime
    createdBy: Attribute.Relation<'admin::permission', 'oneToOne', 'admin::user'> &
      Attribute.Private
    updatedBy: Attribute.Relation<'admin::permission', 'oneToOne', 'admin::user'> &
      Attribute.Private
  }
}

export interface AdminUser extends Schema.CollectionType {
  collectionName: 'admin_users'
  info: {
    name: 'User'
    description: ''
    singularName: 'user'
    pluralName: 'users'
    displayName: 'User'
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
    firstname: Attribute.String &
      Attribute.SetMinMaxLength<{
        minLength: 1
      }>
    lastname: Attribute.String &
      Attribute.SetMinMaxLength<{
        minLength: 1
      }>
    username: Attribute.String
    email: Attribute.Email &
      Attribute.Required &
      Attribute.Private &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 6
      }>
    password: Attribute.Password &
      Attribute.Private &
      Attribute.SetMinMaxLength<{
        minLength: 6
      }>
    resetPasswordToken: Attribute.String & Attribute.Private
    registrationToken: Attribute.String & Attribute.Private
    isActive: Attribute.Boolean & Attribute.Private & Attribute.DefaultTo<false>
    roles: Attribute.Relation<'admin::user', 'manyToMany', 'admin::role'> & Attribute.Private
    blocked: Attribute.Boolean & Attribute.Private & Attribute.DefaultTo<false>
    preferedLanguage: Attribute.String
    createdAt: Attribute.DateTime
    updatedAt: Attribute.DateTime
    createdBy: Attribute.Relation<'admin::user', 'oneToOne', 'admin::user'> & Attribute.Private
    updatedBy: Attribute.Relation<'admin::user', 'oneToOne', 'admin::user'> & Attribute.Private
  }
}

export interface AdminRole extends Schema.CollectionType {
  collectionName: 'admin_roles'
  info: {
    name: 'Role'
    description: ''
    singularName: 'role'
    pluralName: 'roles'
    displayName: 'Role'
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
    name: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 1
      }>
    code: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 1
      }>
    description: Attribute.String
    users: Attribute.Relation<'admin::role', 'manyToMany', 'admin::user'>
    permissions: Attribute.Relation<'admin::role', 'oneToMany', 'admin::permission'>
    createdAt: Attribute.DateTime
    updatedAt: Attribute.DateTime
    createdBy: Attribute.Relation<'admin::role', 'oneToOne', 'admin::user'> & Attribute.Private
    updatedBy: Attribute.Relation<'admin::role', 'oneToOne', 'admin::user'> & Attribute.Private
  }
}

export interface AdminApiToken extends Schema.CollectionType {
  collectionName: 'strapi_api_tokens'
  info: {
    name: 'Api Token'
    singularName: 'api-token'
    pluralName: 'api-tokens'
    displayName: 'Api Token'
    description: ''
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
    name: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 1
      }>
    description: Attribute.String &
      Attribute.SetMinMaxLength<{
        minLength: 1
      }> &
      Attribute.DefaultTo<''>
    type: Attribute.Enumeration<['read-only', 'full-access', 'custom']> &
      Attribute.Required &
      Attribute.DefaultTo<'read-only'>
    accessKey: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 1
      }>
    lastUsedAt: Attribute.DateTime
    permissions: Attribute.Relation<'admin::api-token', 'oneToMany', 'admin::api-token-permission'>
    expiresAt: Attribute.DateTime
    lifespan: Attribute.BigInteger
    createdAt: Attribute.DateTime
    updatedAt: Attribute.DateTime
    createdBy: Attribute.Relation<'admin::api-token', 'oneToOne', 'admin::user'> & Attribute.Private
    updatedBy: Attribute.Relation<'admin::api-token', 'oneToOne', 'admin::user'> & Attribute.Private
  }
}

export interface AdminApiTokenPermission extends Schema.CollectionType {
  collectionName: 'strapi_api_token_permissions'
  info: {
    name: 'API Token Permission'
    description: ''
    singularName: 'api-token-permission'
    pluralName: 'api-token-permissions'
    displayName: 'API Token Permission'
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
    token: Attribute.Relation<'admin::api-token-permission', 'manyToOne', 'admin::api-token'>
    createdAt: Attribute.DateTime
    updatedAt: Attribute.DateTime
    createdBy: Attribute.Relation<'admin::api-token-permission', 'oneToOne', 'admin::user'> &
      Attribute.Private
    updatedBy: Attribute.Relation<'admin::api-token-permission', 'oneToOne', 'admin::user'> &
      Attribute.Private
  }
}

export interface AdminTransferToken extends Schema.CollectionType {
  collectionName: 'strapi_transfer_tokens'
  info: {
    name: 'Transfer Token'
    singularName: 'transfer-token'
    pluralName: 'transfer-tokens'
    displayName: 'Transfer Token'
    description: ''
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
    name: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 1
      }>
    description: Attribute.String &
      Attribute.SetMinMaxLength<{
        minLength: 1
      }> &
      Attribute.DefaultTo<''>
    accessKey: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 1
      }>
    lastUsedAt: Attribute.DateTime
    permissions: Attribute.Relation<
      'admin::transfer-token',
      'oneToMany',
      'admin::transfer-token-permission'
    >
    expiresAt: Attribute.DateTime
    lifespan: Attribute.BigInteger
    createdAt: Attribute.DateTime
    updatedAt: Attribute.DateTime
    createdBy: Attribute.Relation<'admin::transfer-token', 'oneToOne', 'admin::user'> &
      Attribute.Private
    updatedBy: Attribute.Relation<'admin::transfer-token', 'oneToOne', 'admin::user'> &
      Attribute.Private
  }
}

export interface AdminTransferTokenPermission extends Schema.CollectionType {
  collectionName: 'strapi_transfer_token_permissions'
  info: {
    name: 'Transfer Token Permission'
    description: ''
    singularName: 'transfer-token-permission'
    pluralName: 'transfer-token-permissions'
    displayName: 'Transfer Token Permission'
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
    token: Attribute.Relation<
      'admin::transfer-token-permission',
      'manyToOne',
      'admin::transfer-token'
    >
    createdAt: Attribute.DateTime
    updatedAt: Attribute.DateTime
    createdBy: Attribute.Relation<'admin::transfer-token-permission', 'oneToOne', 'admin::user'> &
      Attribute.Private
    updatedBy: Attribute.Relation<'admin::transfer-token-permission', 'oneToOne', 'admin::user'> &
      Attribute.Private
  }
}

export interface PluginUploadFile extends Schema.CollectionType {
  collectionName: 'files'
  info: {
    singularName: 'file'
    pluralName: 'files'
    displayName: 'File'
    description: ''
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
    name: Attribute.String & Attribute.Required
    alternativeText: Attribute.String
    caption: Attribute.String
    width: Attribute.Integer
    height: Attribute.Integer
    formats: Attribute.JSON
    hash: Attribute.String & Attribute.Required
    ext: Attribute.String
    mime: Attribute.String & Attribute.Required
    size: Attribute.Decimal & Attribute.Required
    url: Attribute.String & Attribute.Required
    previewUrl: Attribute.String
    provider: Attribute.String & Attribute.Required
    provider_metadata: Attribute.JSON
    related: Attribute.Relation<'plugin::upload.file', 'morphToMany'>
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
    createdAt: Attribute.DateTime
    updatedAt: Attribute.DateTime
    createdBy: Attribute.Relation<'plugin::upload.file', 'oneToOne', 'admin::user'> &
      Attribute.Private
    updatedBy: Attribute.Relation<'plugin::upload.file', 'oneToOne', 'admin::user'> &
      Attribute.Private
  }
}

export interface PluginUploadFolder extends Schema.CollectionType {
  collectionName: 'upload_folders'
  info: {
    singularName: 'folder'
    pluralName: 'folders'
    displayName: 'Folder'
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
    name: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMax<
        {
          min: 1
        },
        number
      >
    pathId: Attribute.Integer & Attribute.Required & Attribute.Unique
    parent: Attribute.Relation<'plugin::upload.folder', 'manyToOne', 'plugin::upload.folder'>
    children: Attribute.Relation<'plugin::upload.folder', 'oneToMany', 'plugin::upload.folder'>
    files: Attribute.Relation<'plugin::upload.folder', 'oneToMany', 'plugin::upload.file'>
    path: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMax<
        {
          min: 1
        },
        number
      >
    createdAt: Attribute.DateTime
    updatedAt: Attribute.DateTime
    createdBy: Attribute.Relation<'plugin::upload.folder', 'oneToOne', 'admin::user'> &
      Attribute.Private
    updatedBy: Attribute.Relation<'plugin::upload.folder', 'oneToOne', 'admin::user'> &
      Attribute.Private
  }
}

export interface PluginContentReleasesRelease extends Schema.CollectionType {
  collectionName: 'strapi_releases'
  info: {
    singularName: 'release'
    pluralName: 'releases'
    displayName: 'Release'
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
    name: Attribute.String & Attribute.Required
    releasedAt: Attribute.DateTime
    scheduledAt: Attribute.DateTime
    timezone: Attribute.String
    actions: Attribute.Relation<
      'plugin::content-releases.release',
      'oneToMany',
      'plugin::content-releases.release-action'
    >
    createdAt: Attribute.DateTime
    updatedAt: Attribute.DateTime
    createdBy: Attribute.Relation<'plugin::content-releases.release', 'oneToOne', 'admin::user'> &
      Attribute.Private
    updatedBy: Attribute.Relation<'plugin::content-releases.release', 'oneToOne', 'admin::user'> &
      Attribute.Private
  }
}

export interface PluginContentReleasesReleaseAction extends Schema.CollectionType {
  collectionName: 'strapi_release_actions'
  info: {
    singularName: 'release-action'
    pluralName: 'release-actions'
    displayName: 'Release Action'
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
    type: Attribute.Enumeration<['publish', 'unpublish']> & Attribute.Required
    entry: Attribute.Relation<'plugin::content-releases.release-action', 'morphToOne'>
    contentType: Attribute.String & Attribute.Required
    locale: Attribute.String
    release: Attribute.Relation<
      'plugin::content-releases.release-action',
      'manyToOne',
      'plugin::content-releases.release'
    >
    createdAt: Attribute.DateTime
    updatedAt: Attribute.DateTime
    createdBy: Attribute.Relation<
      'plugin::content-releases.release-action',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private
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
    singularName: 'locale'
    pluralName: 'locales'
    collectionName: 'locales'
    displayName: 'Locale'
    description: ''
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
    name: Attribute.String &
      Attribute.SetMinMax<
        {
          min: 1
          max: 50
        },
        number
      >
    code: Attribute.String & Attribute.Unique
    createdAt: Attribute.DateTime
    updatedAt: Attribute.DateTime
    createdBy: Attribute.Relation<'plugin::i18n.locale', 'oneToOne', 'admin::user'> &
      Attribute.Private
    updatedBy: Attribute.Relation<'plugin::i18n.locale', 'oneToOne', 'admin::user'> &
      Attribute.Private
  }
}

export interface PluginUsersPermissionsPermission extends Schema.CollectionType {
  collectionName: 'up_permissions'
  info: {
    name: 'permission'
    description: ''
    singularName: 'permission'
    pluralName: 'permissions'
    displayName: 'Permission'
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
    role: Attribute.Relation<
      'plugin::users-permissions.permission',
      'manyToOne',
      'plugin::users-permissions.role'
    >
    createdAt: Attribute.DateTime
    updatedAt: Attribute.DateTime
    createdBy: Attribute.Relation<
      'plugin::users-permissions.permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private
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
    name: 'role'
    description: ''
    singularName: 'role'
    pluralName: 'roles'
    displayName: 'Role'
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
    name: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 3
      }>
    description: Attribute.String
    type: Attribute.String & Attribute.Unique
    permissions: Attribute.Relation<
      'plugin::users-permissions.role',
      'oneToMany',
      'plugin::users-permissions.permission'
    >
    users: Attribute.Relation<
      'plugin::users-permissions.role',
      'oneToMany',
      'plugin::users-permissions.user'
    >
    createdAt: Attribute.DateTime
    updatedAt: Attribute.DateTime
    createdBy: Attribute.Relation<'plugin::users-permissions.role', 'oneToOne', 'admin::user'> &
      Attribute.Private
    updatedBy: Attribute.Relation<'plugin::users-permissions.role', 'oneToOne', 'admin::user'> &
      Attribute.Private
  }
}

export interface PluginUsersPermissionsUser extends Schema.CollectionType {
  collectionName: 'up_users'
  info: {
    name: 'user'
    description: ''
    singularName: 'user'
    pluralName: 'users'
    displayName: 'User'
  }
  options: {
    draftAndPublish: false
    timestamps: true
  }
  attributes: {
    username: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 3
      }>
    email: Attribute.Email &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 6
      }>
    provider: Attribute.String
    password: Attribute.Password &
      Attribute.Private &
      Attribute.SetMinMaxLength<{
        minLength: 6
      }>
    resetPasswordToken: Attribute.String & Attribute.Private
    confirmationToken: Attribute.String & Attribute.Private
    confirmed: Attribute.Boolean & Attribute.DefaultTo<false>
    blocked: Attribute.Boolean & Attribute.DefaultTo<false>
    role: Attribute.Relation<
      'plugin::users-permissions.user',
      'manyToOne',
      'plugin::users-permissions.role'
    >
    createdAt: Attribute.DateTime
    updatedAt: Attribute.DateTime
    createdBy: Attribute.Relation<'plugin::users-permissions.user', 'oneToOne', 'admin::user'> &
      Attribute.Private
    updatedBy: Attribute.Relation<'plugin::users-permissions.user', 'oneToOne', 'admin::user'> &
      Attribute.Private
  }
}

export interface ApiFormForm extends Schema.CollectionType {
  collectionName: 'forms'
  info: {
    singularName: 'form'
    pluralName: 'forms'
    displayName: 'Form'
    description: ''
  }
  options: {
    draftAndPublish: false
  }
  attributes: {
    slug: Attribute.UID & Attribute.Required
    moreInformationUrl: Attribute.String
    landingPage: Attribute.Component<'blocks.form-landing-page'>
    createdAt: Attribute.DateTime
    updatedAt: Attribute.DateTime
    createdBy: Attribute.Relation<'api::form.form', 'oneToOne', 'admin::user'> & Attribute.Private
    updatedBy: Attribute.Relation<'api::form.form', 'oneToOne', 'admin::user'> & Attribute.Private
  }
}

export interface ApiGeneralGeneral extends Schema.SingleType {
  collectionName: 'generals'
  info: {
    singularName: 'general'
    pluralName: 'generals'
    displayName: 'General'
  }
  options: {
    draftAndPublish: false
  }
  attributes: {
    alerts: Attribute.Component<'general.alert', true>
    createdAt: Attribute.DateTime
    updatedAt: Attribute.DateTime
    createdBy: Attribute.Relation<'api::general.general', 'oneToOne', 'admin::user'> &
      Attribute.Private
    updatedBy: Attribute.Relation<'api::general.general', 'oneToOne', 'admin::user'> &
      Attribute.Private
  }
}

export interface ApiHelpPageHelpPage extends Schema.SingleType {
  collectionName: 'help_pages'
  info: {
    singularName: 'help-page'
    pluralName: 'help-pages'
    displayName: 'Help page'
    description: ''
  }
  options: {
    draftAndPublish: false
  }
  attributes: {
    categories: Attribute.Component<'blocks.help-category', true> & Attribute.Required
    createdAt: Attribute.DateTime
    updatedAt: Attribute.DateTime
    createdBy: Attribute.Relation<'api::help-page.help-page', 'oneToOne', 'admin::user'> &
      Attribute.Private
    updatedBy: Attribute.Relation<'api::help-page.help-page', 'oneToOne', 'admin::user'> &
      Attribute.Private
  }
}

export interface ApiHomepageHomepage extends Schema.SingleType {
  collectionName: 'homepages'
  info: {
    singularName: 'homepage'
    pluralName: 'homepages'
    displayName: 'Homepage'
    description: ''
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
    createdAt: Attribute.DateTime
    updatedAt: Attribute.DateTime
    createdBy: Attribute.Relation<'api::homepage.homepage', 'oneToOne', 'admin::user'> &
      Attribute.Private
    updatedBy: Attribute.Relation<'api::homepage.homepage', 'oneToOne', 'admin::user'> &
      Attribute.Private
  }
}

export interface ApiHomepageAnnouncementHomepageAnnouncement extends Schema.CollectionType {
  collectionName: 'homepage_announcements'
  info: {
    singularName: 'homepage-announcement'
    pluralName: 'homepage-announcements'
    displayName: 'Homepage announcement'
  }
  options: {
    draftAndPublish: false
  }
  attributes: {
    title: Attribute.String & Attribute.Required
    description: Attribute.Text & Attribute.Required
    buttonText: Attribute.String & Attribute.Required
    href: Attribute.String & Attribute.Required
    image: Attribute.Media & Attribute.Required
    dateFrom: Attribute.DateTime
    dateTo: Attribute.DateTime
    createdAt: Attribute.DateTime
    updatedAt: Attribute.DateTime
    createdBy: Attribute.Relation<
      'api::homepage-announcement.homepage-announcement',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private
    updatedBy: Attribute.Relation<
      'api::homepage-announcement.homepage-announcement',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private
  }
}

export interface ApiMunicipalServiceMunicipalService extends Schema.CollectionType {
  collectionName: 'municipal_services'
  info: {
    singularName: 'municipal-service'
    pluralName: 'municipal-services'
    displayName: 'Municipal service'
    description: ''
  }
  options: {
    draftAndPublish: false
  }
  attributes: {
    title: Attribute.String & Attribute.Required
    description: Attribute.Text & Attribute.Required
    buttonText: Attribute.String & Attribute.Required
    href: Attribute.String & Attribute.Required
    tags: Attribute.Relation<
      'api::municipal-service.municipal-service',
      'manyToMany',
      'api::municipal-service-tag.municipal-service-tag'
    >
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
    categories: Attribute.Relation<
      'api::municipal-service.municipal-service',
      'manyToMany',
      'api::municipal-service-category.municipal-service-category'
    >
    createdAt: Attribute.DateTime
    updatedAt: Attribute.DateTime
    createdBy: Attribute.Relation<
      'api::municipal-service.municipal-service',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private
    updatedBy: Attribute.Relation<
      'api::municipal-service.municipal-service',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private
  }
}

export interface ApiMunicipalServiceCategoryMunicipalServiceCategory extends Schema.CollectionType {
  collectionName: 'municipal_service_categories'
  info: {
    singularName: 'municipal-service-category'
    pluralName: 'municipal-service-categories'
    displayName: 'Municipal service category'
  }
  options: {
    draftAndPublish: false
  }
  attributes: {
    title: Attribute.String & Attribute.Required
    municipalServices: Attribute.Relation<
      'api::municipal-service-category.municipal-service-category',
      'manyToMany',
      'api::municipal-service.municipal-service'
    >
    createdAt: Attribute.DateTime
    updatedAt: Attribute.DateTime
    createdBy: Attribute.Relation<
      'api::municipal-service-category.municipal-service-category',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private
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
    singularName: 'municipal-service-tag'
    pluralName: 'municipal-service-tags'
    displayName: 'Municipal service tag'
  }
  options: {
    draftAndPublish: false
  }
  attributes: {
    title: Attribute.String & Attribute.Required
    municipalServices: Attribute.Relation<
      'api::municipal-service-tag.municipal-service-tag',
      'manyToMany',
      'api::municipal-service.municipal-service'
    >
    createdAt: Attribute.DateTime
    updatedAt: Attribute.DateTime
    createdBy: Attribute.Relation<
      'api::municipal-service-tag.municipal-service-tag',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private
    updatedBy: Attribute.Relation<
      'api::municipal-service-tag.municipal-service-tag',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private
  }
}

export interface ApiMunicipalServicesPageMunicipalServicesPage extends Schema.SingleType {
  collectionName: 'municipal_services_pages'
  info: {
    singularName: 'municipal-services-page'
    pluralName: 'municipal-services-pages'
    displayName: 'Municipal services page'
    description: ''
  }
  options: {
    draftAndPublish: false
  }
  attributes: {
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
    createdAt: Attribute.DateTime
    updatedAt: Attribute.DateTime
    createdBy: Attribute.Relation<
      'api::municipal-services-page.municipal-services-page',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private
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
    singularName: 'tax'
    pluralName: 'taxes'
    displayName: 'Tax'
    description: ''
  }
  options: {
    draftAndPublish: false
  }
  attributes: {
    accountCommunicationConsentText: Attribute.RichText & Attribute.Required
    displayCurrentYearTaxInPreparation: Attribute.Boolean &
      Attribute.Required &
      Attribute.DefaultTo<false>
    currentYearTaxInPreparationTitle: Attribute.String
    currentYearTaxInPreparationText: Attribute.RichText
    channelChangeEffectiveNextYearTitle: Attribute.String
    channelChangeEffectiveNextYearText: Attribute.RichText
    paymentSuccessFeedbackLink: Attribute.String
    paymentSuccessPrivacyPolicyLink: Attribute.String
    paymentSuccessFaqLink: Attribute.String
    createdAt: Attribute.DateTime
    updatedAt: Attribute.DateTime
    createdBy: Attribute.Relation<'api::tax.tax', 'oneToOne', 'admin::user'> & Attribute.Private
    updatedBy: Attribute.Relation<'api::tax.tax', 'oneToOne', 'admin::user'> & Attribute.Private
  }
}

declare module '@strapi/types' {
  export module Shared {
    export interface ContentTypes {
      'admin::permission': AdminPermission
      'admin::user': AdminUser
      'admin::role': AdminRole
      'admin::api-token': AdminApiToken
      'admin::api-token-permission': AdminApiTokenPermission
      'admin::transfer-token': AdminTransferToken
      'admin::transfer-token-permission': AdminTransferTokenPermission
      'plugin::upload.file': PluginUploadFile
      'plugin::upload.folder': PluginUploadFolder
      'plugin::content-releases.release': PluginContentReleasesRelease
      'plugin::content-releases.release-action': PluginContentReleasesReleaseAction
      'plugin::i18n.locale': PluginI18NLocale
      'plugin::users-permissions.permission': PluginUsersPermissionsPermission
      'plugin::users-permissions.role': PluginUsersPermissionsRole
      'plugin::users-permissions.user': PluginUsersPermissionsUser
      'api::form.form': ApiFormForm
      'api::general.general': ApiGeneralGeneral
      'api::help-page.help-page': ApiHelpPageHelpPage
      'api::homepage.homepage': ApiHomepageHomepage
      'api::homepage-announcement.homepage-announcement': ApiHomepageAnnouncementHomepageAnnouncement
      'api::municipal-service.municipal-service': ApiMunicipalServiceMunicipalService
      'api::municipal-service-category.municipal-service-category': ApiMunicipalServiceCategoryMunicipalServiceCategory
      'api::municipal-service-tag.municipal-service-tag': ApiMunicipalServiceTagMunicipalServiceTag
      'api::municipal-services-page.municipal-services-page': ApiMunicipalServicesPageMunicipalServicesPage
      'api::tax.tax': ApiTaxTax
    }
  }
}

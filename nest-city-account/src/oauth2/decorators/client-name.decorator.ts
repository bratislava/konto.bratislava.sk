import { SetMetadata } from '@nestjs/common'

import { OAuth2ClientName } from '../oauth2-client-name.enum'

export const CLIENT_NAME_KEY = 'clientName'

export const ClientName = (clientName: OAuth2ClientName) => SetMetadata(CLIENT_NAME_KEY, clientName)

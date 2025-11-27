import { SetMetadata } from '@nestjs/common'
import { OAuth2ClientName } from '../subservices/oauth2-client.subservice'

export const CLIENT_NAME_KEY = 'clientName'

export const ClientName = (clientName: OAuth2ClientName) => SetMetadata(CLIENT_NAME_KEY, clientName)

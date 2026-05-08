import AppModule from './src/app.module'
import { createSwaggerDocument } from './src/bootstrap'
import tsConfig from './tsconfig.json'
import nestCli from 'nest-cli.json'

export default {
  appModule: AppModule,
  createSwaggerDocument,
  tsConfig,
  nestCli,
}

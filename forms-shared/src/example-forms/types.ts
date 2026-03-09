import type { GenericObjectType } from '@rjsf/utils' with {
  'resolution-mode': 'import',
}
import { FormsBackendFile } from '../form-files/serverFilesTypes'
import { ClientFileInfo } from '../form-files/fileStatus'
import { SharepointDataAllColumnMappingsToFields } from '../sharepoint/types'

export type ExampleForm<FormData = GenericObjectType> = {
  name: string
  formData: FormData
  serverFiles?: FormsBackendFile[]
  clientFiles?: ClientFileInfo[]
  sharepointFieldMap?: SharepointDataAllColumnMappingsToFields
}

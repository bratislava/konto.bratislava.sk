import type { GenericObjectType } from '@rjsf/utils'

import { ClientFileInfo } from '../form-files/fileStatus'
import { FormsBackendFile } from '../form-files/serverFilesTypes'
import { SharepointDataAllColumnMappingsToFields } from '../sharepoint/types'

export type ExampleForm<FormData = GenericObjectType> = {
  name: string
  formData: FormData
  serverFiles?: FormsBackendFile[]
  clientFiles?: ClientFileInfo[]
  sharepointFieldMap?: SharepointDataAllColumnMappingsToFields
}

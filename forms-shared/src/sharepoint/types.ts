type JsonObject = { [Key in string]?: JsonValue }

interface JsonArray extends Array<JsonValue> {}

export type JsonValue = string | number | boolean | JsonObject | JsonArray | null

type SharepointRelationMappingColumnsToFields = {
  fieldMap: Record<string, string>
}

export type SharepointDataAllColumnMappingsToFields = {
  fieldMap: Record<string, string>
  oneToMany: Record<string, SharepointRelationMappingColumnsToFields>
  oneToOne: {
    fieldMaps: Record<string, SharepointRelationMappingColumnsToFields>
    oneToOneOriginalTableFields: Record<string, string>
  }
}

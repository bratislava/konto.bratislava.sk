type JsonObject = { [Key in string]?: JsonValue }

interface JsonArray extends Array<JsonValue> {}

export type JsonValue = string | number | boolean | JsonObject | JsonArray | null

type SharepointRelationMappingColumnsToFields = {
  fieldMap: Record<string, string>
}

export type ColumnMappingToFields = {
  fieldMaps: Record<string, SharepointRelationMappingColumnsToFields>
  originalTableFields: Record<string, string>
}

export type SharepointDataAllColumnMappingsToFields = {
  fieldMap: Record<string, string>
  oneToMany: ColumnMappingToFields
  oneToOne: ColumnMappingToFields
}

type JsonObject = { [Key in string]?: JsonValue }

interface JsonArray extends Array<JsonValue> {}

export type JsonValue = string | number | boolean | JsonObject | JsonArray | null

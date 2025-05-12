# JsonToXmlV2RequestDto

## Properties

| Name         | Type       | Description                                                                     | Notes                             |
| ------------ | ---------- | ------------------------------------------------------------------------------- | --------------------------------- |
| **formId**   | **string** | Form id                                                                         | [default to undefined]            |
| **jsonData** | **object** | JSON form values, if not provided the form data from the database will be used. | [optional] [default to undefined] |

## Example

```typescript
import { JsonToXmlV2RequestDto } from './api'

const instance: JsonToXmlV2RequestDto = {
  formId,
  jsonData,
}
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)

# NoFormXmlDataErrorDto

## Properties

| Name           | Type       | Description                                 | Notes                                                                                         |
| -------------- | ---------- | ------------------------------------------- | --------------------------------------------------------------------------------------------- |
| **statusCode** | **number** | Status Code                                 | [default to 422]                                                                              |
| **message**    | **string** | Detail error message                        | [default to 'Form has no formDataXml. Please fill the form first with form update endpoint.'] |
| **status**     | **string** | status in text                              | [default to 'Unprocessable entity error']                                                     |
| **errorName**  | **string** | Exact error name                            | [default to 'NO_FORM_XML_DATA_ERROR']                                                         |
| **object**     | **object** | Helper for sending additional data in error | [optional] [default to undefined]                                                             |

## Example

```typescript
import { NoFormXmlDataErrorDto } from './api'

const instance: NoFormXmlDataErrorDto = {
  statusCode,
  message,
  status,
  errorName,
  object,
}
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)

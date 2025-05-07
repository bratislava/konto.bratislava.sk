# XmlValidationErrorDto

## Properties

| Name           | Type       | Description                                 | Notes                                                     |
| -------------- | ---------- | ------------------------------------------- | --------------------------------------------------------- |
| **statusCode** | **number** | Status Code                                 | [default to 400]                                          |
| **message**    | **string** | Detail error message                        | [default to 'Failed to validate XML against XSD schema.'] |
| **status**     | **string** | status in text                              | [default to 'Bad request']                                |
| **errorName**  | **string** | Exact error name                            | [default to 'XML_VALIDATION_ERROR']                       |
| **object**     | **object** | Helper for sending additional data in error | [optional] [default to undefined]                         |

## Example

```typescript
import { XmlValidationErrorDto } from './api'

const instance: XmlValidationErrorDto = {
  statusCode,
  message,
  status,
  errorName,
  object,
}
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)

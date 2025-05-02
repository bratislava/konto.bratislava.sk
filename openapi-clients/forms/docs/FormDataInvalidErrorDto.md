# FormDataInvalidErrorDto

## Properties

| Name           | Type       | Description                                 | Notes                                             |
| -------------- | ---------- | ------------------------------------------- | ------------------------------------------------- |
| **statusCode** | **number** | Status Code                                 | [default to 406]                                  |
| **message**    | **string** | Detail error message                        | [default to 'The form data provided is invalid.'] |
| **status**     | **string** | status in text                              | [default to 'Not accepted']                       |
| **errorName**  | **string** | Exact error name                            | [default to 'FORM_DATA_INVALID']                  |
| **object**     | **object** | Helper for sending additional data in error | [optional] [default to undefined]                 |

## Example

```typescript
import { FormDataInvalidErrorDto } from './api'

const instance: FormDataInvalidErrorDto = {
  statusCode,
  message,
  status,
  errorName,
  object,
}
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)

# EmptyFormDataErrorDto

## Properties

| Name           | Type       | Description                                 | Notes                                     |
| -------------- | ---------- | ------------------------------------------- | ----------------------------------------- |
| **statusCode** | **number** | Status Code                                 | [default to 422]                          |
| **message**    | **string** | Detail error message                        | [default to 'Form data is empty.']        |
| **status**     | **string** | status in text                              | [default to 'Unprocessable entity error'] |
| **errorName**  | **string** | Exact error name                            | [default to 'EMPTY_FORM_DATA']            |
| **object**     | **object** | Helper for sending additional data in error | [optional] [default to undefined]         |

## Example

```typescript
import { EmptyFormDataErrorDto } from './api'

const instance: EmptyFormDataErrorDto = {
  statusCode,
  message,
  status,
  errorName,
  object,
}
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)

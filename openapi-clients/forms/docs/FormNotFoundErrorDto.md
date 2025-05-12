# FormNotFoundErrorDto

## Properties

| Name           | Type       | Description                                 | Notes                                               |
| -------------- | ---------- | ------------------------------------------- | --------------------------------------------------- |
| **statusCode** | **number** | Status Code                                 | [default to 404]                                    |
| **message**    | **string** | Detail error message                        | [default to 'Form with provided id was not found.'] |
| **status**     | **string** | status in text                              | [default to 'Not found']                            |
| **errorName**  | **string** | Exact error name                            | [default to 'FORM_NOT_FOUND_ERROR']                 |
| **object**     | **object** | Helper for sending additional data in error | [optional] [default to undefined]                   |

## Example

```typescript
import { FormNotFoundErrorDto } from './api'

const instance: FormNotFoundErrorDto = {
  statusCode,
  message,
  status,
  errorName,
  object,
}
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)

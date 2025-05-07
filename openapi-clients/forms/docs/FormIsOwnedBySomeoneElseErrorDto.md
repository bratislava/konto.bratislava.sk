# FormIsOwnedBySomeoneElseErrorDto

## Properties

| Name           | Type       | Description                                 | Notes                                              |
| -------------- | ---------- | ------------------------------------------- | -------------------------------------------------- |
| **statusCode** | **number** | Status Code                                 | [default to 403]                                   |
| **message**    | **string** | Detail error message                        | [default to 'Form is owned by someone else.']      |
| **status**     | **string** | status in text                              | [default to 'Forbidden']                           |
| **errorName**  | **string** | Exact error name                            | [default to 'FORM_IS_OWNED_BY_SOMEONE_ELSE_ERROR'] |
| **object**     | **object** | Helper for sending additional data in error | [optional] [default to undefined]                  |

## Example

```typescript
import { FormIsOwnedBySomeoneElseErrorDto } from './api'

const instance: FormIsOwnedBySomeoneElseErrorDto = {
  statusCode,
  message,
  status,
  errorName,
  object,
}
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)

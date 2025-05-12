# FormAssignedToOtherUserErrorDto

## Properties

| Name           | Type       | Description                                 | Notes                                                         |
| -------------- | ---------- | ------------------------------------------- | ------------------------------------------------------------- |
| **statusCode** | **number** | Status Code                                 | [default to 403]                                              |
| **message**    | **string** | Detail error message                        | [default to 'This form is already assigned to another user.'] |
| **status**     | **string** | status in text                              | [default to 'Forbidden']                                      |
| **errorName**  | **string** | Exact error name                            | [default to 'FORM_ASSIGNED_TO_OTHER_USER']                    |
| **object**     | **object** | Helper for sending additional data in error | [optional] [default to undefined]                             |

## Example

```typescript
import { FormAssignedToOtherUserErrorDto } from './api'

const instance: FormAssignedToOtherUserErrorDto = {
  statusCode,
  message,
  status,
  errorName,
  object,
}
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)

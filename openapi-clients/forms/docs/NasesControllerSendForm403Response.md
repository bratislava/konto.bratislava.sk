# NasesControllerSendForm403Response

## Properties

| Name           | Type       | Description                                 | Notes                                                |
| -------------- | ---------- | ------------------------------------------- | ---------------------------------------------------- |
| **statusCode** | **number** | Status Code                                 | [default to 403]                                     |
| **message**    | **string** | Detail error message                        | [default to 'Sending is not allowed for this user.'] |
| **status**     | **string** | status in text                              | [default to 'Forbidden']                             |
| **errorName**  | **string** | Exact error name                            | [default to 'SEND_POLICY_NOT_ALLOWED_FOR_USER']      |
| **object**     | **object** | Helper for sending additional data in error | [optional] [default to undefined]                    |

## Example

```typescript
import { NasesControllerSendForm403Response } from './api'

const instance: NasesControllerSendForm403Response = {
  statusCode,
  message,
  status,
  errorName,
  object,
}
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)

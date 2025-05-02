# NasesControllerSendForm422Response

## Properties

| Name           | Type       | Description                                 | Notes                                                 |
| -------------- | ---------- | ------------------------------------------- | ----------------------------------------------------- |
| **statusCode** | **number** | Status Code                                 | [default to 422]                                      |
| **message**    | **string** | Detail error message                        | [default to 'Sending is not possible for this form.'] |
| **status**     | **string** | status in text                              | [default to 'Unprocessable entity error']             |
| **errorName**  | **string** | Exact error name                            | [default to 'SEND_POLICY_NOT_POSSIBLE']               |
| **object**     | **object** | Helper for sending additional data in error | [optional] [default to undefined]                     |

## Example

```typescript
import { NasesControllerSendForm422Response } from './api'

const instance: NasesControllerSendForm422Response = {
  statusCode,
  message,
  status,
  errorName,
  object,
}
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)

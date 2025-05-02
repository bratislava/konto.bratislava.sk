# NasesControllerSendForm500Response

## Properties

| Name           | Type       | Description                                 | Notes                                               |
| -------------- | ---------- | ------------------------------------------- | --------------------------------------------------- |
| **statusCode** | **number** | Status Code                                 | [default to 500]                                    |
| **message**    | **string** | Detail error message                        | [default to 'Error while generating form summary.'] |
| **status**     | **string** | status in text                              | [default to 'Internal server error']                |
| **errorName**  | **string** | Exact error name                            | [default to 'FORM_SUMMARY_GENERATION_ERROR']        |
| **object**     | **object** | Helper for sending additional data in error | [optional] [default to undefined]                   |

## Example

```typescript
import { NasesControllerSendForm500Response } from './api'

const instance: NasesControllerSendForm500Response = {
  statusCode,
  message,
  status,
  errorName,
  object,
}
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)

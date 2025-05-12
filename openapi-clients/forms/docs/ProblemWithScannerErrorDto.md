# ProblemWithScannerErrorDto

## Properties

| Name           | Type       | Description                                 | Notes                                                 |
| -------------- | ---------- | ------------------------------------------- | ----------------------------------------------------- |
| **statusCode** | **number** | Status Code                                 | [default to 400]                                      |
| **message**    | **string** | Detail error message                        | [default to 'Error while notifying scanner backend.'] |
| **status**     | **string** | status in text                              | [default to 'Bad request']                            |
| **errorName**  | **string** | Exact error name                            | [default to 'PROBLEM_WITH_SCANNER']                   |
| **object**     | **object** | Helper for sending additional data in error | [optional] [default to undefined]                     |

## Example

```typescript
import { ProblemWithScannerErrorDto } from './api'

const instance: ProblemWithScannerErrorDto = {
  statusCode,
  message,
  status,
  errorName,
  object,
}
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)

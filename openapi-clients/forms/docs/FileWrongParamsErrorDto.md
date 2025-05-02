# FileWrongParamsErrorDto

## Properties

| Name           | Type       | Description                                 | Notes                                                               |
| -------------- | ---------- | ------------------------------------------- | ------------------------------------------------------------------- |
| **statusCode** | **number** | Status Code                                 | [default to 400]                                                    |
| **message**    | **string** | Detail error message                        | [default to 'Params which where sent was not accepted by scanner.'] |
| **status**     | **string** | status in text                              | [default to 'Bad request']                                          |
| **errorName**  | **string** | Exact error name                            | [default to 'FILE_HAS_WRONG_PARAMETERS']                            |
| **object**     | **object** | Helper for sending additional data in error | [optional] [default to undefined]                                   |

## Example

```typescript
import { FileWrongParamsErrorDto } from './api'

const instance: FileWrongParamsErrorDto = {
  statusCode,
  message,
  status,
  errorName,
  object,
}
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)

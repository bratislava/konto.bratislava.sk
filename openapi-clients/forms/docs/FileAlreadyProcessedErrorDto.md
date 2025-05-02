# FileAlreadyProcessedErrorDto

## Properties

| Name           | Type       | Description                                 | Notes                                                 |
| -------------- | ---------- | ------------------------------------------- | ----------------------------------------------------- |
| **statusCode** | **number** | Status Code                                 | [default to 410]                                      |
| **message**    | **string** | Detail error message                        | [default to 'File was already processed in scanner.'] |
| **status**     | **string** | status in text                              | [default to 'Resource was processed']                 |
| **errorName**  | **string** | Exact error name                            | [default to 'FILE_WAS_PROCESSED']                     |
| **object**     | **object** | Helper for sending additional data in error | [optional] [default to undefined]                     |

## Example

```typescript
import { FileAlreadyProcessedErrorDto } from './api'

const instance: FileAlreadyProcessedErrorDto = {
  statusCode,
  message,
  status,
  errorName,
  object,
}
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)

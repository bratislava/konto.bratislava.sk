# FormDefinitionNotSupportedTypeErrorDto

## Properties

| Name           | Type       | Description                                 | Notes                                                  |
| -------------- | ---------- | ------------------------------------------- | ------------------------------------------------------ |
| **statusCode** | **number** | Status Code                                 | [default to 422]                                       |
| **message**    | **string** | Detail error message                        | [default to 'Got unsupported type of FormDefinition.'] |
| **status**     | **string** | status in text                              | [default to 'Unprocessable entity error']              |
| **errorName**  | **string** | Exact error name                            | [default to 'FORM_DEFINITION_NOT_SUPPORTED_TYPE']      |
| **object**     | **object** | Helper for sending additional data in error | [optional] [default to undefined]                      |

## Example

```typescript
import { FormDefinitionNotSupportedTypeErrorDto } from './api'

const instance: FormDefinitionNotSupportedTypeErrorDto = {
  statusCode,
  message,
  status,
  errorName,
  object,
}
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)

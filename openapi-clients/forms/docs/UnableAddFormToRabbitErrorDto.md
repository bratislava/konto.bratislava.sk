# UnableAddFormToRabbitErrorDto

## Properties

| Name           | Type       | Description                                 | Notes                                                       |
| -------------- | ---------- | ------------------------------------------- | ----------------------------------------------------------- |
| **statusCode** | **number** | Status Code                                 | [default to 422]                                            |
| **message**    | **string** | Detail error message                        | [default to 'There was an issue sending form to rabbitmq.'] |
| **status**     | **string** | status in text                              | [default to 'Unprocessable entity error']                   |
| **errorName**  | **string** | Exact error name                            | [default to 'UNABLE_ADD_FORM_TO_RABBIT']                    |
| **object**     | **object** | Helper for sending additional data in error | [optional] [default to undefined]                           |

## Example

```typescript
import { UnableAddFormToRabbitErrorDto } from './api'

const instance: UnableAddFormToRabbitErrorDto = {
  statusCode,
  message,
  status,
  errorName,
  object,
}
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)

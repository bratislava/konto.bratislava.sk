# SendFormResponseDto

## Properties

| Name        | Type       | Description                            | Notes                                                   |
| ----------- | ---------- | -------------------------------------- | ------------------------------------------------------- |
| **id**      | **string** | Id of record                           | [default to 'f69559da-5eca-4ed7-80fd-370d09dc3632']     |
| **message** | **string** | Message response regarding the process | [default to 'Form was sucessfully queued to rabbitmq.'] |
| **state**   | **object** | Form state                             | [default to undefined]                                  |

## Example

```typescript
import { SendFormResponseDto } from './api'

const instance: SendFormResponseDto = {
  id,
  message,
  state,
}
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)

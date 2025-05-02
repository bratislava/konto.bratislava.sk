# BadRequestDecoratorErrorDto

## Properties

| Name           | Type                    | Description | Notes                      |
| -------------- | ----------------------- | ----------- | -------------------------- |
| **statusCode** | **number**              |             | [default to 400]           |
| **message**    | **Array&lt;string&gt;** |             | [default to undefined]     |
| **error**      | **string**              |             | [default to 'Bad Request'] |

## Example

```typescript
import { BadRequestDecoratorErrorDto } from './api'

const instance: BadRequestDecoratorErrorDto = {
  statusCode,
  message,
  error,
}
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)

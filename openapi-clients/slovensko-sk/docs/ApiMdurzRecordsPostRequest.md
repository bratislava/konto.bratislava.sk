# ApiMdurzRecordsPostRequest

## Properties

| Name               | Type                                                         | Description | Notes                  |
| ------------------ | ------------------------------------------------------------ | ----------- | ---------------------- |
| **message_id**     | **string**                                                   |             | [default to undefined] |
| **correlation_id** | **string**                                                   |             | [default to undefined] |
| **sender_uri**     | **string**                                                   |             | [default to undefined] |
| **recipient_uri**  | **string**                                                   |             | [default to undefined] |
| **objects**        | [**Array&lt;EdeskMessageObject&gt;**](EdeskMessageObject.md) |             | [default to undefined] |

## Example

```typescript
import { ApiMdurzRecordsPostRequest } from './api'

const instance: ApiMdurzRecordsPostRequest = {
  message_id,
  correlation_id,
  sender_uri,
  recipient_uri,
  objects,
}
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)

# EdeskDeliveryNotification

Doručenka na prevzatie správy.

## Properties

| Name                       | Type                                                                                | Description                               | Notes                             |
| -------------------------- | ----------------------------------------------------------------------------------- | ----------------------------------------- | --------------------------------- |
| **authorize_url**          | **string**                                                                          | URL na autorizáciu doručenky.             | [default to undefined]            |
| **delivery_period**        | **number**                                                                          | Lehota na prevzatie správy v dňoch.       | [optional] [default to undefined] |
| **delivery_period_end_at** | **string**                                                                          | Čas vypršania lehoty na prevzatie správy. | [optional] [default to undefined] |
| **received_at**            | **string**                                                                          | Čas doručenia doručenky.                  | [optional] [default to undefined] |
| **consignment**            | [**EdeskDeliveryNotificationConsignment**](EdeskDeliveryNotificationConsignment.md) |                                           | [default to undefined]            |

## Example

```typescript
import { EdeskDeliveryNotification } from './api'

const instance: EdeskDeliveryNotification = {
  authorize_url,
  delivery_period,
  delivery_period_end_at,
  received_at,
  consignment,
}
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)

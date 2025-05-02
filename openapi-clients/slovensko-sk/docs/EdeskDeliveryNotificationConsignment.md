# EdeskDeliveryNotificationConsignment

Informácie o správe na prevzatie.

## Properties

| Name                | Type                                                                                                                             | Description                                                                            | Notes                             |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | --------------------------------- |
| **message_id**      | **string**                                                                                                                       | SKTalk identifikátor správy na prevzatie.                                              | [default to undefined]            |
| **message_type**    | **string**                                                                                                                       | Typ správy na prevzatie.                                                               | [default to undefined]            |
| **message_subject** | **string**                                                                                                                       | Predmet správy na prevzatie.                                                           | [default to undefined]            |
| **attachments**     | [**Array&lt;EdeskDeliveryNotificationConsignmentAttachmentsInner&gt;**](EdeskDeliveryNotificationConsignmentAttachmentsInner.md) | Prílohy správy na prevzatie.                                                           | [default to undefined]            |
| **note**            | **string**                                                                                                                       | Poznámka k doručenke. Obsahuje napríklad informáciu, či sa uplatňuje fikcia doručenia. | [optional] [default to undefined] |

## Example

```typescript
import { EdeskDeliveryNotificationConsignment } from './api'

const instance: EdeskDeliveryNotificationConsignment = {
  message_id,
  message_type,
  message_subject,
  attachments,
  note,
}
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)

# EdeskMessage

Správa v schránke s obsahom a extrahovanými prílohami.

## Properties

| Name                             | Type                                                          | Description                                                                                                                                          | Notes                             |
| -------------------------------- | ------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| **reference_id**                 | **string**                                                    | SKTalk identifikátor referenčnej správy.                                                                                                             | [optional] [default to undefined] |
| **posp_id**                      | **string**                                                    | Identifikátor obsiahnutého formulára správy.                                                                                                         | [optional] [default to undefined] |
| **posp_version**                 | **string**                                                    | Verzia obsiahnutého formulára správy.                                                                                                                | [optional] [default to undefined] |
| **sender_uri**                   | **string**                                                    | Identifikátor odosielateľa správy.                                                                                                                   | [optional] [default to undefined] |
| **recipient_uri**                | **string**                                                    | Identifikátor prijímateľa správy.                                                                                                                    | [optional] [default to undefined] |
| **type**                         | **string**                                                    | Typ správy.                                                                                                                                          | [optional] [default to undefined] |
| **sender_business_reference**    | **string**                                                    |                                                                                                                                                      | [optional] [default to undefined] |
| **recipient_business_reference** | **string**                                                    |                                                                                                                                                      | [optional] [default to undefined] |
| **delivery_notification**        | [**EdeskDeliveryNotification**](EdeskDeliveryNotification.md) |                                                                                                                                                      | [optional] [default to undefined] |
| **objects**                      | [**Array&lt;EdeskMessageObject&gt;**](EdeskMessageObject.md)  | Extrahované prílohy správy.                                                                                                                          | [default to undefined]            |
| **original_html**                | **string**                                                    | HTML vizualizácia správy.                                                                                                                            | [default to undefined]            |
| **original_xml**                 | **string**                                                    | Pôvodný obsah správy.                                                                                                                                | [default to undefined]            |
| **parse_error**                  | **boolean**                                                   | Indikátor či došlo k chybe pri spracovaní správy na strane komponentu.                                                                               | [default to undefined]            |
| **id**                           | **number**                                                    | eDesk identifikátor správy.                                                                                                                          | [default to undefined]            |
| **\_class**                      | **string**                                                    | SKTalk trieda správy.                                                                                                                                | [default to undefined]            |
| **message_id**                   | **string**                                                    | SKTalk identifikátor správy. Správa odoslaná viacerým adresátom má rovnaké &#x60;message_id&#x60;, no rôzne eDesk &#x60;id&#x60; u každého adresáta. | [default to undefined]            |
| **correlation_id**               | **string**                                                    | SKTalk identifikátor vlákna správ.                                                                                                                   | [default to undefined]            |
| **subject**                      | **string**                                                    | Predmet správy.                                                                                                                                      | [default to undefined]            |
| **delivered_at**                 | **string**                                                    | Čas doručenia správy.                                                                                                                                | [default to undefined]            |

## Example

```typescript
import { EdeskMessage } from './api'

const instance: EdeskMessage = {
  reference_id,
  posp_id,
  posp_version,
  sender_uri,
  recipient_uri,
  type,
  sender_business_reference,
  recipient_business_reference,
  delivery_notification,
  objects,
  original_html,
  original_xml,
  parse_error,
  id,
  _class,
  message_id,
  correlation_id,
  subject,
  delivered_at,
}
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)

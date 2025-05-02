# EdeskHeader

Správa v schránke bez obsahu a extrahovaných príloh.

## Properties

| Name               | Type       | Description                                                                                                                                          | Notes                  |
| ------------------ | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| **id**             | **number** | eDesk identifikátor správy.                                                                                                                          | [default to undefined] |
| **\_class**        | **string** | SKTalk trieda správy.                                                                                                                                | [default to undefined] |
| **message_id**     | **string** | SKTalk identifikátor správy. Správa odoslaná viacerým adresátom má rovnaké &#x60;message_id&#x60;, no rôzne eDesk &#x60;id&#x60; u každého adresáta. | [default to undefined] |
| **correlation_id** | **string** | SKTalk identifikátor vlákna správ.                                                                                                                   | [default to undefined] |
| **subject**        | **string** | Predmet správy.                                                                                                                                      | [default to undefined] |
| **delivered_at**   | **string** | Čas doručenia správy.                                                                                                                                | [default to undefined] |

## Example

```typescript
import { EdeskHeader } from './api'

const instance: EdeskHeader = {
  id,
  _class,
  message_id,
  correlation_id,
  subject,
  delivered_at,
}
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)

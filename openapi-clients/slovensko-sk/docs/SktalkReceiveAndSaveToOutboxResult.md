# SktalkReceiveAndSaveToOutboxResult

Výsledok odoslania SKTalk správy a uloženia medzi odoslané správy.

## Properties

| Name                       | Type        | Description                                                                                                                              | Notes                  |
| -------------------------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| **receive_result**         | **number**  | Výsledok odoslania správy, hodnota &#x60;0&#x60; znamená úspešné prijatie správy na odoslanie.                                           | [default to undefined] |
| **receive_timeout**        | **boolean** | Indikátor či pri odoslaní správy prišlo k vypršaniu času požiadavky na ÚPVS.                                                             | [default to undefined] |
| **save_to_outbox_result**  | **number**  | Výsledok uloženia správy medzi odoslané správy, hodnota &#x60;0&#x60; znamená úspešné prijatie správy na uloženie medzi odoslané správy. | [default to undefined] |
| **save_to_outbox_timeout** | **boolean** | Indikátor či pri uložení správy medzi odoslané správy prišlo k vypršaniu času požiadavky na ÚPVS.                                        | [default to undefined] |

## Example

```typescript
import { SktalkReceiveAndSaveToOutboxResult } from './api'

const instance: SktalkReceiveAndSaveToOutboxResult = {
  receive_result,
  receive_timeout,
  save_to_outbox_result,
  save_to_outbox_timeout,
}
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)

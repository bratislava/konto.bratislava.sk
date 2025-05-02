# EdeskFolder

Priečinok v schránke.

## Properties

| Name          | Type        | Description                                                                    | Notes                             |
| ------------- | ----------- | ------------------------------------------------------------------------------ | --------------------------------- |
| **id**        | **number**  | eDesk identifikátor priečinka.                                                 | [default to undefined]            |
| **parent_id** | **number**  | eDesk identifikátor rodičovského priečinka.                                    | [optional] [default to undefined] |
| **name**      | **string**  | Názov priečinka.                                                               | [default to undefined]            |
| **system**    | **boolean** | Indikátor či ide o systémový priečinok alebo priečinok vytvorený používateľom. | [default to undefined]            |

## Example

```typescript
import { EdeskFolder } from './api'

const instance: EdeskFolder = {
  id,
  parent_id,
  name,
  system,
}
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)

# CepSigningObjectV2

Objekt na podpis v rámci modulu CEP pre volanie metódy `POST /api/cep/sign_v2`.

## Properties

| Name                  | Type       | Description                                                               | Notes                             |
| --------------------- | ---------- | ------------------------------------------------------------------------- | --------------------------------- |
| **id**                | **string** | Identifikátor objektu v tvare URI. Hodnota z evidencie dátových objektov. | [default to undefined]            |
| **data**              | **string** | Obsah objektu zakódovaný podľa hodnoty v base64.                          | [default to undefined]            |
| **name**              | **string** | Názov objektu.                                                            | [optional] [default to undefined] |
| **visualization_uri** | **string** | Identifikátor podpisovej vizualizácie.                                    | [optional] [default to undefined] |

## Example

```typescript
import { CepSigningObjectV2 } from './api'

const instance: CepSigningObjectV2 = {
  id,
  data,
  name,
  visualization_uri,
}
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)

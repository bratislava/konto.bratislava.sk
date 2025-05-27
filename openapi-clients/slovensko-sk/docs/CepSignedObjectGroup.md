# CepSignedObjectGroup

Podpísaná množina objektov ako ASiC kontajner.

## Properties

| Name                      | Type       | Description                                     | Notes                             |
| ------------------------- | ---------- | ----------------------------------------------- | --------------------------------- |
| **id**                    | **string** | Identifikátor podpisového konatjnera.           | [optional] [default to undefined] |
| **mime_type**             | **string** | MimeType podpisového kontajnera.                | [optional] [default to undefined] |
| **data**                  | **string** | Obsah ASiC kontajnera zakódovaný v base64.      | [optional] [default to undefined] |
| **timestamp_certificate** | **string** | Certifikát poslednej časovej pečiatky v base64. | [optional] [default to undefined] |

## Example

```typescript
import { CepSignedObjectGroup } from './api'

const instance: CepSignedObjectGroup = {
  id,
  mime_type,
  data,
  timestamp_certificate,
}
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)

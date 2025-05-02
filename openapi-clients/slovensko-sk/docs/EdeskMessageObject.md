# EdeskMessageObject

Objekt v správe. Napríklad PDF príloha, podpísaný kontajner (ASiC, ZEP) alebo XML formulár.

## Properties

| Name            | Type        | Description                                                                  | Notes                             |
| --------------- | ----------- | ---------------------------------------------------------------------------- | --------------------------------- |
| **id**          | **string**  | Identifikátor objektu.                                                       | [default to undefined]            |
| **name**        | **string**  | Názov objektu.                                                               | [optional] [default to undefined] |
| **description** | **string**  | Popis objektu.                                                               | [optional] [default to undefined] |
| **\_class**     | **string**  | Typ objektu.                                                                 | [default to undefined]            |
| **signed**      | **boolean** | Indikátor či je obsah objektu podpísaný.                                     | [optional] [default to undefined] |
| **mime_type**   | **string**  | Typ internetového média v súlade s typom a obsahom objektu.                  | [default to undefined]            |
| **encoding**    | **string**  | Kódovanie obsahu objektu v súlade s hodnotou v atribúte &#x60;content&#x60;. | [default to undefined]            |
| **content**     | **string**  | Obsah objektu zakódovaný podľa hodnoty v atribúte &#x60;encoding&#x60;.      | [default to undefined]            |

## Example

```typescript
import { EdeskMessageObject } from './api'

const instance: EdeskMessageObject = {
  id,
  name,
  description,
  _class,
  signed,
  mime_type,
  encoding,
  content,
}
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)

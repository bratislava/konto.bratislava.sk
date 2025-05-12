# ApiIamIdentitiesSearchPostRequestNaturalPerson

Fyzická osoba.

## Properties

| Name               | Type       | Description                          | Notes                             |
| ------------------ | ---------- | ------------------------------------ | --------------------------------- |
| **given_name**     | **string** | Meno. Pozri &#x60;match&#x60;.       | [optional] [default to undefined] |
| **family_name**    | **string** | Priezvisko. Pozri &#x60;match&#x60;. | [optional] [default to undefined] |
| **date_of_birth**  | **string** | Dátum narodenia.                     | [optional] [default to undefined] |
| **place_of_birth** | **string** | Miesto narodenia.                    | [optional] [default to undefined] |

## Example

```typescript
import { ApiIamIdentitiesSearchPostRequestNaturalPerson } from './api'

const instance: ApiIamIdentitiesSearchPostRequestNaturalPerson = {
  given_name,
  family_name,
  date_of_birth,
  place_of_birth,
}
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)

# HealthChecks

Kontroly komponentu.

## Properties

| Name                       | Type    | Description                                                                                                                                             | Notes                             |
| -------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| **environment_variables**  | **any** | Kontrola premenných prostredia.                                                                                                                         | [optional] [default to undefined] |
| **postgresql_connection**  | **any** | Kontrola spojenia s PostgreSQL databázou.                                                                                                               | [optional] [default to undefined] |
| **redis_connection**       | **any** | Kontrola spojenia s Redis úložiskom.                                                                                                                    | [optional] [default to undefined] |
| **authenticator_api**      | **any** | Kontrola autentifikátora API tokenov.                                                                                                                   | [optional] [default to undefined] |
| **authenticator_obo**      | **any** | Kontrola autentifikátora OBO tokenov. Vykoná sa iba ak je podpora ÚPVS SSO zapnutá.                                                                     | [optional] [default to undefined] |
| **eform_sync_certificate** | **any** | Kontrola expirácie STS certifikátu pre synchronizáciu formulárov. Vykoná sa iba ak je nastavená premenná &#x60;EFORM_SYNC_SUBJECT&#x60;.                | [optional] [default to undefined] |
| **eform_sync_task**        | **any** | Kontrola vykonávania synchronizácie formulárov. Vykoná sa iba ak je nastavená premenná &#x60;EFORM_SYNC_SUBJECT&#x60;.                                  | [optional] [default to undefined] |
| **sso_sp_certificate**     | **any** | Kontrola expirácie SSO SP certifikátu. Vykoná sa iba ak je podpora ÚPVS SSO zapnutá.                                                                    | [optional] [default to undefined] |
| **sso_proxy_certificate**  | **any** | Kontrola expirácie SSO STS certifikátu pre OBO prístup. Vykoná sa iba ak je podpora ÚPVS SSO zapnutá.                                                   | [optional] [default to undefined] |
| **sts_certificate**        | **any** | Kontrola expirácie STS certifikátu pre kontrolu spojenia s ÚPVS. Vykoná sa iba ak je nastavená premenná &#x60;STS_HEALTH_SUBJECT&#x60;.                 | [optional] [default to undefined] |
| **sts_creation_time**      | **any** | Kontrola času prvotného vytvorenia objektu pre komunikáciu s ÚPVS. Vykoná sa iba ak je nastavená premenná &#x60;STS_HEALTH_SUBJECT&#x60;.               | [optional] [default to undefined] |
| **sts_response_time**      | **any** | Kontrola času STS autentifikácie v rámci požiadavky na zistenie stavu formulára. Vykoná sa iba ak je nastavená premenná &#x60;STS_HEALTH_SUBJECT&#x60;. | [optional] [default to undefined] |

## Example

```typescript
import { HealthChecks } from './api'

const instance: HealthChecks = {
  environment_variables,
  postgresql_connection,
  redis_connection,
  authenticator_api,
  authenticator_obo,
  eform_sync_certificate,
  eform_sync_task,
  sso_sp_certificate,
  sso_proxy_certificate,
  sts_certificate,
  sts_creation_time,
  sts_response_time,
}
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)

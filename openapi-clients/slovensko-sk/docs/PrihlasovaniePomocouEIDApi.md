# PrihlasovaniePomocouEIDApi

All URIs are relative to *https://fix.slovensko-sk-api.staging.slovensko.digital*

| Method                      | HTTP request    | Description                                 |
| --------------------------- | --------------- | ------------------------------------------- |
| [**loginGet**](#loginget)   | **GET** /login  | Prihlási používateľa pomocou eID            |
| [**loginPost**](#loginpost) | **POST** /login | Prihlási používateľa pomocou SAML assertion |
| [**logoutGet**](#logoutget) | **GET** /logout | Odhlási používateľa                         |

# **loginGet**

> loginGet()

Prihlási používateľa pomocou slovensko.sk (ÚPVS). Po úspešnom prihlásení nasleduje presmerovanie späť na callback URL tretej strany nastavený v premenných prostredia API (LOGIN_CALLBACK_URL). V parametri `token` bude zaslaný OBO (On-Behalf-Of) token použiteľný na získanie údajov o prihlásenom používateľovi alebo na volanie ďaľších rozhraní v mene prihláseného používateľa.

### Example

```typescript
import { PrihlasovaniePomocouEIDApi, Configuration } from './api'

const configuration = new Configuration()
const apiInstance = new PrihlasovaniePomocouEIDApi(configuration)

const { status, data } = await apiInstance.loginGet()
```

### Parameters

This endpoint does not have any parameters.

### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: Not defined

### HTTP response details

| Status code | Description                                                                                   | Response headers |
| ----------- | --------------------------------------------------------------------------------------------- | ---------------- |
| **302**     | Úspešné presmerovanie na prihlasovaciu stránku ÚPVS a následne na callback URL tretej strany. | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **loginPost**

> LoginPost200Response loginPost(loginPostRequest)

Prihlási používateľa pomocou slovensko.sk (ÚPVS) na základe prijatej SAML assertion. Umožňuje vykonať ÚPVS SSO mimo slovensko-sk-api a poslať na API iba SAML assertion. V parametri `token` bude zaslaný OBO (On-Behalf-Of) token použiteľný na získanie údajov o prihlásenom používateľovi alebo na volanie ďaľších rozhraní v mene prihláseného používateľa.

### Example

```typescript
import { PrihlasovaniePomocouEIDApi, Configuration, LoginPostRequest } from './api'

const configuration = new Configuration()
const apiInstance = new PrihlasovaniePomocouEIDApi(configuration)

let loginPostRequest: LoginPostRequest //

const { status, data } = await apiInstance.loginPost(loginPostRequest)
```

### Parameters

| Name                 | Type                 | Description | Notes |
| -------------------- | -------------------- | ----------- | ----- |
| **loginPostRequest** | **LoginPostRequest** |             |       |

### Return type

**LoginPost200Response**

### Authorization

[API Token](../README.md#API Token)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

### HTTP response details

| Status code | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Response headers |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------- |
| **200**     | OBO token v JWT formáte, ktorého payload vyzerá nasledovne: { \&quot;sub\&quot;: \&quot;ico://sk/83130022\&quot;, \&quot;exp\&quot;: 1545153549, \&quot;nbf\&quot;: 1545146349, \&quot;iat\&quot;: 1545146349, \&quot;jti\&quot;: \&quot;ad8e5d2a-85ff-46b9-a13f-ac860db9acee\&quot;, \&quot;name\&quot;: \&quot;Identita 83130022\&quot;, \&quot;actor\&quot;: { \&quot;name\&quot;: \&quot;Janko Tisíci\&quot;, \&quot;sub\&quot;: \&quot;rc://sk/8314451337_tisici_janko\&quot; }, \&quot;scopes\&quot;: [ \&quot;sktalk/receive\&quot;, \&quot;sktalk/receive_and_save_to_outbox\&quot;, \&quot;sktalk/save_to_outbox\&quot; ] } | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **logoutGet**

> logoutGet()

Odhlási používateľa pomocou slovensko.sk (ÚPVS). Po úspešnom odhlásení nasleduje presmerovanie späť na callback URL tretej strany nastavený v premenných prostredia API (LOGOUT_CALLBACK_URL). Ak URL obsahuje callback (pri odhlásení iniciovanom zo strany ÚPVS), je potrebné spraviť redirect na callback.

### Example

```typescript
import { PrihlasovaniePomocouEIDApi, Configuration } from './api'

const configuration = new Configuration()
const apiInstance = new PrihlasovaniePomocouEIDApi(configuration)

const { status, data } = await apiInstance.logoutGet()
```

### Parameters

This endpoint does not have any parameters.

### Return type

void (empty response body)

### Authorization

[API + OBO Token](../README.md#API + OBO Token)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: Not defined

### HTTP response details

| Status code | Description                                          | Response headers |
| ----------- | ---------------------------------------------------- | ---------------- |
| **302**     | Úspešné presmerovanie na callback URL tretej strany. | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

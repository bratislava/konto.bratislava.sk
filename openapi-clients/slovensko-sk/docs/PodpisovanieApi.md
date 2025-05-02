# PodpisovanieApi

All URIs are relative to *https://fix.slovensko-sk-api.staging.slovensko.digital*

| Method                                                    | HTTP request                      | Description                               |
| --------------------------------------------------------- | --------------------------------- | ----------------------------------------- |
| [**apiCepAddTimestampPost**](#apicepaddtimestamppost)     | **POST** /api/cep/add_timestamp   | Pridá kvalifikovanú časovú pečiatku.      |
| [**apiCepSignPost**](#apicepsignpost)                     | **POST** /api/cep/sign            | Podpíše súbor elektronickou pečaťou       |
| [**apiCepSignV2Post**](#apicepsignv2post)                 | **POST** /api/cep/sign_v2         | Podpíše súbory elektronickou pečaťou      |
| [**apiCepSignaturesInfoPost**](#apicepsignaturesinfopost) | **POST** /api/cep/signatures_info | Vráti informácie o type a forme podpisov. |
| [**apiCepVerifyPost**](#apicepverifypost)                 | **POST** /api/cep/verify          | Informatívne overí podpisy na súbore      |

# **apiCepAddTimestampPost**

> ApiCepAddTimestampPost200Response apiCepAddTimestampPost(apiCepAddTimestampPostRequest)

Rozšíri digitálny podpis z EPES na T formu pridaním kvalifikovanej časovej pečiatky.

### Example

```typescript
import { PodpisovanieApi, Configuration, ApiCepAddTimestampPostRequest } from './api'

const configuration = new Configuration()
const apiInstance = new PodpisovanieApi(configuration)

let apiCepAddTimestampPostRequest: ApiCepAddTimestampPostRequest //

const { status, data } = await apiInstance.apiCepAddTimestampPost(apiCepAddTimestampPostRequest)
```

### Parameters

| Name                              | Type                              | Description | Notes |
| --------------------------------- | --------------------------------- | ----------- | ----- |
| **apiCepAddTimestampPostRequest** | **ApiCepAddTimestampPostRequest** |             |       |

### Return type

**ApiCepAddTimestampPost200Response**

### Authorization

[API Token](../README.md#API Token)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

### HTTP response details

| Status code | Description                                       | Response headers |
| ----------- | ------------------------------------------------- | ---------------- |
| **200**     | Úspešne pridanie kvalifikovanej časovej pečiatky. | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **apiCepSignPost**

> ApiCepSignPost200Response apiCepSignPost(apiCepSignPostRequest)

Podpíše súbor elektronickou pečaťou. Umožňuje aj pridanie podpisu k už podpísanému dokumentu.

### Example

```typescript
import { PodpisovanieApi, Configuration, ApiCepSignPostRequest } from './api'

const configuration = new Configuration()
const apiInstance = new PodpisovanieApi(configuration)

let apiCepSignPostRequest: ApiCepSignPostRequest //

const { status, data } = await apiInstance.apiCepSignPost(apiCepSignPostRequest)
```

### Parameters

| Name                      | Type                      | Description | Notes |
| ------------------------- | ------------------------- | ----------- | ----- |
| **apiCepSignPostRequest** | **ApiCepSignPostRequest** |             |       |

### Return type

**ApiCepSignPost200Response**

### Authorization

[API Token](../README.md#API Token)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

### HTTP response details

| Status code | Description                                    | Response headers |
| ----------- | ---------------------------------------------- | ---------------- |
| **200**     | Úspešne podpísaný súbor elektronickou pečaťou. | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **apiCepSignV2Post**

> ApiCepSignV2Post200Response apiCepSignV2Post(apiCepSignV2PostRequest)

Podpíše súbory elektronickou pečaťou a overí vstupné dokumenty vočí validátorom dátových objektov. Spracúva viacero skupín objektov v jednom requeste. Umožňuje aj spoločne podpisovať viacero nepodpísaných objektov jedným podpisom, pridávať podpis do podpisovej obálky a spoločne podpisovať nepodpísané objekty s už podpísanými objektami z ASiC-E XAdES alebo ASiC-E CAdES jedným podpisom.

### Example

```typescript
import { PodpisovanieApi, Configuration, ApiCepSignV2PostRequest } from './api'

const configuration = new Configuration()
const apiInstance = new PodpisovanieApi(configuration)

let apiCepSignV2PostRequest: ApiCepSignV2PostRequest //

const { status, data } = await apiInstance.apiCepSignV2Post(apiCepSignV2PostRequest)
```

### Parameters

| Name                        | Type                        | Description | Notes |
| --------------------------- | --------------------------- | ----------- | ----- |
| **apiCepSignV2PostRequest** | **ApiCepSignV2PostRequest** |             |       |

### Return type

**ApiCepSignV2Post200Response**

### Authorization

[API Token](../README.md#API Token)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

### HTTP response details

| Status code | Description                                     | Response headers |
| ----------- | ----------------------------------------------- | ---------------- |
| **200**     | Úspešne podpísané súbory elektronickou pečaťou. | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **apiCepSignaturesInfoPost**

> ApiCepSignaturesInfoPost200Response apiCepSignaturesInfoPost(apiCepSignaturesInfoPostRequest)

Vráti informácie o type a forme podpisov podpísaného dokumentu. Neoveruje platnosť podpisov, ani časových pečiatok, tak isto neoveruje legislatívnu formu podpisu.

### Example

```typescript
import { PodpisovanieApi, Configuration, ApiCepSignaturesInfoPostRequest } from './api'

const configuration = new Configuration()
const apiInstance = new PodpisovanieApi(configuration)

let apiCepSignaturesInfoPostRequest: ApiCepSignaturesInfoPostRequest //

const { status, data } = await apiInstance.apiCepSignaturesInfoPost(apiCepSignaturesInfoPostRequest)
```

### Parameters

| Name                                | Type                                | Description | Notes |
| ----------------------------------- | ----------------------------------- | ----------- | ----- |
| **apiCepSignaturesInfoPostRequest** | **ApiCepSignaturesInfoPostRequest** |             |       |

### Return type

**ApiCepSignaturesInfoPost200Response**

### Authorization

[API Token](../README.md#API Token)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

### HTTP response details

| Status code | Description                            | Response headers |
| ----------- | -------------------------------------- | ---------------- |
| **200**     | Úspešne zistenie typu a formy podpisu. | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **apiCepVerifyPost**

> ApiCepVerifyPost200Response apiCepVerifyPost(apiCepVerifyPostRequest)

Informatívne overí podpisy na súbore. Informácie o overení ZEP vracia na základe údajov, ktoré má k dispozícii v čase volania. Pre formáty podpisov bez časovej pečiatky nezabezpečuje ich rozšírenie o časovú pečiatku.

### Example

```typescript
import { PodpisovanieApi, Configuration, ApiCepVerifyPostRequest } from './api'

const configuration = new Configuration()
const apiInstance = new PodpisovanieApi(configuration)

let apiCepVerifyPostRequest: ApiCepVerifyPostRequest //

const { status, data } = await apiInstance.apiCepVerifyPost(apiCepVerifyPostRequest)
```

### Parameters

| Name                        | Type                        | Description | Notes |
| --------------------------- | --------------------------- | ----------- | ----- |
| **apiCepVerifyPostRequest** | **ApiCepVerifyPostRequest** |             |       |

### Return type

**ApiCepVerifyPost200Response**

### Authorization

[API Token](../README.md#API Token)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

### HTTP response details

| Status code | Description                                     | Response headers |
| ----------- | ----------------------------------------------- | ---------------- |
| **200**     | Úspešne informatívne overené podpisy na súbore. | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

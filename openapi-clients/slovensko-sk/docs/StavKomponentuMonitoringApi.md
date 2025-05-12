# StavKomponentuMonitoringApi

All URIs are relative to *https://fix.slovensko-sk-api.staging.slovensko.digital*

| Method                      | HTTP request    | Description           |
| --------------------------- | --------------- | --------------------- |
| [**healthGet**](#healthget) | **GET** /health | Vráti stav komponentu |

# **healthGet**

> Health healthGet()

### Example

```typescript
import { StavKomponentuMonitoringApi, Configuration } from './api'

const configuration = new Configuration()
const apiInstance = new StavKomponentuMonitoringApi(configuration)

const { status, data } = await apiInstance.healthGet()
```

### Parameters

This endpoint does not have any parameters.

### Return type

**Health**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

### HTTP response details

| Status code | Description                          | Response headers |
| ----------- | ------------------------------------ | ---------------- |
| **200**     | Stav komponentu bol úspešne vrátený. | -                |
| **503**     | Stav komponentu bol úspešne vrátený. | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

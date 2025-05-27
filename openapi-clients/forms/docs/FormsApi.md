# FormsApi

All URIs are relative to _http://localhost:3000_

| Method                                                                | HTTP request                      | Description                                        |
| --------------------------------------------------------------------- | --------------------------------- | -------------------------------------------------- |
| [**formsControllerBumpJsonVersion**](#formscontrollerbumpjsonversion) | **POST** /forms/{id}/bump-version | Bump form JSON version to latest available version |

# **formsControllerBumpJsonVersion**

> BumpJsonVersionResponseDto formsControllerBumpJsonVersion()

Updates form JSON version if a newer version is available

### Example

```typescript
import { FormsApi, Configuration } from './api'

const configuration = new Configuration()
const apiInstance = new FormsApi(configuration)

let id: string // (default to undefined)

const { status, data } = await apiInstance.formsControllerBumpJsonVersion(id)
```

### Parameters

| Name   | Type         | Description | Notes                 |
| ------ | ------------ | ----------- | --------------------- |
| **id** | [**string**] |             | defaults to undefined |

### Return type

**BumpJsonVersionResponseDto**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

### HTTP response details

| Status code | Description                 | Response headers |
| ----------- | --------------------------- | ---------------- |
| **200**     | Version successfully bumped | -                |
| **201**     |                             | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

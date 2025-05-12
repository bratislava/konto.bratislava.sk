# TaxApi

All URIs are relative to _http://localhost:3000_

| Method                                                              | HTTP request                     | Description                          |
| ------------------------------------------------------------------- | -------------------------------- | ------------------------------------ |
| [**taxControllerGetActualTaxes**](#taxcontrollergetactualtaxes)     | **GET** /tax/get-tax-by-year     | Get tax by year and how much is paid |
| [**taxControllerGetArchivedTaxes**](#taxcontrollergetarchivedtaxes) | **GET** /tax/taxes               | Get all taxes (paid and not paid)    |
| [**taxControllerGetTaxByYearPdf**](#taxcontrollergettaxbyyearpdf)   | **GET** /tax/get-tax-pdf-by-year | Get tax by year and how much is paid |

# **taxControllerGetActualTaxes**

> ResponseTaxDto taxControllerGetActualTaxes()

### Example

```typescript
import { TaxApi, Configuration } from './api'

const configuration = new Configuration()
const apiInstance = new TaxApi(configuration)

let year: number // (default to undefined)

const { status, data } = await apiInstance.taxControllerGetActualTaxes(year)
```

### Parameters

| Name     | Type         | Description | Notes                 |
| -------- | ------------ | ----------- | --------------------- |
| **year** | [**number**] |             | defaults to undefined |

### Return type

**ResponseTaxDto**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

### HTTP response details

| Status code | Description              | Response headers |
| ----------- | ------------------------ | ---------------- |
| **200**     | Load tax data about user | -                |
| **422**     | Error to load tax data   | -                |
| **500**     | Internal server error    | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **taxControllerGetArchivedTaxes**

> ResponseGetTaxesDto taxControllerGetArchivedTaxes()

### Example

```typescript
import { TaxApi, Configuration } from './api'

const configuration = new Configuration()
const apiInstance = new TaxApi(configuration)

const { status, data } = await apiInstance.taxControllerGetArchivedTaxes()
```

### Parameters

This endpoint does not have any parameters.

### Return type

**ResponseGetTaxesDto**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

### HTTP response details

| Status code | Description                                  | Response headers |
| ----------- | -------------------------------------------- | ---------------- |
| **200**     | Load list of taxes by limit, default value 5 | -                |
| **422**     | Error to load tax data                       | -                |
| **500**     | Internal server error                        | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **taxControllerGetTaxByYearPdf**

> ResponseTaxDto taxControllerGetTaxByYearPdf()

### Example

```typescript
import { TaxApi, Configuration } from './api'

const configuration = new Configuration()
const apiInstance = new TaxApi(configuration)

let year: number // (default to undefined)

const { status, data } = await apiInstance.taxControllerGetTaxByYearPdf(year)
```

### Parameters

| Name     | Type         | Description | Notes                 |
| -------- | ------------ | ----------- | --------------------- |
| **year** | [**number**] |             | defaults to undefined |

### Return type

**ResponseTaxDto**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

### HTTP response details

| Status code | Description           | Response headers |
| ----------- | --------------------- | ---------------- |
| **200**     | Return pdf            | -                |
| **422**     | Error generate pdf    | -                |
| **500**     | Internal server error | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

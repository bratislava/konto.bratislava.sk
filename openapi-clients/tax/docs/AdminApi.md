# AdminApi

All URIs are relative to _http://localhost:3000_

| Method                                                                                              | HTTP request                                                     | Description                                                      |
| --------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- | ---------------------------------------------------------------- |
| [**adminControllerCreateTestingTax**](#admincontrollercreatetestingtax)                             | **POST** /admin/create-testing-tax                               | Create a testing tax record                                      |
| [**adminControllerDeleteTax**](#admincontrollerdeletetax)                                           | **POST** /admin/delete-tax                                       | Delete a tax record                                              |
| [**adminControllerLoadDataFromNorris**](#admincontrollerloaddatafromnorris)                         | **POST** /admin/create-data-from-noris                           | Integrate data from norris if not exists by birth numbers or all |
| [**adminControllerRemoveDeliveryMethodsFromNoris**](#admincontrollerremovedeliverymethodsfromnoris) | **POST** /admin/remove-delivery-methods-from-noris/{birthNumber} | Remove delivery methods for given birth number.                  |
| [**adminControllerUpdateDataFromNorris**](#admincontrollerupdatedatafromnorris)                     | **POST** /admin/update-data-from-norris                          | Integrate data from norris                                       |
| [**adminControllerUpdateDeliveryMethodsInNoris**](#admincontrollerupdatedeliverymethodsinnoris)     | **POST** /admin/update-delivery-methods-in-noris                 | Update delivery methods for given birth numbers and date.        |
| [**adminControllerUpdatePaymentsFromNoris**](#admincontrollerupdatepaymentsfromnoris)               | **POST** /admin/payments-from-noris                              | Integrate Paid for day from - to.                                |

# **adminControllerCreateTestingTax**

> adminControllerCreateTestingTax(requestAdminCreateTestingTaxDto)

Creates a testing tax record with specified details for development and testing purposes

### Example

```typescript
import { AdminApi, Configuration, RequestAdminCreateTestingTaxDto } from './api'

const configuration = new Configuration()
const apiInstance = new AdminApi(configuration)

let requestAdminCreateTestingTaxDto: RequestAdminCreateTestingTaxDto //

const { status, data } = await apiInstance.adminControllerCreateTestingTax(
  requestAdminCreateTestingTaxDto,
)
```

### Parameters

| Name                                | Type                                | Description | Notes |
| ----------------------------------- | ----------------------------------- | ----------- | ----- |
| **requestAdminCreateTestingTaxDto** | **RequestAdminCreateTestingTaxDto** |             |       |

### Return type

void (empty response body)

### Authorization

[apiKey](../README.md#apiKey)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: Not defined

### HTTP response details

| Status code | Description                             | Response headers |
| ----------- | --------------------------------------- | ---------------- |
| **200**     | Testing tax record created successfully | -                |
| **500**     | Internal server error                   | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **adminControllerDeleteTax**

> adminControllerDeleteTax(requestAdminDeleteTaxDto)

Deletes a tax record for a specific birth number and year

### Example

```typescript
import { AdminApi, Configuration, RequestAdminDeleteTaxDto } from './api'

const configuration = new Configuration()
const apiInstance = new AdminApi(configuration)

let requestAdminDeleteTaxDto: RequestAdminDeleteTaxDto //

const { status, data } = await apiInstance.adminControllerDeleteTax(requestAdminDeleteTaxDto)
```

### Parameters

| Name                         | Type                         | Description | Notes |
| ---------------------------- | ---------------------------- | ----------- | ----- |
| **requestAdminDeleteTaxDto** | **RequestAdminDeleteTaxDto** |             |       |

### Return type

void (empty response body)

### Authorization

[apiKey](../README.md#apiKey)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: Not defined

### HTTP response details

| Status code | Description                                  | Response headers |
| ----------- | -------------------------------------------- | ---------------- |
| **200**     | Tax record deleted successfully              | -                |
| **500**     | Internal server error or tax payer not found | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **adminControllerLoadDataFromNorris**

> CreateBirthNumbersResponseDto adminControllerLoadDataFromNorris(requestPostNorisLoadDataDto)

### Example

```typescript
import { AdminApi, Configuration, RequestPostNorisLoadDataDto } from './api'

const configuration = new Configuration()
const apiInstance = new AdminApi(configuration)

let requestPostNorisLoadDataDto: RequestPostNorisLoadDataDto //

const { status, data } = await apiInstance.adminControllerLoadDataFromNorris(
  requestPostNorisLoadDataDto,
)
```

### Parameters

| Name                            | Type                            | Description | Notes |
| ------------------------------- | ------------------------------- | ----------- | ----- |
| **requestPostNorisLoadDataDto** | **RequestPostNorisLoadDataDto** |             |       |

### Return type

**CreateBirthNumbersResponseDto**

### Authorization

[apiKey](../README.md#apiKey)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

### HTTP response details

| Status code | Description          | Response headers |
| ----------- | -------------------- | ---------------- |
| **200**     | Load data from noris | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **adminControllerRemoveDeliveryMethodsFromNoris**

> adminControllerRemoveDeliveryMethodsFromNoris()

Used when deactivating user from city account, to mark that this user does not have delivery methods anymore.

### Example

```typescript
import { AdminApi, Configuration } from './api'

const configuration = new Configuration()
const apiInstance = new AdminApi(configuration)

let birthNumber: string // (default to undefined)

const { status, data } =
  await apiInstance.adminControllerRemoveDeliveryMethodsFromNoris(birthNumber)
```

### Parameters

| Name            | Type         | Description | Notes                 |
| --------------- | ------------ | ----------- | --------------------- |
| **birthNumber** | [**string**] |             | defaults to undefined |

### Return type

void (empty response body)

### Authorization

[apiKey](../README.md#apiKey)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: Not defined

### HTTP response details

| Status code | Description                           | Response headers |
| ----------- | ------------------------------------- | ---------------- |
| **200**     | Records successfully updated in Noris | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **adminControllerUpdateDataFromNorris**

> adminControllerUpdateDataFromNorris(requestPostNorisLoadDataDto)

### Example

```typescript
import { AdminApi, Configuration, RequestPostNorisLoadDataDto } from './api'

const configuration = new Configuration()
const apiInstance = new AdminApi(configuration)

let requestPostNorisLoadDataDto: RequestPostNorisLoadDataDto //

const { status, data } = await apiInstance.adminControllerUpdateDataFromNorris(
  requestPostNorisLoadDataDto,
)
```

### Parameters

| Name                            | Type                            | Description | Notes |
| ------------------------------- | ------------------------------- | ----------- | ----- |
| **requestPostNorisLoadDataDto** | **RequestPostNorisLoadDataDto** |             |       |

### Return type

void (empty response body)

### Authorization

[apiKey](../README.md#apiKey)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: Not defined

### HTTP response details

| Status code | Description          | Response headers |
| ----------- | -------------------- | ---------------- |
| **200**     | Load data from noris | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **adminControllerUpdateDeliveryMethodsInNoris**

> adminControllerUpdateDeliveryMethodsInNoris(requestUpdateNorisDeliveryMethodsDto)

### Example

```typescript
import { AdminApi, Configuration, RequestUpdateNorisDeliveryMethodsDto } from './api'

const configuration = new Configuration()
const apiInstance = new AdminApi(configuration)

let requestUpdateNorisDeliveryMethodsDto: RequestUpdateNorisDeliveryMethodsDto //

const { status, data } = await apiInstance.adminControllerUpdateDeliveryMethodsInNoris(
  requestUpdateNorisDeliveryMethodsDto,
)
```

### Parameters

| Name                                     | Type                                     | Description | Notes |
| ---------------------------------------- | ---------------------------------------- | ----------- | ----- |
| **requestUpdateNorisDeliveryMethodsDto** | **RequestUpdateNorisDeliveryMethodsDto** |             |       |

### Return type

void (empty response body)

### Authorization

[apiKey](../README.md#apiKey)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: Not defined

### HTTP response details

| Status code | Description                           | Response headers |
| ----------- | ------------------------------------- | ---------------- |
| **200**     | Records successfully updated in Noris | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **adminControllerUpdatePaymentsFromNoris**

> adminControllerUpdatePaymentsFromNoris(requestPostNorisPaymentDataLoadDto)

### Example

```typescript
import { AdminApi, Configuration, RequestPostNorisPaymentDataLoadDto } from './api'

const configuration = new Configuration()
const apiInstance = new AdminApi(configuration)

let requestPostNorisPaymentDataLoadDto: RequestPostNorisPaymentDataLoadDto //

const { status, data } = await apiInstance.adminControllerUpdatePaymentsFromNoris(
  requestPostNorisPaymentDataLoadDto,
)
```

### Parameters

| Name                                   | Type                                   | Description | Notes |
| -------------------------------------- | -------------------------------------- | ----------- | ----- |
| **requestPostNorisPaymentDataLoadDto** | **RequestPostNorisPaymentDataLoadDto** |             |       |

### Return type

void (empty response body)

### Authorization

[apiKey](../README.md#apiKey)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: Not defined

### HTTP response details

| Status code | Description                                                                              | Response headers |
| ----------- | ---------------------------------------------------------------------------------------- | ---------------- |
| **200**     | Integrate Paid for day from Noris to our database from date of last integration to today | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

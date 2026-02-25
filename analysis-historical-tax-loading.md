# Analysis: Loading Historical Taxes for All Verified Users

## Current Behavior

### Tax Loading Process
The tax loading system currently works as follows:

1. **User Registration Flow** (`nest-tax-backend/src/tasks/tasks.service.ts:loadTaxesForUsers`):
   - New users are loaded from City Account every 30 seconds
   - Tax data is fetched only for the **current year**
   - Process alternates between DZN (real estate tax) and KO (dog tax) every 3 minutes

2. **Year Scope** (`nest-tax-backend/src/tasks/tasks.service.ts:207-277`):
   ```typescript
   const year = new Date().getFullYear()  // Only current year
   ```

3. **Tax Import Flow**:
   - `loadTaxDataForUserByTaxType()` → calls `taxImportHelperSubservice.importTaxes()`
   - `importTaxes()` → calls `norisService.getAndProcessNewNorisTaxDataByBirthNumberAndYear()`
   - Year is always `new Date().getFullYear()`

### Bloomreach Email System

The system uses Bloomreach for email notifications:

1. **Tax Creation Event** (`nest-tax-backend/src/noris/subservices/noris-tax/noris-tax.subservice.abstract.ts:465`):
   - `trackEventTax()` is called when a new tax is created
   - Bloomreach receives: `{ amount, year, delivery_method, tax_type, order }`
   - No `suppress_email` flag exists for tax creation events

2. **Payment Event** (`nest-tax-backend/src/noris/subservices/noris-payment.subservice.ts:358`):
   - `trackEventTaxPayment()` is called when payment is recorded
   - **Has `suppress_email` flag**: `suppress_email: bloomreachSettings?.suppressEmail ?? false`

3. **Unpaid Tax Reminder** (`nest-tax-backend/src/tasks/tasks.service.ts:sendUnpaidTaxReminders`):
   - Sent for taxes older than 15 days
   - Controlled by `bloomreachUnpaidTaxReminderSent` flag in database

## Required Changes

### 1. Modify Tax Loading to Support Multiple Years

**File**: `nest-tax-backend/src/tasks/tasks.service.ts`

**Changes needed**:
- Modify `loadTaxDataForUserByTaxType()` to load taxes from 2020 to current year
- Add logic to determine which years to load per user
- Ensure newly created users get all historical years immediately
- Existing users should get historical years loaded progressively

**Approach**:
```typescript
private async loadTaxDataForUserByTaxType(taxType: TaxType) {
  const currentYear = new Date().getFullYear()
  const FIRST_HISTORICAL_YEAR = 2020

  // IMPORTANT: Different strategies to minimize Noris database load:
  // - NEW users: Load all years at once (they're added one at a time, so acceptable)
  // - EXISTING users: Load ONE year per cycle to spread the load

  const { newUsers, existingUsers } = await this.getUsersNeedingTaxes(taxType)

  // NEW USERS: Load all years (2020 to current)
  for (const user of newUsers) {
    for (let year = FIRST_HISTORICAL_YEAR; year <= currentYear; year++) {
      const suppressEmail = year < currentYear
      await this.taxImportHelperSubservice.importTaxes(
        taxType,
        [user.birthNumber],
        year,
        suppressEmail,
      )
    }
  }

  // EXISTING USERS: Load one year at a time
  for (const user of existingUsers) {
    const missingYears = await this.getMissingYears(user, taxType, FIRST_HISTORICAL_YEAR, currentYear)
    const yearToLoad = missingYears.length > 0 ? missingYears[0] : null // Load most recent missing year

    if (yearToLoad) {
      const suppressEmail = yearToLoad < currentYear
      await this.taxImportHelperSubservice.importTaxes(
        taxType,
        [user.birthNumber],
        yearToLoad,
        suppressEmail,
      )
    }
  }
}
```

### 2. Add suppress_email Support for Tax Creation

**File**: `nest-tax-backend/src/bloomreach/bloomreach.types.ts`

**Changes needed**:
```typescript
export type TaxBloomreachData = {
  year: number
  amount: number
  delivery_method: DeliveryMethodNamed | null
  tax_type: TaxType
  order: number
  suppress_email?: boolean  // ADD THIS
}
```

**File**: `nest-tax-backend/src/noris/subservices/noris-tax/noris-tax.subservice.abstract.ts`

**Changes needed** (line ~465):
```typescript
const trackingSuccess = await this.bloomreachService.trackEventTax(
  {
    amount: amountToTrack,
    year,
    delivery_method: userFromCityAccount.taxDeliveryMethodAtLockDate ?? null,
    tax_type: taxDefinition.type,
    order: tax.order!,
    suppress_email: options.suppressEmail ?? false,  // ADD THIS
  },
  userFromCityAccount.externalId ?? undefined,
)
```

**File**: `nest-tax-backend/src/admin/dtos/requests.dto.ts`

**Changes needed**:
```typescript
export class RequestPostNorisLoadDataOptionsDto {
  @ApiPropertyOptional({ description: 'Suppress email notifications for tax creation' })
  @IsOptional()
  @IsBoolean()
  suppressEmail?: boolean  // ADD THIS

  // ... existing fields
}
```

### 3. Update Import Functions to Pass suppressEmail Flag

**File**: `nest-tax-backend/src/tasks/subservices/tax-import-helper.subservice.ts`

**Changes needed**:
```typescript
async importTaxes(
  taxType: TaxType,
  birthNumbers: string[],
  year: number,
  suppressEmail: boolean = false,  // ADD THIS PARAMETER
): Promise<void> {
  if (birthNumbers.length === 0) {
    return
  }

  const result = await this.norisService.getAndProcessNewNorisTaxDataByBirthNumberAndYear(
    taxType,
    year,
    birthNumbers,
    {
      prepareOnly: false,
      suppressEmail,  // PASS THIS
    },
  )

  // ... rest of implementation
}
```

### 4. Update Tasks Service to Suppress Emails for Historical Years

**File**: `nest-tax-backend/src/tasks/tasks.service.ts`

**Changes needed**:
```typescript
private async loadTaxDataForUserByTaxType(taxType: TaxType) {
  const currentYear = new Date().getFullYear()
  const FIRST_HISTORICAL_YEAR = 2020

  // ... year selection logic ...

  // For current year: suppressEmail = false (send emails)
  // For historical years (< currentYear): suppressEmail = true (don't send emails)
  const suppressEmail = yearToLoad < currentYear

  await this.taxImportHelperSubservice.importTaxes(
    taxType,
    birthNumbers,
    yearToLoad,
    suppressEmail,
  )
}
```

### 5. Bloomreach Configuration

**Status: ✅ CONFIRMED**
- Bloomreach has the `suppress_email` boolean flag already implemented and ready to use
- When `suppress_email: true` is sent in the tax creation event, no tax creation emails will be sent
- Only needs to be added to the backend code (type definitions and event tracking)

## Implementation Strategy

### Phase 1: Add suppressEmail Support
1. Add `suppressEmail` field to `TaxBloomreachData` type
2. Add `suppressEmail` to `RequestPostNorisLoadDataOptionsDto`
3. Pass `suppressEmail` through the entire call chain:
   - `importTaxes()` → `getAndProcessNewNorisTaxDataByBirthNumberAndYear()` → `processNorisTaxData()` → `trackEventTax()`
4. Test with a single user and historical year to ensure no emails are sent

### Phase 2: Implement Multi-Year Loading Logic (with Noris Load Protection)
1. Modify `loadTaxDataForUserByTaxType()` to support loading multiple years
2. Implement **different strategies for new vs existing users** to minimize Noris database load:
   - **NEW users**: Load ALL years (2020 to current) immediately
     - Rationale: New users are added one at a time, so the load is acceptable
     - Set `suppressEmail: true` for historical years (year < currentYear)
   - **EXISTING users**: Load ONE year per cycle to spread the load
     - Rationale: Many existing users need backfill, so we must spread this over time
     - Priority: Load most recent missing year first (current year → 2024 → 2023 → ... → 2020)
3. Add configuration for first historical year (2020) as a constant or config value
4. Track which years have been loaded per user to avoid duplicate processing
5. Distinguish between new and existing users:
   - New users: Those being loaded for the first time from `loadNewUsersFromCityAccount`
   - Existing users: Those already in the system but missing historical years

### Phase 3: Testing & Rollout
1. Test with a small batch of users
2. Monitor Bloomreach events to ensure:
   - Current year taxes send emails (`suppress_email: false`)
   - Historical year taxes don't send emails (`suppress_email: true`)
3. Monitor database to ensure all users eventually get all years (2020-current)
4. Gradually roll out to all users

## Edge Cases to Consider

### Reminder Emails for Historical Years

**Requirement**: "mail s pripomienkou uhrady a splatok dane neposielame" (No email reminders for previous years)

**Problem**:
- Current logic sends reminders for taxes created > 15 days ago
- Historical taxes loaded now would be "old" immediately
- We must prevent reminder emails for historical unpaid taxes

**Solution (implement BOTH for safety)**:
1. **Set flag at creation**: Set `bloomreachUnpaidTaxReminderSent: true` for all historical taxes (year < currentYear)
2. **Modify reminder query**: Exclude taxes with `year < currentYear` from the reminder cron job

**Implementation locations**:
- `nest-tax-backend/src/noris/subservices/noris-tax/noris-tax.subservice.abstract.ts` (set flag at creation)
- `nest-tax-backend/src/tasks/tasks.service.ts:sendUnpaidTaxReminders` (modify query to check year)

## Files to Modify

1. **Core Loading Logic**:
   - `nest-tax-backend/src/tasks/tasks.service.ts` (loadTaxDataForUserByTaxType, sendUnpaidTaxReminders)
   - `nest-tax-backend/src/tasks/subservices/tax-import-helper.subservice.ts` (importTaxes, prepareTaxes)

2. **Type Definitions**:
   - `nest-tax-backend/src/bloomreach/bloomreach.types.ts` (TaxBloomreachData - add suppressEmail)
   - `nest-tax-backend/src/admin/dtos/requests.dto.ts` (RequestPostNorisLoadDataOptionsDto - add suppressEmail)

3. **Service Layer**:
   - `nest-tax-backend/src/noris/subservices/noris-tax/noris-tax.subservice.abstract.ts` (processTaxRecordFromNoris - pass suppressEmail, set bloomreachUnpaidTaxReminderSent flag)
   - `nest-tax-backend/src/noris/noris.service.ts` (getAndProcessNewNorisTaxDataByBirthNumberAndYear signature)

4. **Tests** (will need updates):
   - `nest-tax-backend/src/tasks/__tests__/tasks.service.spec.ts`
   - `nest-tax-backend/src/tasks/subservices/__tests__/tax-import-helper.subservice.spec.ts`

## Open Questions

1. ~~**Bloomreach Flag**: Is `suppress_email` already implemented in Bloomreach for tax creation events?~~
   - ✅ **CONFIRMED**: The `suppress_email` boolean flag is ready and implemented in Bloomreach

2. **Performance - Noris Database Load**: Loading taxes for years 2020-2025 (6 years) for all users will create significant load
   - ⚠️ **CONCERN**: External Noris database cannot handle significantly increased request volume
   - **Solution**: Different strategies for new vs existing users:
     - **New users**: Backfill all years (2020 to current) - acceptable since they're being added one at a time
     - **Existing users**: Backfill one year at a time (e.g., load 2024, then 2023, then 2022, etc.) to spread the load
   - **Recommendation**: Use existing batch size limits and cron frequency to control load

3. ~~**Database Constraints**: Are there any unique constraints that might conflict when loading historical taxes?~~
   - ✅ **CONFIRMED**: Database constraints are correct
   - DZN has unique constraint per (taxpayer, year, type)
   - KO allows multiple per year (different dogs)
   - Any errors will be caused by external Noris database issues (expected and desired behavior)

4. ~~**Reminder Logic**: Should we prevent reminders for historical taxes entirely?~~
   - ✅ **DECISION**: Implement BOTH approaches for safety (see Edge Cases section)

## Next Steps

1. ~~Confirm Bloomreach `suppress_email` flag support for tax creation events~~ ✅
2. Implement `suppressEmail` parameter throughout the call chain
3. Modify loading logic to support multiple years (2020 to current) with:
   - **NEW users**: Backfill all years immediately
   - **EXISTING users**: Backfill one year per cycle to protect Noris database
4. Add logic to set `bloomreachUnpaidTaxReminderSent: true` for historical taxes at creation
5. Modify `sendUnpaidTaxReminders` query to exclude historical year taxes (year < currentYear)
6. Test with small batch of users
7. Monitor Noris database load during rollout
8. Gradually roll out to all users

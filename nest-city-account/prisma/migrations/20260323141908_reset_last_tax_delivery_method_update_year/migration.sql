-- Reset lastTaxDeliveryMethodsUpdateYear for users marked as updated in 2026
UPDATE "User"
SET "lastTaxDeliveryMethodsUpdateYear" = NULL
WHERE "lastTaxDeliveryMethodsUpdateYear" = 2026;

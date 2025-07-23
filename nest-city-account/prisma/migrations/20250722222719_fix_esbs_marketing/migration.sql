UPDATE public."UserGdprData"
SET "category"='ESBS'
WHERE "type" = 'MARKETING'
    and "subType" is not NULL
    and "createdAt" >= '2024/04/28'
    and "createdAt" <= '2025/04/29'
    and "category"='TAXES';

UPDATE public."LegalPersonGdprData"
SET "category"='ESBS'
WHERE "type" = 'MARKETING'
    and "subType" is not NULL
    and "createdAt" >= '2024/04/28'
    and "createdAt" <= '2025/04/29'
    and "category"='TAXES';
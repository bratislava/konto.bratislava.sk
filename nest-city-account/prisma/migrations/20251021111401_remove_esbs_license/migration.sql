-- Delete rows where type is LICENSE and category is ESBS. These rows are not used anymore.
DELETE FROM public."UserGdprData"
WHERE "type"='LICENSE' and "category"='ESBS';

DELETE FROM public."LegalPersonGdprData"
WHERE "type"='LICENSE' and "category"='ESBS';
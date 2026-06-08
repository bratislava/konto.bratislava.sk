export const setDeliveryMethodsForUser = `
    UPDATE org_mag
    SET
        org_mag.dkba_stav = @dkba_stav,
        org_mag.dkba_datum_suhlasu = @dkba_datum_suhlasu,
        org_mag.dkba_sposob_dorucovania = @dkba_sposob_dorucovania
    OUTPUT
        inserted.cislo_subjektu
    FROM lcs.uda_21_organizacia_mag org_mag
    INNER JOIN lcs.organizace org
        ON org_mag.cislo_subjektu = org.cislo_subjektu
    WHERE TRIM(org.ico) IN (@birth_numbers)
`

export const getBirthNumbersForSubjects = `
    -- birth numbers are stored in column 'ico'
    SELECT ico
    FROM lcs.organizace
    WHERE cislo_subjektu IN (@subjects)
`

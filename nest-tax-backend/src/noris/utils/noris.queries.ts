/**
 * Returns one DZN tax record per (birth number, year). When Noris has multiple
 * records for the same person/year, we keep a single row deterministically
 * by ordering by document id (cislo_subjektu).
 */
export const queryPayersFromNoris = `
WITH NorisRows AS (
    SELECT
        lcs.dane21_doklad.stav_dokladu as stav_dokladu,
        lcs.dane21_doklad.cislo_subjektu,
        subjekt_doklad.reference_subjektu cislo_konania , 
        lcs.dane21_doklad.datum_platnosti,
        lcs.dane21_doklad.variabilny_symbol,
        (case
            when isnull(lcs.dane21_druh_dokladu.generovat_pohladavku,'')='A' then view_doklad_saldo.uhrazeno
            else 0 end
        ) + ISNULL(overpayment_sum.overpayment_total, 0) uhrazeno,
        (SELECT MAX(v) FROM (VALUES(view_doklad_saldo.datum_posledni_platby), (overpayment_sum.datum_realizacie)) AS maxDate(v)) AS datum_posledni_platby,
        subjekt_doklad_sub.reference_subjektu subjekt_refer,
        ltrim(isnull(lcs.dane21_priznanie.titul+' ', '')+isnull(lcs.dane21_priznanie.meno+' ', '') +isnull(lcs.dane21_priznanie.priezvisko, '') +isnull(', '+lcs.dane21_priznanie.titul_za, '')) subjekt_nazev, 
        a_tb.ulica_nazev+isnull( ' '+lcs.fn21_adresa_string(NULL, org_cudz.adr_tp_sup_cislo, org_cudz.adr_tp_or_cislo), '') as ulica_tb_cislo, 
        a_tb.psc_refer as psc_ref_tb,
        a_tb.obec_nazev obec_nazev_tb, 
        lcs.dane21_doklad.datum_realizacie datum_realizacie, 
        lcs.fn21_meno_osoby_org(dp_conf.vybavuje, null) vyb_nazov, 
        z_vybav.telefon_prace vyb_telefon_prace, 
        z_vybav.e_mail vyb_email, 
        dp_conf.vybavuje vyb_id,
        lcs.dane21_priznanie.forma_uhrady AS forma_uhrady,
        lcs.fn21_dec2string( dsum.dan_spolu , 2) as dan_spolu, 
        lcs.fn21_dec2string(dsum.dan_byty, 2) dan_byty, 
        lcs.fn21_dec2string(dsum.dan_pozemky, 2) dan_pozemky, 
        lcs.fn21_dec2string(dsum.dan_stavby_SPOLU , 2) dan_stavby_SPOLU, 
        lcs.fn21_dec2string(dsum.det_zaklad_dane_byt , 2) det_zaklad_dane_byt, 
        lcs.fn21_dec2string(dsum.det_zaklad_dane_nebyt , 2) det_zaklad_dane_nebyt, 
        lcs.fn21_dec2string(dsum.det_dan_byty_byt , 2) det_dan_byty_byt, 
        lcs.fn21_dec2string(dsum.det_dan_byty_nebyt , 2) det_dan_byty_nebyt, 
        lcs.fn21_dec2string(dsum.det_pozemky_DAN_A , 2) det_pozemky_DAN_A, 
        lcs.fn21_dec2string(dsum.det_pozemky_DAN_B , 2) det_pozemky_DAN_B, 
        lcs.fn21_dec2string(dsum.det_pozemky_DAN_C , 2) det_pozemky_DAN_C, 
        lcs.fn21_dec2string(dsum.det_pozemky_DAN_D , 2) det_pozemky_DAN_D, 
        lcs.fn21_dec2string(dsum.det_pozemky_DAN_E , 2) det_pozemky_DAN_E, 
        lcs.fn21_dec2string(dsum.det_pozemky_DAN_F , 2) det_pozemky_DAN_F, 
        lcs.fn21_dec2string(dsum.det_pozemky_DAN_G , 2) det_pozemky_DAN_G, 
        lcs.fn21_dec2string(dsum.det_pozemky_DAN_H , 2) det_pozemky_DAN_H, 
        lcs.fn21_dec2string(dsum.det_pozemky_ZAKLAD_A , 2) det_pozemky_ZAKLAD_A, 
        lcs.fn21_dec2string(dsum.det_pozemky_ZAKLAD_B , 2) det_pozemky_ZAKLAD_B, 
        lcs.fn21_dec2string(dsum.det_pozemky_ZAKLAD_C , 2) det_pozemky_ZAKLAD_C, 
        lcs.fn21_dec2string(dsum.det_pozemky_ZAKLAD_D , 2) det_pozemky_ZAKLAD_D, 
        lcs.fn21_dec2string(dsum.det_pozemky_ZAKLAD_E , 2) det_pozemky_ZAKLAD_E, 
        lcs.fn21_dec2string(dsum.det_pozemky_ZAKLAD_F , 2) det_pozemky_ZAKLAD_F, 
        lcs.fn21_dec2string(dsum.det_pozemky_ZAKLAD_G , 2) det_pozemky_ZAKLAD_G, 
        lcs.fn21_dec2string(dsum.det_pozemky_ZAKLAD_H , 2) det_pozemky_ZAKLAD_H, 
        lcs.fn21_dec2string(dsum.det_pozemky_VYMERA_A , 2) det_pozemky_VYMERA_A, 
        lcs.fn21_dec2string(dsum.det_pozemky_VYMERA_B , 2) det_pozemky_VYMERA_B, 
        lcs.fn21_dec2string(dsum.det_pozemky_VYMERA_C , 2) det_pozemky_VYMERA_C, 
        lcs.fn21_dec2string(dsum.det_pozemky_VYMERA_D , 2) det_pozemky_VYMERA_D, 
        lcs.fn21_dec2string(dsum.det_pozemky_VYMERA_E , 2) det_pozemky_VYMERA_E, 
        lcs.fn21_dec2string(dsum.det_pozemky_VYMERA_F , 2) det_pozemky_VYMERA_F, 
        lcs.fn21_dec2string(dsum.det_pozemky_VYMERA_G , 2) det_pozemky_VYMERA_G, 
        lcs.fn21_dec2string(dsum.det_pozemky_VYMERA_H , 2) det_pozemky_VYMERA_H, 
        lcs.fn21_dec2string(dsum.det_stavba_DAN_A , 2) det_stavba_DAN_A, 
        lcs.fn21_dec2string(dsum.det_stavba_DAN_B , 2) det_stavba_DAN_B, 
        lcs.fn21_dec2string(dsum.det_stavba_DAN_C , 2) det_stavba_DAN_C, 
        lcs.fn21_dec2string(dsum.det_stavba_DAN_D , 2) det_stavba_DAN_D, 
        lcs.fn21_dec2string(dsum.det_stavba_DAN_E , 2) det_stavba_DAN_E, 
        lcs.fn21_dec2string(dsum.det_stavba_DAN_F , 2) det_stavba_DAN_F, 
        lcs.fn21_dec2string(dsum.det_stavba_DAN_G , 2) det_stavba_DAN_G, 
        lcs.fn21_dec2string(dsum.det_stavba_j_DAN_H , 2) det_stavba_DAN_jH, 
        lcs.fn21_dec2string(dsum.det_stavba_j_DAN_I , 2) det_stavba_DAN_jI, 
        lcs.fn21_dec2string(dsum.det_stavba_ZAKLAD_A , 2) det_stavba_ZAKLAD_A, 
        lcs.fn21_dec2string(dsum.det_stavba_ZAKLAD_B , 2) det_stavba_ZAKLAD_B, 
        lcs.fn21_dec2string(dsum.det_stavba_ZAKLAD_C , 2) det_stavba_ZAKLAD_C, 
        lcs.fn21_dec2string(dsum.det_stavba_ZAKLAD_D , 2) det_stavba_ZAKLAD_D, 
        lcs.fn21_dec2string(dsum.det_stavba_ZAKLAD_E , 2) det_stavba_ZAKLAD_E, 
        lcs.fn21_dec2string(dsum.det_stavba_ZAKLAD_F , 2) det_stavba_ZAKLAD_F, 
        lcs.fn21_dec2string(dsum.det_stavba_ZAKLAD_G , 2) det_stavba_ZAKLAD_G, 
        lcs.fn21_dec2string(dsum.det_stavba_j_ZAKLAD_H , 2) det_stavba_ZAKLAD_jH, 
        lcs.fn21_dec2string(dsum.det_stavba_j_ZAKLAD_I , 2) det_stavba_ZAKLAD_jI, 
        lcs.fn21_dec2string(dsum.det_stavba_DAN_H , 2) det_stavba_DAN_H, 
        lcs.fn21_dec2string(dsum.det_stavba_ZAKLAD_H, 2) det_stavba_ZAKLAD_H, 
        lcs.dane21_priznanie.rodne_cislo ICO_RC, 

        /* ----------------------------Texty splátok výmeru start------------------------------------*/   
        
        (case 
            when lcs.dane21_doklad.datum_spl2 is not null then ''         
            else lcs.fn21_dec2string(lcs.dane21_doklad.suma_mena, 2)   
        end ) SPL1, 
        (case 
            when lcs.dane21_doklad.datum_spl2 is not null then lcs.fn21_dec2string( lcs.dane21_doklad.suma_spl1 , 2)
            else  ''
        end  ) SPL4_1, 
        (case 
            when lcs.dane21_doklad.datum_spl2 is not null then lcs.fn21_dec2string( lcs.dane21_doklad.suma_spl2 , 2)
            else  '' 
        end) SPL4_2, 
    (case 
            when  lcs.dane21_doklad.datum_spl3 is not null  then lcs.fn21_dec2string( lcs.dane21_doklad.suma_spl3 , 2)
            else  ''
        end  ) SPL4_3, 
    (case 
            when  lcs.dane21_doklad.datum_spl4 is not null  then lcs.fn21_dec2string( lcs.dane21_doklad.suma_spl4 , 2)
            else  ''
        end  ) SPL4_4,
    
    lcs.dane21_doklad.datum_spl1,
    lcs.dane21_doklad.datum_spl2,
    lcs.dane21_doklad.datum_spl3,
    lcs.dane21_doklad.datum_spl4,

    /* One row per (rodne_cislo, rok) when Noris returns duplicates; deterministic by document id */
    ROW_NUMBER() OVER (
        PARTITION BY lcs.dane21_priznanie.rodne_cislo, lcs.dane21_priznanie.rok
        ORDER BY lcs.dane21_doklad.cislo_subjektu
    ) AS _rn

    /* --------- Texty splátok výmeru end ----------------------------*/
    FROM 
        lcs.dane21_doklad  

    LEFT OUTER JOIN 
        lcs.subjekty subjekt_doklad  
        ON 
            lcs.dane21_doklad.cislo_subjektu=subjekt_doklad.cislo_subjektu  

    LEFT OUTER JOIN 
        lcs.subjekty subjekt_doklad_sub  
        ON 
            lcs.dane21_doklad.subjekt=subjekt_doklad_sub.cislo_subjektu  

    JOIN 
        lcs.dane21_priznanie  
        ON 
            lcs.dane21_doklad.podklad=lcs.dane21_priznanie.cislo_subjektu  

    JOIN 
        lcs.subjekty subjekt_priznanie  
        ON 
            subjekt_priznanie.cislo_subjektu=lcs.dane21_priznanie.cislo_subjektu  

    LEFT OUTER JOIN 
        lcs.dane21_priznanie_config dp_conf  
        ON 
            subjekt_priznanie.cislo_poradace=dp_conf.cislo_poradace  

    LEFT OUTER JOIN 
        lcs.zamestnanci z_vybav  
        ON 
            z_vybav.cislo_subjektu=dp_conf.vybavuje  

    LEFT OUTER JOIN 
        lcs.organizace org_cudz  
        ON
            lcs.dane21_doklad.subjekt=org_cudz.cislo_subjektu  

    LEFT OUTER JOIN 
        lcs.dane_21_adresa_view a_tb  
        ON 
            org_cudz.adresa_tp_sidlo=a_tb.cislo_subjektu  

    LEFT OUTER JOIN 
        lcs.dane_21_sum_dan_prizn_detail dsum  
        ON
            dsum.cs_dan_prizn=lcs.dane21_priznanie.cislo_subjektu  

    LEFT OUTER JOIN
        lcs.dane21_druh_dokladu  
        ON
            lcs.dane21_druh_dokladu.cislo_subjektu=lcs.dane21_doklad.druh_dokladu  

    LEFT OUTER JOIN
        lcs.dane21_doklad_sum_saldo view_doklad_saldo  
        ON
            view_doklad_saldo.cislo_subjektu=lcs.dane21_doklad.cislo_subjektu  

    LEFT OUTER JOIN (
        SELECT
            dane21_doklad_overpayment.podklad,
            dane21_doklad_overpayment.rok_podkladu,
            SUM(dane21_doklad_overpayment.suma_mena) as overpayment_total,
            MAX(dane21_doklad_overpayment.datum_realizacie) as datum_realizacie
        FROM lcs.dane21_doklad dane21_doklad_overpayment
        JOIN lcs.dane21_druh_dokladu overpayment_druh_dokladu
            ON overpayment_druh_dokladu.cislo_subjektu = dane21_doklad_overpayment.druh_dokladu
        WHERE overpayment_druh_dokladu.typ_dokladu = 'ZAL'
        GROUP BY dane21_doklad_overpayment.podklad, dane21_doklad_overpayment.rok_podkladu
    ) overpayment_sum
        ON overpayment_sum.podklad = lcs.dane21_doklad.podklad
        AND overpayment_sum.rok_podkladu = lcs.dane21_doklad.rok_podkladu

    WHERE 
        (
            lcs.dane21_druh_dokladu.typ_dokladu = 'v'
            AND lcs.dane21_druh_dokladu.typ_dane = '1'
            AND lcs.dane21_doklad.stav_dokladu<>'s'  
            AND lcs.dane21_doklad.rok_podkladu = @year
            AND lcs.dane21_priznanie.rok = @year
            AND lcs.dane21_priznanie.podnikatel = 'N'
            AND lcs.dane21_doklad.pohladavka IS NOT NULL
            AND lcs.dane21_priznanie.rodne_cislo IN (@birth_numbers)
            AND dsum.dan_spolu > 0
        )
)
SELECT * FROM NorisRows WHERE _rn = 1
`

const basePaymentsQuery = `
    SELECT
        dane21_doklad.variabilny_symbol as variabilny_symbol,
        (case
            when isnull(lcs.dane21_druh_dokladu.generovat_pohladavku,'')='A' then view_doklad_saldo.uhrazeno
            else 0 end
        ) + ISNULL(overpayment_sum.overpayment_total, 0) uhrazeno,
        (SELECT MAX(v) FROM (VALUES(view_doklad_saldo.datum_posledni_platby), (overpayment_sum.datum_realizacie)) AS maxDate(v)) AS datum_posledni_platby
    FROM lcs.dane21_doklad as dane21_doklad
    JOIN lcs.dane21_doklad_sum_saldo as view_doklad_saldo
        ON view_doklad_saldo.cislo_subjektu = dane21_doklad.cislo_subjektu
        AND view_doklad_saldo.uhrazeno > 0
    LEFT OUTER JOIN (
        SELECT
            dane21_doklad_overpayment.podklad,
            dane21_doklad_overpayment.rok_podkladu,
            SUM(dane21_doklad_overpayment.suma_mena) as overpayment_total,
            MAX(dane21_doklad_overpayment.datum_realizacie) as datum_realizacie
        FROM lcs.dane21_doklad dane21_doklad_overpayment
        JOIN lcs.dane21_druh_dokladu overpayment_druh_dokladu
            ON overpayment_druh_dokladu.cislo_subjektu = dane21_doklad_overpayment.druh_dokladu
        WHERE overpayment_druh_dokladu.typ_dokladu = 'ZAL'
        GROUP BY dane21_doklad_overpayment.podklad, dane21_doklad_overpayment.rok_podkladu
    ) overpayment_sum
        ON overpayment_sum.podklad = dane21_doklad.podklad 
        AND overpayment_sum.rok_podkladu = dane21_doklad.rok_podkladu
    LEFT OUTER JOIN 
        lcs.dane21_druh_dokladu
        ON
            dane21_doklad.druh_dokladu=lcs.dane21_druh_dokladu.cislo_subjektu
    LEFT JOIN 
        lcs.dane21_priznanie  
        ON 
            dane21_doklad.podklad=lcs.dane21_priznanie.cislo_subjektu
    LEFT JOIN 
        lcs.pko21_poplatok  
        ON 
            dane21_doklad.podklad=lcs.pko21_poplatok.cislo_subjektu
   WHERE 
        lcs.dane21_druh_dokladu.typ_dokladu = 'v'
        AND lcs.dane21_druh_dokladu.typ_dane IN ('1', '4')
        AND dane21_doklad.stav_dokladu <> 's'
        AND (lcs.dane21_priznanie.podnikatel = 'N' OR lcs.pko21_poplatok.podnikatel = 'N')
        AND dane21_doklad.rok_podkladu IN (@years)
        {%ADDITIONAL_CONDITIONS%}
`

export const queryPaymentsFromNorisByFromToDate = basePaymentsQuery.replace(
  '{%ADDITIONAL_CONDITIONS%}',
  `
    AND (
        (@overPayments = 0 AND view_doklad_saldo.datum_posledni_platby >= @fromDate AND view_doklad_saldo.datum_posledni_platby <= @toDate)
        OR (@overPayments = 1 AND view_doklad_saldo.datum_posledni_platby IS NULL)
    )`,
)

export const queryPaymentsFromNorisByVariableSymbols =
  basePaymentsQuery.replace(
    '{%ADDITIONAL_CONDITIONS%}',
    `AND dane21_doklad.variabilny_symbol IN (@variable_symbols)`,
  )

export const queryOverpaymentsFromNorisByDateRange = `
  SELECT 
      dane21_doklad.variabilny_symbol as variabilny_symbol,
      (case
          when isnull(dane21_druh_dokladu.generovat_pohladavku,'')='A' then view_doklad_saldo.uhrazeno
          else 0 end
      ) + sum(dane21_doklad_overpayment.suma_mena) as uhrazeno,
      (SELECT MAX(v) FROM (VALUES(MAX(view_doklad_saldo.datum_posledni_platby)), (MAX(dane21_doklad_overpayment.datum_realizacie))) AS maxDate(v)) AS datum_posledni_platby
  FROM lcs.dane21_doklad as dane21_doklad
  JOIN lcs.dane21_doklad_sum_saldo as view_doklad_saldo
      ON view_doklad_saldo.cislo_subjektu = dane21_doklad.cislo_subjektu
      AND view_doklad_saldo.uhrazeno > 0
      AND view_doklad_saldo.zbyva_uhradit <= 0
  JOIN lcs.dane21_doklad as dane21_doklad_overpayment
        ON dane21_doklad_overpayment.podklad = dane21_doklad.podklad AND dane21_doklad_overpayment.rok_podkladu = dane21_doklad.rok_podkladu
  LEFT OUTER JOIN 
      lcs.dane21_druh_dokladu as dane21_druh_dokladu
      ON
          dane21_doklad.druh_dokladu=dane21_druh_dokladu.cislo_subjektu
  JOIN lcs.dane21_druh_dokladu as overpayment_druh_dokladu
      ON overpayment_druh_dokladu.cislo_subjektu = dane21_doklad_overpayment.druh_dokladu
  LEFT JOIN 
      lcs.dane21_priznanie  
      ON 
          dane21_doklad.podklad=lcs.dane21_priznanie.cislo_subjektu
  LEFT JOIN 
      lcs.pko21_poplatok  
      ON 
          dane21_doklad.podklad=lcs.pko21_poplatok.cislo_subjektu
 WHERE 
      dane21_druh_dokladu.typ_dokladu = 'V'
      AND overpayment_druh_dokladu.typ_dokladu = 'ZAL'
      AND dane21_druh_dokladu.typ_dane IN ('1', '4')
      AND dane21_doklad.stav_dokladu <> 's'
      AND (lcs.dane21_priznanie.podnikatel = 'N' OR lcs.pko21_poplatok.podnikatel = 'N')
  GROUP BY 
      dane21_doklad.variabilny_symbol,
      view_doklad_saldo.uhrazeno,
      dane21_druh_dokladu.generovat_pohladavku
  HAVING 
      MAX(dane21_doklad_overpayment.datum_realizacie) >= @fromDate 
      AND MAX(dane21_doklad_overpayment.datum_realizacie) <= @toDate
      AND MAX(dane21_doklad_overpayment.datum_realizacie) IS NOT NULL
`

/**
 * @remarks
 * ⚠️ **Warning:** This returns a record for each communal waste container.
 * The data must be grouped and processed by birth number, so we process only one record internally, with all containers for one person as one record.
 */
export const getCommunalWasteTaxesFromNoris = `
    SELECT 
        doklad.stav_dokladu as stav_dokladu,
        doklad.cislo_subjektu,
        subjekt_doklad.reference_subjektu cislo_konania,
        doklad.datum_platnosti,
        doklad.variabilny_symbol,
        lcs.fn21_dec2string( dsum.dan_spolu_nezaokr , 2) as dan_spolu,
        (case
            when isnull(lcs.dane21_druh_dokladu.generovat_pohladavku,'')='A' then view_doklad_saldo.uhrazeno
            else 0 end
        ) + ISNULL(overpayment_sum.overpayment_total, 0) uhrazeno,
        (SELECT MAX(v) FROM (VALUES(view_doklad_saldo.datum_posledni_platby), (overpayment_sum.datum_realizacie)) AS maxDate(v)) AS datum_posledni_platby,
        subjekt_doklad_sub.reference_subjektu subjekt_refer,
        ltrim(isnull(poplatok.titul+' ', '')+isnull(poplatok.meno+' ', '') +isnull(poplatok.priezvisko, '') +isnull(', '+poplatok.titul_za, '')) subjekt_nazev, 
        doklad.datum_realizacie datum_realizacie,
        lcs.fn21_meno_osoby_org(pop_conf.vybavuje, null) vyb_nazov,

        poplatok.forma_uhrady AS forma_uhrady,

        /* ----------------------------Texty splátok výmeru start------------------------------------*/   

        (case 
            when doklad.datum_spl2 is not null then ''         
            else lcs.fn21_dec2string(doklad.suma_mena, 2)   
        end ) SPL1, 
        (case 
            when doklad.datum_spl2 is not null then lcs.fn21_dec2string( doklad.suma_spl1 , 2)
            else  ''
        end  ) SPL4_1, 
        (case 
            when doklad.datum_spl2 is not null then lcs.fn21_dec2string( doklad.suma_spl2 , 2)
            else  '' 
        end) SPL4_2, 
        (case 
            when  doklad.datum_spl3 is not null  then lcs.fn21_dec2string( doklad.suma_spl3 , 2)
            else  ''
        end  ) SPL4_3, 
        (case 
            when  doklad.datum_spl4 is not null  then lcs.fn21_dec2string( doklad.suma_spl4 , 2)
            else  ''
        end  ) SPL4_4,

        doklad.datum_spl1,
        doklad.datum_spl2,
        doklad.datum_spl3,
        doklad.datum_spl4,

        /* --------- Texty splátok výmeru end ----------------------------*/

        poplatok.rodne_cislo ICO_RC, 

        a_tb.ulica_nazev+isnull( ' '+lcs.fn21_adresa_string(NULL, org_cudz.adr_tp_sup_cislo, org_cudz.adr_tp_or_cislo), '') as ulica_tb_cislo, 
        a_tb.psc_refer as psc_ref_tb,
        a_tb.obec_nazev obec_nazev_tb, 

        z_vybav.telefon_prace vyb_telefon_prace, 
        z_vybav.e_mail vyb_email, 
        pop_conf.vybavuje vyb_id,

        ------ Info about the container
        nadoba.objem objem_nadoby,
        nadoba.pocet_nadob pocet_nadob,
        nadoba.pocet_odvozov pocet_odvozov,
        nadoba.sadzba_mena sadzba,
        nadoba.suma_uhrada_mena poplatok,
        nadoba.druh_nadoby druh_nadoby,
        CASE 
                WHEN CHARINDEX(',', sub_adresa.nazev_subjektu) > 0 
                        THEN LEFT(sub_adresa.nazev_subjektu, CHARINDEX(',', sub_adresa.nazev_subjektu) - 1)
                ELSE sub_adresa.nazev_subjektu
            END AS ulica,
        nadoba.orientacne_cislo orientacne_cislo

    FROM lcs.pko21_nadoba nadoba

    JOIN lcs.pko21_poplatok poplatok ON nadoba.pko_poplatok = poplatok.cislo_subjektu
    JOIN lcs.subjekty sub_adresa ON sub_adresa.cislo_subjektu = nadoba.adresa
    JOIN lcs.dane21_doklad doklad ON doklad.podklad = poplatok.cislo_subjektu

    LEFT OUTER JOIN (
        SELECT
            dane21_doklad_overpayment.podklad,
            dane21_doklad_overpayment.rok_podkladu,
            SUM(dane21_doklad_overpayment.suma_mena) as overpayment_total,
            MAX(dane21_doklad_overpayment.datum_realizacie) as datum_realizacie
        FROM lcs.dane21_doklad dane21_doklad_overpayment
        JOIN lcs.dane21_druh_dokladu overpayment_druh_dokladu
            ON overpayment_druh_dokladu.cislo_subjektu = dane21_doklad_overpayment.druh_dokladu
        WHERE overpayment_druh_dokladu.typ_dokladu = 'ZAL'
        GROUP BY dane21_doklad_overpayment.podklad, dane21_doklad_overpayment.rok_podkladu
    ) overpayment_sum
        ON overpayment_sum.podklad = doklad.podklad
        AND overpayment_sum.rok_podkladu = doklad.rok_podkladu

    JOIN 
        lcs.dane21_druh_dokladu
        ON
            doklad.druh_dokladu=lcs.dane21_druh_dokladu.cislo_subjektu
    JOIN 
        lcs.subjekty subjekt_poplatok  
        ON 
            subjekt_poplatok.cislo_subjektu=poplatok.cislo_subjektu  

    LEFT OUTER JOIN 
        lcs.pko21_poplatok_config pop_conf  
        ON 
            subjekt_poplatok.cislo_poradace=pop_conf.cislo_poradace  

    LEFT OUTER JOIN 
        lcs.zamestnanci z_vybav  
        ON 
            z_vybav.cislo_subjektu=pop_conf.vybavuje  

    JOIN 
        lcs.subjekty subjekt_doklad  
        ON 
            doklad.cislo_subjektu=subjekt_doklad.cislo_subjektu

    LEFT OUTER JOIN 
        lcs.organizace org_cudz  
        ON
            doklad.subjekt=org_cudz.cislo_subjektu  

    JOIN 
        lcs.subjekty subjekt_doklad_sub  
        ON 
            doklad.subjekt=subjekt_doklad_sub.cislo_subjektu

    JOIN 
        lcs.dane_21_sum_pko_popl_celkom dsum  
        ON
            dsum.cs_dan_prizn=poplatok.cislo_subjektu

    JOIN
        lcs.dane21_doklad_sum_saldo view_doklad_saldo  
        ON
            view_doklad_saldo.cislo_subjektu=doklad.cislo_subjektu

    JOIN 
        lcs.dane_21_adresa_view a_tb  
        ON 
            org_cudz.adresa_tp_sidlo=a_tb.cislo_subjektu
    WHERE 
        poplatok.rodne_cislo IN (@birth_numbers) AND
        nadoba.druh_odpadu IS NULL AND
        poplatok.rok = @year AND
        poplatok.podnikatel = 'N' AND
        doklad.pohladavka IS NOT NULL AND 
        lcs.dane21_druh_dokladu.typ_dokladu = 'V'AND
        lcs.dane21_druh_dokladu.typ_dane = '4' AND
        doklad.rok_podkladu = @year AND
        (nadoba.objem IS NOT NULL AND nadoba.pocet_nadob IS NOT NULL AND nadoba.pocet_odvozov IS NOT NULL AND nadoba.sadzba_mena IS NOT NULL AND nadoba.suma_uhrada_mena IS NOT NULL AND nadoba.druh_nadoby IS NOT NULL)
`

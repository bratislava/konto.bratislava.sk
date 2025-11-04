/* eslint-disable no-secrets/no-secrets */
export const queryPayersFromNoris = `
SELECT
    lcs.dane21_doklad.sposob_dorucenia,
    subjekt_doklad.cislo_poradace,
    lcs.dane21_doklad.cislo_subjektu,
    subjekt_tp_adresa.nazev_subjektu adresa_tp_sidlo,
    subjekt_doklad.reference_subjektu cislo_konania , 
    lcs.dane21_doklad.datum_platnosti,
    lcs.dane21_doklad.variabilny_symbol, 
    (case 
        when isnull(lcs.dane21_druh_dokladu.generovat_pohladavku,'')='A' then view_doklad_saldo.uhrazeno 
        else 0 end 
    ) + ISNULL(overpayment_sum.overpayment_total, 0) uhrazeno,
    subjekt_doklad_sub.reference_subjektu subjekt_refer, 
    ltrim(case when lcs.dane21_priznanie.podnikatel='N' then isnull(lcs.dane21_priznanie.titul+' ', '')+isnull(lcs.dane21_priznanie.meno+' ', '') +isnull(lcs.dane21_priznanie.priezvisko, '') +(case when lcs.dane21_priznanie.titul_za is null then '' else isnull(', '+lcs.dane21_priznanie.titul_za, '') end )         else  lcs.dane21_priznanie.obchodny_nazov end  ) subjekt_nazev, 
    lcs.dane21_priznanie.rok, 
    a_tb.ulica_nazev+isnull( ' '+lcs.fn21_adresa_string(NULL, lcs.dane21_priznanie.adr_tp_sup_cislo, lcs.dane21_priznanie.adr_tp_or_cislo), '') as ulica_tb_cislo, 
    a_tb.psc_refer as psc_ref_tb,
    a_tb.psc_nazev as psc_naz_tb, 
    a_tb.stat_nazov_plny, 
    a_tb.obec_nazev obec_nazev_tb, 
    CONVERT(char(10), lcs.dane21_doklad.datum_realizacie, 104) akt_datum, 
    lcs.fn21_meno_osoby_org(lcs.dane21_doklad.vybavuje, null) vyb_nazov, 
    z_vybav.telefon_prace vyb_telefon_prace, 
    z_vybav.e_mail vyb_email, 
    dp_conf.vybavuje vyb_id,
    lcs.fn21_dec2string( dsum.dan_spolu , 2) as dan_spolu, 
    lcs.fn21_dec2string(dsum.dan_byty, 2) dan_byty, 
    lcs.fn21_dec2string(dsum.dan_pozemky, 2) dan_pozemky, 
    lcs.fn21_dec2string(dsum.dan_stavby , 2) dan_stavby, 
    lcs.fn21_dec2string(dsum.dan_stavby_viac, 2) dan_stavby_viac, 
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
    lcs.fn21_dec2string(dsum.det_stavba_ZAKLAD_H, 2) det_stavba_ZAKLAD_H   /*zmena 31032008 z DP_conf.typ_priznania='F' na lcs.dane21_priznanie.podnikatel='N'*/, 
    (case 
        when lcs.dane21_priznanie.podnikatel='N' then 'Meno a priezvisko:' 
        else 'Obchodné meno:' 
    end  ) TXT_MENO, 
    (case 
        when lcs.dane21_priznanie.podnikatel='N' then 'Adresa trvalého pobytu:' 
        else 'Sídlo:'
    end  ) TXT_UL, 
    (case 
        when lcs.dane21_priznanie.podnikatel='N' then 'Rodné číslo:' 
        else 'IČO/DIČ:' 
    end  ) TYP_USER, 
    (case 
        when lcs.dane21_priznanie.podnikatel='N' then lcs.dane21_priznanie.rodne_cislo 
        else  isnull(lcs.dane21_priznanie.ico, '')+'/'+isnull(ev_dic_cudz.dic, '') 
    end) ICO_RC, 

    /* ----------------------------Texty splátok výmeru start------------------------------------*/   
    
    (case
         when lcs.dane21_doklad.rok_podkladu<2008 then 
            (case 
                when lcs.dane21_doklad.datum_spl2 is not null then ''
                else  '-  naraz do '+convert(varchar(10), lcs.dane21_doklad.datum_spl1, 104) +' v sume:'      
            end)
        else      
            (case 
                when lcs.dane21_doklad.datum_spl2 is not null then '' 
                else  'v termíne do 15 dní odo dňa nadobudnutia právoplatnosti '+lcs.fn21_dane_text_vymer_rozhod(lcs.dane21_doklad.rok_podkladu, lcs.dane21_druh_dokladu.typ_dane, lcs.dane21_druh_dokladu.typ_dokladu, ov.dic) +' v sume:'       
            end)
    end)  TXTSPL1, 
    (case 
        when lcs.dane21_doklad.datum_spl2 is not null then ''         
        else lcs.fn21_dec2string(lcs.dane21_doklad.suma_mena, 2)   
    end ) SPL1, 
    (case 
        when lcs.dane21_doklad.rok_podkladu<2008 then
            (case 
                when lcs.dane21_doklad.datum_spl2 is not null then '-  Splátka 1 do '+convert(varchar(10), lcs.dane21_doklad.datum_spl1, 104)  +' v sume:'                    else  ''               end  )        else             (case when lcs.dane21_doklad.datum_spl2 is not null then '- prvá splátka v termíne do 15 dní odo dňa nadobudnutia právoplatnosti '+lcs.fn21_dane_text_vymer_rozhod(lcs.dane21_doklad.rok_podkladu, lcs.dane21_druh_dokladu.typ_dane, lcs.dane21_druh_dokladu.typ_dokladu, ov.dic)+' v sume:'
                else  '' 
            end)
    end) TXTSPL4_1, 
    (case 
        when lcs.dane21_doklad.datum_spl2 is not null then lcs.fn21_dec2string( lcs.dane21_doklad.suma_spl1 , 2)
        else  ''
    end  ) SPL4_1, 
    (case 
        when lcs.dane21_doklad.datum_spl2 is not null then
            (case 
                when lcs.dane21_doklad.rok_podkladu<2008 or cast((cast( lcs.dane21_doklad.rok_podkladu as varchar(4))+right(CONVERT(char(8), dp_conf.spl_2_splatnost, 112), 4)) as datetime)>=lcs.dane21_doklad.datum_spl2                  then '- druhá splátka v termíne do '+convert(varchar(10), lcs.dane21_doklad.datum_spl2, 104) +' v sume:'
                else '- druhá splátka v termíne do 15 dní odo dňa nadobudnutia právoplatnosti '+lcs.fn21_dane_text_vymer_rozhod(lcs.dane21_doklad.rok_podkladu, lcs.dane21_druh_dokladu.typ_dane, lcs.dane21_druh_dokladu.typ_dokladu, ov.dic)+' v sume:'
            end )
        else  ''
    end) TXTSPL4_2, 
    (case 
        when lcs.dane21_doklad.datum_spl2 is not null then lcs.fn21_dec2string( lcs.dane21_doklad.suma_spl2 , 2)
        else  '' 
    end) SPL4_2, 
    (case 
        when lcs.dane21_doklad.datum_spl3 is not null then
            (case 
                when lcs.dane21_doklad.rok_podkladu<2008 or cast((cast( lcs.dane21_doklad.rok_podkladu as varchar(4))+right(CONVERT(char(8), dp_conf.spl_3_splatnost, 112), 4)) as datetime)>=lcs.dane21_doklad.datum_spl3  then '- tretia splátka v termíne do '+convert(varchar(10), lcs.dane21_doklad.datum_spl3, 104) +' v sume:'
                else '- tretia splátka v termíne do 15 dní odo dňa nadobudnutia právoplatnosti '+lcs.fn21_dane_text_vymer_rozhod(lcs.dane21_doklad.rok_podkladu, lcs.dane21_druh_dokladu.typ_dane, lcs.dane21_druh_dokladu.typ_dokladu, ov.dic)+' v sume:'
            end )
        else  ''
    end  ) TXTSPL4_3, 
   (case 
        when  lcs.dane21_doklad.datum_spl3 is not null  then lcs.fn21_dec2string( lcs.dane21_doklad.suma_spl3 , 2)
        else  ''
    end  ) SPL4_3, 
    (case 
        when  lcs.dane21_doklad.datum_spl4 is not null  then 
            (case 
                when lcs.dane21_doklad.rok_podkladu<2008 or cast((cast( lcs.dane21_doklad.rok_podkladu as varchar(4))+right(CONVERT(char(8), dp_conf.spl_4_splatnost, 112), 4)) as datetime)>=lcs.dane21_doklad.datum_spl4 then '- štvrtá splátka v termíne do '+convert(varchar(10), lcs.dane21_doklad.datum_spl4, 104)  +' v sume:'
                else '- štvrtá splátka v termíne do 15 dní odo dňa nadobudnutia právoplatnosti '+lcs.fn21_dane_text_vymer_rozhod(lcs.dane21_doklad.rok_podkladu, lcs.dane21_druh_dokladu.typ_dane, lcs.dane21_druh_dokladu.typ_dokladu, ov.dic)+' v sume:'
                end )
        else  ''
    end  ) TXTSPL4_4, 
   (case 
        when  lcs.dane21_doklad.datum_spl4 is not null  then lcs.fn21_dec2string( lcs.dane21_doklad.suma_spl4 , 2)
        else  ''
    end  ) SPL4_4, 

   /* --------- Texty splátok výmeru end ----------------------------*/
   
    lcs.dane21_doklad.specificky_symbol
FROM 
    lcs.dane21_doklad  

-- LEFT JOIN 
--     SELECT TOP 10 * FROM
--     lcs.kontext kont  
--     ON
--         kont.hid=host_id()  

LEFT OUTER JOIN 
    lcs.subjekty subjekt_doklad  
    ON 
        lcs.dane21_doklad.cislo_subjektu=subjekt_doklad.cislo_subjektu  

LEFT OUTER JOIN 
    lcs.subjekty subjekt_doklad_sub  
    ON 
        lcs.dane21_doklad.subjekt=subjekt_doklad_sub.cislo_subjektu  

LEFT OUTER JOIN 
    lcs.subjekty subjekty_d  
    ON 
        lcs.dane21_doklad.podklad=subjekty_d.cislo_subjektu  

LEFT OUTER JOIN 
    lcs.subjekty subjekty_e  
    ON 
        lcs.dane21_doklad.pohladavka=subjekty_e.cislo_subjektu  

LEFT OUTER JOIN 
    lcs.subjekty subjekty_f  
    ON 
        lcs.dane21_doklad.text_vzor=subjekty_f.cislo_subjektu  

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
    lcs.subjekty subjekty_vybav  
    ON 
        subjekty_vybav.cislo_subjektu=dp_conf.vybavuje  

LEFT OUTER JOIN 
    lcs.zamestnanci z_vybav  
    ON 
        z_vybav.cislo_subjektu=dp_conf.vybavuje  

LEFT OUTER JOIN 
    lcs.subjekty subjekt_tp_adresa  
    ON 
        lcs.dane21_priznanie.adresa_tp_sidlo=subjekt_tp_adresa.cislo_subjektu  

LEFT OUTER JOIN 
    lcs.subjekty subjekty_e1  
    ON 
        lcs.dane21_priznanie.adresa_prech_pobyt=subjekty_e1.cislo_subjektu  

LEFT OUTER JOIN 
    lcs.subjekty subjekty_f1  
    ON 
        lcs.dane21_priznanie.bankove_spojenie=subjekty_f1.cislo_subjektu  

LEFT OUTER JOIN 
    lcs.subjekty subjekty_g1  
    ON 
        lcs.dane21_priznanie.statutarny_zastupca=subjekty_g1.cislo_subjektu  

LEFT OUTER JOIN 
    lcs.subjekty subjekty_h1  
    ON
        lcs.dane21_priznanie.adresa_postova=subjekty_h1.cislo_subjektu  

LEFT OUTER JOIN 
    lcs.subjekty subjekty_i1  
    ON 
        lcs.dane21_priznanie.zastupca_adresa=subjekty_i1.cislo_subjektu  

LEFT OUTER JOIN 
    lcs.dane_21_adresa_view a_tb  
    ON 
        lcs.dane21_priznanie.adresa_tp_sidlo=a_tb.cislo_subjektu  

LEFT OUTER JOIN 
    lcs.dane_21_adresa_view a_pb  
    ON
        lcs.dane21_priznanie.adresa_prech_pobyt=a_pb.cislo_subjektu  

LEFT OUTER JOIN 
    lcs.dane_21_adresa_view zast_tb  
    ON
        lcs.dane21_priznanie.zastupca_adresa=zast_tb.cislo_subjektu  

LEFT OUTER JOIN
    lcs.dane_21_adresa_view a_post_doklad  
    ON 
        lcs.dane21_doklad.adresa_postova=a_post_doklad.cislo_subjektu  

LEFT OUTER JOIN
    lcs.organizace zast_org  
    ON 
        lcs.dane21_priznanie.statutarny_zastupca=zast_org.cislo_subjektu  

LEFT OUTER JOIN 
    lcs.dane_21_sum_dan_prizn_detail dsum  
    ON
        dsum.cs_dan_prizn=lcs.dane21_priznanie.cislo_subjektu  

LEFT OUTER JOIN
    lcs.bankovni_spojeni_cizi banspoj  
    ON
        lcs.dane21_priznanie.bankove_spojenie=banspoj.cislo_subjektu  

LEFT OUTER JOIN
    lcs.subjekty sbanspoj  
    ON
        banspoj.cislo_bank_ustav=sbanspoj.cislo_subjektu  

LEFT OUTER JOIN
    lcs.editstyles editpr_forma  
    ON 
        editpr_forma.name='dane_pravna_forma' and editpr_forma.type=87 and editpr_forma.data_val=lcs.dane21_priznanie.pravna_forma   

LEFT OUTER JOIN
    lcs.vztahysubjektu vzt212080  
    ON 
        vzt212080.cislo_vztahu=212080 and vzt212080.cislo_subjektu=lcs.dane21_doklad.cislo_subjektu   

LEFT OUTER JOIN 
    lcs.subjekty svzt212080  
    ON
        vzt212080.cislo_vztaz_subjektu=svzt212080.cislo_subjektu  

LEFT OUTER JOIN
    lcs.dane21_doklad dvzt212080  
    ON
        vzt212080.cislo_vztaz_subjektu=dvzt212080.cislo_subjektu  

LEFT OUTER JOIN
    lcs.vztahysubjektu vzt212081  
    ON
        vzt212081.cislo_vztahu=212081 and vzt212081.cislo_subjektu=lcs.dane21_doklad.cislo_subjektu   

LEFT OUTER JOIN
    lcs.subjekty svzt212081  
    ON
        vzt212081.cislo_vztaz_subjektu=svzt212081.cislo_subjektu  

LEFT OUTER JOIN
    lcs.dane21_doklad dvzt212081  
    ON
        vzt212081.cislo_vztaz_subjektu=dvzt212081.cislo_subjektu  

LEFT OUTER JOIN
    lcs.vztahysubjektu vzt212082  
    ON
        vzt212082.cislo_vztahu=212082 and vzt212082.cislo_subjektu=lcs.dane21_doklad.cislo_subjektu   

LEFT OUTER JOIN
    lcs.subjekty svzt212082  
    ON 
        vzt212082.cislo_vztaz_subjektu=svzt212082.cislo_subjektu  

LEFT OUTER JOIN
    lcs.dane21_doklad dvzt212082  
    ON
        vzt212082.cislo_vztaz_subjektu=dvzt212082.cislo_subjektu  

LEFT OUTER JOIN
    lcs.dane21_druh_dokladu  
    ON
        lcs.dane21_druh_dokladu.cislo_subjektu=lcs.dane21_doklad.druh_dokladu  

LEFT OUTER JOIN
    lcs.dane21_doklad_sum_saldo view_doklad_saldo  
    ON
        view_doklad_saldo.cislo_subjektu=lcs.dane21_doklad.cislo_subjektu  

LEFT OUTER JOIN
    lcs.zamestnanci z_opravneny_podpisat  
    ON
        lcs.dane21_druh_dokladu.opravneny_podpisat=z_opravneny_podpisat.cislo_subjektu  

LEFT OUTER JOIN 
    lcs.organizace org_cudz  
    ON
        lcs.dane21_doklad.subjekt=org_cudz.cislo_subjektu  

LEFT OUTER JOIN
    lcs.evidence_dic ev_dic_cudz  
    ON 
        org_cudz.evidence_dic=ev_dic_cudz.cislo_subjektu  

LEFT OUTER JOIN 
    lcs.uda_21_ct22_mba uda_zam  
    ON
        lcs.dane21_doklad.vybavuje=uda_zam.cislo_subjektu  

LEFT OUTER JOIN 
    lcs.organizace_vlastni ov  
    ON 
        1=1  

LEFT OUTER JOIN 
    lcs.dane_21_dzn_drazba_dedicstvo view_drazb  
    ON
        view_drazb.cislo_subjektu=lcs.dane21_priznanie.cislo_subjektu  

LEFT OUTER JOIN
    lcs.uda_21_organizacia_mag uda_21_organizacia_mag
    ON
        uda_21_organizacia_mag.cislo_subjektu=lcs.dane21_priznanie.subjekt

LEFT OUTER JOIN (
    SELECT 
        dane21_doklad_overpayment.podklad,
        dane21_doklad_overpayment.rok_podkladu,
        SUM(dane21_doklad_overpayment.suma_mena) as overpayment_total
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
    )

ORDER BY 
    lcs.dane21_priznanie.obchodny_nazov 
`

const basePaymentsQuery = `
    SELECT 
        dane21_doklad.variabilny_symbol as variabilny_symbol,
        (case 
            when isnull(lcs.dane21_druh_dokladu.generovat_pohladavku,'')='A' then view_doklad_saldo.uhrazeno 
            else 0 end 
        ) uhrazeno,
        dane21_doklad.specificky_symbol specificky_symbol
    FROM lcs.dane21_doklad as dane21_doklad
    JOIN lcs.dane21_doklad_sum_saldo as view_doklad_saldo
        ON view_doklad_saldo.cislo_subjektu = dane21_doklad.cislo_subjektu
        AND view_doklad_saldo.uhrazeno > 0
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
      ) uhrazeno_sum_saldo,
      sum(dane21_doklad_overpayment.suma_mena) as uhrazeno_overpayment, -- TODO use just uhrazeno, these two are only for debugging
      (case 
          when isnull(dane21_druh_dokladu.generovat_pohladavku,'')='A' then view_doklad_saldo.uhrazeno 
          else 0 end 
      ) + sum(dane21_doklad_overpayment.suma_mena) as uhrazeno,
      dane21_doklad.specificky_symbol specificky_symbol
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
      dane21_doklad.specificky_symbol,
      view_doklad_saldo.uhrazeno,
      dane21_druh_dokladu.generovat_pohladavku
  HAVING 
      MAX(dane21_doklad_overpayment.datum_realizacie) >= @fromDate 
      AND MAX(dane21_doklad_overpayment.datum_realizacie) <= @toDate
      AND MAX(dane21_doklad_overpayment.datum_realizacie) IS NOT NULL
`

export const setDeliveryMethodsForUser = `
    UPDATE lcs.uda_21_organizacia_mag
    SET
        dkba_stav = @dkba_stav,
        dkba_datum_suhlasu = @dkba_datum_suhlasu,
        dkba_sposob_dorucovania = @dkba_sposob_dorucovania
    WHERE
        cislo_subjektu IN (
            SELECT DISTINCT subjekt
            FROM lcs.dane21_priznanie
            WHERE podnikatel = 'N' 
            AND rodne_cislo IN (@birth_numbers)
        )
`

/**
 * @remarks
 * ⚠️ **Warning:** This returns a record for each communal waste container.
 * The data must be grouped and processed by birth number, so we process only one record internally, with all containers for one person as one record.
 */
export const getCommunalWasteTaxesFromNoris = `
    SELECT 
        subjekt_doklad.cislo_poradace,
        doklad.cislo_subjektu,
        subjekt_tp_adresa.nazev_subjektu adresa_tp_sidlo,
        subjekt_doklad.reference_subjektu cislo_konania,
        doklad.datum_platnosti,
        doklad.variabilny_symbol,
        doklad.specificky_symbol,
        poplatok.rok rok,
        lcs.fn21_dec2string( dsum.dan_spolu_nezaokr , 2) as dan_spolu, 
        (case 
            when isnull(lcs.dane21_druh_dokladu.generovat_pohladavku,'')='A' then view_doklad_saldo.uhrazeno 
            else 0 end 
        ) uhrazeno,
        subjekt_doklad_sub.reference_subjektu subjekt_refer,
        ltrim(case when poplatok.podnikatel='N' then isnull(poplatok.titul+' ', '')+isnull(poplatok.meno+' ', '') +isnull(poplatok.priezvisko, '') +(case when poplatok.titul_za is null then '' else isnull(', '+poplatok.titul_za, '') end )         else  poplatok.obchodny_nazov end  ) subjekt_nazev, 
        CONVERT(char(10), doklad.datum_realizacie, 104) akt_datum,
        lcs.fn21_meno_osoby_org(doklad.vybavuje, null) vyb_nazov, 

        /* ----------------------------Texty splátok výmeru start------------------------------------*/   
        
        (case
            when doklad.rok_podkladu<2008 then 
                (case 
                    when doklad.datum_spl2 is not null then ''
                    else  '-  naraz do '+convert(varchar(10), doklad.datum_spl1, 104) +' v sume:'      
                end)
            else      
                (case 
                    when doklad.datum_spl2 is not null then '' 
                    else  'v termíne do 15 dní odo dňa nadobudnutia právoplatnosti '+lcs.fn21_dane_text_vymer_rozhod(doklad.rok_podkladu, lcs.dane21_druh_dokladu.typ_dane, lcs.dane21_druh_dokladu.typ_dokladu, ov.dic) +' v sume:'       
                end)
        end)  TXTSPL1, 
        (case 
            when doklad.datum_spl2 is not null then ''         
            else lcs.fn21_dec2string(doklad.suma_mena, 2)   
        end ) SPL1, 
        (case 
            when doklad.rok_podkladu<2008 then
                (case 
                    when doklad.datum_spl2 is not null then '-  Splátka 1 do '+convert(varchar(10), doklad.datum_spl1, 104)  +' v sume:'                    else  ''               end  )        else             (case when doklad.datum_spl2 is not null then '- prvá splátka v termíne do 15 dní odo dňa nadobudnutia právoplatnosti '+lcs.fn21_dane_text_vymer_rozhod(doklad.rok_podkladu, lcs.dane21_druh_dokladu.typ_dane, lcs.dane21_druh_dokladu.typ_dokladu, ov.dic)+' v sume:'
                    else  '' 
                end)
        end) TXTSPL4_1, 
        (case 
            when doklad.datum_spl2 is not null then lcs.fn21_dec2string( doklad.suma_spl1 , 2)
            else  ''
        end  ) SPL4_1, 
        (case 
            when doklad.datum_spl2 is not null then
                (case 
                    when doklad.rok_podkladu<2008 or cast((cast( doklad.rok_podkladu as varchar(4))+right(CONVERT(char(8), pop_conf.spl_2_splatnost, 112), 4)) as datetime)>=doklad.datum_spl2                  then '- druhá splátka v termíne do '+convert(varchar(10), doklad.datum_spl2, 104) +' v sume:'
                    else '- druhá splátka v termíne do 15 dní odo dňa nadobudnutia právoplatnosti '+lcs.fn21_dane_text_vymer_rozhod(doklad.rok_podkladu, lcs.dane21_druh_dokladu.typ_dane, lcs.dane21_druh_dokladu.typ_dokladu, ov.dic)+' v sume:'
                end )
            else  ''
        end) TXTSPL4_2, 
        (case 
            when doklad.datum_spl2 is not null then lcs.fn21_dec2string( doklad.suma_spl2 , 2)
            else  '' 
        end) SPL4_2, 
        (case 
            when doklad.datum_spl3 is not null then
                (case 
                    when doklad.rok_podkladu<2008 or cast((cast( doklad.rok_podkladu as varchar(4))+right(CONVERT(char(8), pop_conf.spl_3_splatnost, 112), 4)) as datetime)>=doklad.datum_spl3  then '- tretia splátka v termíne do '+convert(varchar(10), doklad.datum_spl3, 104) +' v sume:'
                    else '- tretia splátka v termíne do 15 dní odo dňa nadobudnutia právoplatnosti '+lcs.fn21_dane_text_vymer_rozhod(doklad.rok_podkladu, lcs.dane21_druh_dokladu.typ_dane, lcs.dane21_druh_dokladu.typ_dokladu, ov.dic)+' v sume:'
                end )
            else  ''
        end  ) TXTSPL4_3, 
        (case 
            when  doklad.datum_spl3 is not null  then lcs.fn21_dec2string( doklad.suma_spl3 , 2)
            else  ''
        end  ) SPL4_3, 
        (case 
            when  doklad.datum_spl4 is not null  then 
                (case 
                    when doklad.rok_podkladu<2008 or cast((cast( doklad.rok_podkladu as varchar(4))+right(CONVERT(char(8), pop_conf.spl_4_splatnost, 112), 4)) as datetime)>=doklad.datum_spl4 then '- štvrtá splátka v termíne do '+convert(varchar(10), doklad.datum_spl4, 104)  +' v sume:'
                    else '- štvrtá splátka v termíne do 15 dní odo dňa nadobudnutia právoplatnosti '+lcs.fn21_dane_text_vymer_rozhod(doklad.rok_podkladu, lcs.dane21_druh_dokladu.typ_dane, lcs.dane21_druh_dokladu.typ_dokladu, ov.dic)+' v sume:'
                    end )
            else  ''
        end  ) TXTSPL4_4, 
        (case 
            when  doklad.datum_spl4 is not null  then lcs.fn21_dec2string( doklad.suma_spl4 , 2)
            else  ''
        end  ) SPL4_4,

        /* --------- Texty splátok výmeru end ----------------------------*/

        (case 
            when poplatok.podnikatel='N' then 'Meno a priezvisko:' 
            else 'Obchodné meno:' 
        end  ) TXT_MENO, 
        (case 
            when poplatok.podnikatel='N' then 'Adresa trvalého pobytu:' 
            else 'Sídlo:'
        end  ) TXT_UL, 
        (case 
            when poplatok.podnikatel='N' then 'Rodné číslo:' 
            else 'IČO/DIČ:' 
        end  ) TYP_USER, 
        (case 
            when poplatok.podnikatel='N' then poplatok.rodne_cislo 
            else  isnull(poplatok.ico, '')+'/'+isnull(ev_dic_cudz.dic, '') 
        end) ICO_RC, 

        a_tb.ulica_nazev+isnull( ' '+lcs.fn21_adresa_string(NULL, poplatok.adr_tp_sup_cislo, poplatok.adr_tp_or_cislo), '') as ulica_tb_cislo, 
        a_tb.psc_refer as psc_ref_tb,
        a_tb.psc_nazev as psc_naz_tb, 
        a_tb.stat_nazov_plny, 
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
    JOIN lcs.organizace_vlastni ov  ON 1=1
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
        lcs.subjekty subjekty_vybav  
        ON 
            subjekty_vybav.cislo_subjektu=pop_conf.vybavuje  

    LEFT OUTER JOIN 
        lcs.zamestnanci z_vybav  
        ON 
            z_vybav.cislo_subjektu=pop_conf.vybavuje  

    JOIN 
        lcs.subjekty subjekt_doklad  
        ON 
            doklad.cislo_subjektu=subjekt_doklad.cislo_subjektu

    JOIN 
        lcs.subjekty subjekt_tp_adresa  
        ON 
            poplatok.adresa_tp_sidlo=subjekt_tp_adresa.cislo_subjektu

    JOIN 
        lcs.subjekty subjekt_doklad_sub  
        ON 
            doklad.subjekt=subjekt_doklad_sub.cislo_subjektu

    JOIN 
        lcs.dane_21_sum_pko_popl_celkom dsum  
        ON
            dsum.cs_dan_prizn=poplatok.cislo_subjektu

    LEFT OUTER JOIN 
        lcs.organizace org_cudz  
        ON
            doklad.subjekt=org_cudz.cislo_subjektu  

    LEFT OUTER JOIN
        lcs.evidence_dic ev_dic_cudz  
        ON 
            org_cudz.evidence_dic=ev_dic_cudz.cislo_subjektu  

    JOIN
        lcs.dane21_doklad_sum_saldo view_doklad_saldo  
        ON
            view_doklad_saldo.cislo_subjektu=doklad.cislo_subjektu

    JOIN 
        lcs.dane_21_adresa_view a_tb  
        ON 
            poplatok.adresa_tp_sidlo=a_tb.cislo_subjektu
    WHERE 
        poplatok.rodne_cislo IN (@birth_numbers) AND
        nadoba.druh_odpadu IS NULL AND
        poplatok.rok = @year AND
        poplatok.podnikatel = 'N' AND
        doklad.pohladavka IS NOT NULL AND 
        lcs.dane21_druh_dokladu.typ_dokladu = 'V'AND
        lcs.dane21_druh_dokladu.typ_dane = '4' AND
        doklad.stav_dokladu<>'s' AND
        doklad.rok_podkladu = @year AND
        (nadoba.objem IS NOT NULL AND nadoba.pocet_nadob IS NOT NULL AND nadoba.pocet_odvozov IS NOT NULL AND nadoba.sadzba_mena IS NOT NULL AND nadoba.suma_uhrada_mena IS NOT NULL AND nadoba.druh_nadoby IS NOT NULL)
`
/* eslint-enable no-secrets/no-secrets */

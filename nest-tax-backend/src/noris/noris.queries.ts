export const queryPayersFromNoris = `
SELECT
    lcs.dane21_doklad.sposob_dorucenia,
    subjekty_a.cislo_poradace,
    lcs.dane21_doklad.cislo_subjektu, 
    subjekty_d1.nazev_subjektu adresa_tp_sidlo,
    subjekty_a.reference_subjektu cislo_konania , 
    lcs.dane21_doklad.datum_platnosti,
    lcs.dane21_doklad.variabilny_symbol, 
    (case 
        when isnull(lcs.dane21_druh_dokladu.generovat_pohladavku,'')='A' then view_doklad_saldo.uhrazeno 
        else 0 end 
    ) uhrazeno,
    (case 
        when isnull(lcs.dane21_druh_dokladu.generovat_pohladavku,'')='A' then (
            case 
                when dane21_doklad.stav_dokladu='S' then 0 
                else view_doklad_saldo.zbyva_uhradit 
            end)
        else 0 
    end ) zbyva_uhradit,
    subjekty_c.reference_subjektu subjekt_refer, 
    ltrim(case when lcs.dane21_priznanie.podnikatel='N' then isnull(lcs.dane21_priznanie.titul+' ', '')+isnull(lcs.dane21_priznanie.meno+' ', '') +isnull(lcs.dane21_priznanie.priezvisko, '') +(case when lcs.dane21_priznanie.titul_za is null then '' else isnull(', '+lcs.dane21_priznanie.titul_za, '') end )         else  lcs.dane21_priznanie.obchodny_nazov end  ) subjekt_nazev, 
    lcs.dane21_priznanie.rok, 
    a_tb.ulica_nazev as ulica_tb, 
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

   /* --------- Texty splátok výmeru end ----------------------------*/       /* obalka start */  
   
    (a_post_doklad.ulica_nazev+isnull( ' '+lcs.fn21_adresa_string(NULL, lcs.dane21_doklad.adr_po_sup_cislo, lcs.dane21_doklad.adr_po_or_cislo), '')  +
        (case 
            when  a_post_doklad.ulica is not null and isnull(a_post_doklad.psc_nazev, '')<>'' and a_post_doklad.obec_nazev<>left(isnull(a_post_doklad.psc_nazev, ''), len(a_post_doklad.obec_nazev)) then ', '+a_post_doklad.obec_nazev else '' 
        end)
    )   obalka_ulica, 
    a_post_doklad.psc_refer  obalka_psc, 
    a_post_doklad.psc_nazev  obalka_mesto, 
    a_post_doklad.stat_nazov_plny  obalka_stat, 
        left(replace (cast(floor( ( view_doklad_saldo.zbyva_uhradit  ) ) as varchar), '.', ''), len(replace (cast(floor( (  view_doklad_saldo.zbyva_uhradit  ) ) as varchar), '.', ''))-2) pouk_cena_bez_hal, 
        right(replace (cast(( ( view_doklad_saldo.zbyva_uhradit  ) ) as varchar), '.', ''), 2) pouk_cena_hal,     
    lcs.dane21_doklad.specificky_symbol,
    lcs.nf_valuace_atributu(21276, 0, 'lcs.dane21_doklad.uzivatelsky_atribut', lcs.dane21_doklad.uzivatelsky_atribut) as uzivatelsky_atribut,
    uda_21_organizacia_mag.dkba_sposob_dorucovania as delivery_method

FROM 
    lcs.dane21_doklad  

-- LEFT JOIN 
--     SELECT TOP 10 * FROM
--     lcs.kontext kont  
--     ON
--         kont.hid=host_id()  

LEFT OUTER JOIN 
    lcs.subjekty subjekty_a  
    ON 
        lcs.dane21_doklad.cislo_subjektu=subjekty_a.cislo_subjektu  

LEFT OUTER JOIN 
    lcs.subjekty subjekty_c  
    ON 
        lcs.dane21_doklad.subjekt=subjekty_c.cislo_subjektu  

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
    lcs.subjekty subjekty_a1  
    ON 
        subjekty_a1.cislo_subjektu=lcs.dane21_priznanie.cislo_subjektu  

LEFT OUTER JOIN 
    lcs.dane21_priznanie_config dp_conf  
    ON 
        subjekty_a1.cislo_poradace=dp_conf.cislo_poradace  

LEFT OUTER JOIN 
    lcs.subjekty subjekty_vybav  
    ON 
        subjekty_vybav.cislo_subjektu=dp_conf.vybavuje  

LEFT OUTER JOIN 
    lcs.zamestnanci z_vybav  
    ON 
        z_vybav.cislo_subjektu=dp_conf.vybavuje  

LEFT OUTER JOIN 
    lcs.subjekty subjekty_d1  
    ON 
        lcs.dane21_priznanie.adresa_tp_sidlo=subjekty_d1.cislo_subjektu  

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

WHERE 
    (
        lcs.dane21_druh_dokladu.typ_dokladu = 'v'
        AND lcs.dane21_druh_dokladu.typ_dane = '1'
        AND lcs.dane21_doklad.stav_dokladu<>'s'  
        AND lcs.dane21_doklad.rok_podkladu = {%YEAR%}
        AND lcs.dane21_priznanie.rok = {%YEAR%}
        AND lcs.dane21_priznanie.podnikatel = 'N'
        AND lcs.dane21_doklad.pohladavka IS NOT NULL
    )
    {%BIRTHNUMBERS%}

ORDER BY 
    lcs.dane21_priznanie.obchodny_nazov 
`

export const queryPaymentsFromNoris = `
SELECT 
        dane21_doklad.variabilny_symbol as variabilny_symbol,
        (case 
            when isnull(lcs.dane21_druh_dokladu.generovat_pohladavku,'')='A' then view_doklad_saldo.uhrazeno 
            else 0 end 
        ) uhrazeno,
        (case 
            when isnull(lcs.dane21_druh_dokladu.generovat_pohladavku,'')='A' then (
                case 
                    when dane21_doklad.stav_dokladu='S' then 0 
                    else view_doklad_saldo.zbyva_uhradit 
                end)
            else 0 
        end ) zbyva_uhradit,
        dane21_doklad.specificky_symbol specificky_symbol
    FROM 
        (SELECT
            *
        FROM
            lcs.dane21_doklad
        WHERE
            lcs.dane21_doklad.rok_podkladu {%YEARS%}
            AND lcs.dane21_doklad.rok_podkladu {%YEARS%}
        ) as dane21_doklad
    JOIN 
        (SELECT 
            *
        FROM
            lcs.dane21_doklad_sum_saldo
       WHERE
        lcs.dane21_doklad_sum_saldo.uhrazeno > 0
        {%FROM_TO_AND_OVERPAYMENTS_SETTINGS%}
        ) as view_doklad_saldo
        ON 
            view_doklad_saldo.cislo_subjektu=dane21_doklad.cislo_subjektu
    LEFT OUTER JOIN 
        lcs.dane21_druh_dokladu
        ON
            dane21_doklad.druh_dokladu=lcs.dane21_druh_dokladu.cislo_subjektu
    LEFT OUTER JOIN
        lcs.dane_21_all_poplatky vpodklad
        ON
            vpodklad.cislo_subjektu=dane21_doklad.podklad
    JOIN(
        SELECT
            distinct
            cislo_subjektu
        FROM
            lcs.subjekty subjekty_a
       WHERE
           reference_subjektu LIKE '1/%'
    ) as subjekty_a ON dane21_doklad.cislo_subjektu=subjekty_a.cislo_subjektu
    LEFT JOIN 
    lcs.dane21_priznanie  
    ON 
        dane21_doklad.podklad=lcs.dane21_priznanie.cislo_subjektu
    JOIN 
    lcs.subjekty subjekty_a1  
    ON 
        subjekty_a1.cislo_subjektu=lcs.dane21_priznanie.cislo_subjektu
   WHERE 
        lcs.dane21_druh_dokladu.typ_dokladu = 'v'
        AND lcs.dane21_druh_dokladu.typ_dane = '1'
        AND dane21_doklad.stav_dokladu<>'s'
        AND lcs.dane21_priznanie.podnikatel = 'N'
        {%VARIABLE_SYMBOLS%}
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

export const getNorisDataForUpdate = `
    SELECT variabilny_symbol, datum_platnosti
    FROM lcs.dane21_doklad
    WHERE rok_podkladu IN (@years)
    AND variabilny_symbol IN (@variable_symbols)
`

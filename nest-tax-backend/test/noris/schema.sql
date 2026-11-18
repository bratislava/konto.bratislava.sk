-- Stub of the Noris (MSSQL) schema used by the e2e tests.
--
-- Only the objects and columns read by src/noris/utils/noris.queries.ts belong here, with the types and nullability
-- of the real database. Views of the real Noris database are modelled as plain tables, so tests can set their values
-- directly. The functions are reimplemented from their observed behaviour.
--
-- The database is created with the Noris collation SQL_Czech_CP1250_CI_AS (see test/e2e-global-setup.ts). The queries
-- rely on it being case-insensitive, e.g. typ_dokladu = 'v' matches 'V'.
--
-- Batches are separated by GO lines (see splitSqlBatches in test/e2e-global-setup.ts).

CREATE SCHEMA lcs
GO

-- Tax documents: tax assessments (V), overpayments (ZAL) and others, see dane21_druh_dokladu
CREATE TABLE lcs.dane21_doklad (
  cislo_subjektu int NOT NULL PRIMARY KEY,
  stav_dokladu varchar(1) NULL,
  datum_platnosti smalldatetime NULL,
  variabilny_symbol varchar(20) NULL,
  datum_realizacie smalldatetime NULL,
  suma_mena money NULL,
  suma_spl1 money NULL,
  suma_spl2 money NULL,
  suma_spl3 money NULL,
  suma_spl4 money NULL,
  datum_spl1 smalldatetime NULL,
  datum_spl2 smalldatetime NULL,
  datum_spl3 smalldatetime NULL,
  datum_spl4 smalldatetime NULL,
  subjekt int NULL,
  podklad int NULL,
  pohladavka int NULL,
  druh_dokladu int NULL,
  rok_podkladu int NOT NULL
)
GO

CREATE TABLE lcs.dane21_druh_dokladu (
  cislo_subjektu int NOT NULL PRIMARY KEY,
  generovat_pohladavku varchar(1) NULL,
  typ_dokladu varchar(3) NULL,
  typ_dane varchar(1) NULL
)
GO

-- View in Noris (computed from the issued invoice of the document)
CREATE TABLE lcs.dane21_doklad_sum_saldo (
  cislo_subjektu int NOT NULL PRIMARY KEY,
  uhrazeno numeric(19, 4) NULL,
  zbyva_uhradit money NULL,
  datum_posledni_platby smalldatetime NULL
)
GO

-- Real estate tax return
CREATE TABLE lcs.dane21_priznanie (
  cislo_subjektu int NOT NULL PRIMARY KEY,
  podnikatel varchar(1) NULL,
  titul varchar(30) NULL,
  meno varchar(50) NULL,
  priezvisko varchar(50) NULL,
  titul_za varchar(30) NULL,
  rok int NULL,
  forma_uhrady varchar(1) NULL,
  rodne_cislo varchar(20) NULL
)
GO

CREATE TABLE lcs.dane21_priznanie_config (
  cislo_poradace int NOT NULL PRIMARY KEY,
  vybavuje int NULL
)
GO

-- View in Noris. The parts are NOT NULL there, the defaults let tests set only the parts they need.
CREATE TABLE lcs.dane_21_sum_dan_prizn_detail (
  cs_dan_prizn int NOT NULL PRIMARY KEY,
  dan_spolu money NULL,
  dan_byty money NOT NULL DEFAULT 0,
  dan_pozemky money NOT NULL DEFAULT 0,
  dan_stavby_SPOLU money NULL,
  det_zaklad_dane_byt money NOT NULL DEFAULT 0,
  det_zaklad_dane_nebyt money NOT NULL DEFAULT 0,
  det_dan_byty_byt money NOT NULL DEFAULT 0,
  det_dan_byty_nebyt money NOT NULL DEFAULT 0,
  det_pozemky_DAN_A money NOT NULL DEFAULT 0,
  det_pozemky_DAN_B money NOT NULL DEFAULT 0,
  det_pozemky_DAN_C money NOT NULL DEFAULT 0,
  det_pozemky_DAN_D money NOT NULL DEFAULT 0,
  det_pozemky_DAN_E money NOT NULL DEFAULT 0,
  det_pozemky_DAN_F money NOT NULL DEFAULT 0,
  det_pozemky_DAN_G money NOT NULL DEFAULT 0,
  det_pozemky_DAN_H money NOT NULL DEFAULT 0,
  det_pozemky_ZAKLAD_A money NOT NULL DEFAULT 0,
  det_pozemky_ZAKLAD_B money NOT NULL DEFAULT 0,
  det_pozemky_ZAKLAD_C money NOT NULL DEFAULT 0,
  det_pozemky_ZAKLAD_D money NOT NULL DEFAULT 0,
  det_pozemky_ZAKLAD_E money NOT NULL DEFAULT 0,
  det_pozemky_ZAKLAD_F money NOT NULL DEFAULT 0,
  det_pozemky_ZAKLAD_G money NOT NULL DEFAULT 0,
  det_pozemky_ZAKLAD_H money NOT NULL DEFAULT 0,
  det_pozemky_VYMERA_A money NOT NULL DEFAULT 0,
  det_pozemky_VYMERA_B money NOT NULL DEFAULT 0,
  det_pozemky_VYMERA_C money NOT NULL DEFAULT 0,
  det_pozemky_VYMERA_D money NOT NULL DEFAULT 0,
  det_pozemky_VYMERA_E money NOT NULL DEFAULT 0,
  det_pozemky_VYMERA_F money NOT NULL DEFAULT 0,
  det_pozemky_VYMERA_G money NOT NULL DEFAULT 0,
  det_pozemky_VYMERA_H money NOT NULL DEFAULT 0,
  det_stavba_DAN_A money NOT NULL DEFAULT 0,
  det_stavba_DAN_B money NOT NULL DEFAULT 0,
  det_stavba_DAN_C money NOT NULL DEFAULT 0,
  det_stavba_DAN_D money NOT NULL DEFAULT 0,
  det_stavba_DAN_E money NOT NULL DEFAULT 0,
  det_stavba_DAN_F money NOT NULL DEFAULT 0,
  det_stavba_DAN_G money NOT NULL DEFAULT 0,
  det_stavba_DAN_H money NOT NULL DEFAULT 0,
  det_stavba_j_DAN_H money NOT NULL DEFAULT 0,
  det_stavba_j_DAN_I money NOT NULL DEFAULT 0,
  det_stavba_ZAKLAD_A money NOT NULL DEFAULT 0,
  det_stavba_ZAKLAD_B money NOT NULL DEFAULT 0,
  det_stavba_ZAKLAD_C money NOT NULL DEFAULT 0,
  det_stavba_ZAKLAD_D money NOT NULL DEFAULT 0,
  det_stavba_ZAKLAD_E money NOT NULL DEFAULT 0,
  det_stavba_ZAKLAD_F money NOT NULL DEFAULT 0,
  det_stavba_ZAKLAD_G money NOT NULL DEFAULT 0,
  det_stavba_ZAKLAD_H money NOT NULL DEFAULT 0,
  det_stavba_j_ZAKLAD_H money NOT NULL DEFAULT 0,
  det_stavba_j_ZAKLAD_I money NOT NULL DEFAULT 0
)
GO

-- View in Noris
CREATE TABLE lcs.dane_21_sum_pko_popl_celkom (
  cs_dan_prizn int NOT NULL PRIMARY KEY,
  dan_spolu_nezaokr money NULL
)
GO

-- View in Noris
CREATE TABLE lcs.dane_21_adresa_view (
  cislo_subjektu int NOT NULL PRIMARY KEY,
  ulica_nazev varchar(100) NULL,
  psc_refer varchar(30) NULL,
  obec_nazev varchar(100) NULL
)
GO

-- Communal waste fee
CREATE TABLE lcs.pko21_poplatok (
  cislo_subjektu int NOT NULL PRIMARY KEY,
  podnikatel varchar(1) NULL,
  rok int NULL,
  titul varchar(30) NULL,
  meno varchar(50) NULL,
  priezvisko varchar(50) NULL,
  titul_za varchar(30) NULL,
  forma_uhrady varchar(1) NULL,
  rodne_cislo varchar(20) NULL
)
GO

CREATE TABLE lcs.pko21_poplatok_config (
  cislo_poradace int NOT NULL PRIMARY KEY,
  vybavuje int NULL
)
GO

-- Containers of a communal waste fee
CREATE TABLE lcs.pko21_nadoba (
  pko_poplatok int NULL,
  adresa int NULL,
  objem money NULL,
  pocet_nadob money NULL,
  pocet_odvozov money NULL,
  sadzba_mena money NULL,
  suma_uhrada_mena money NULL,
  druh_nadoby varchar(3) NULL,
  orientacne_cislo varchar(10) NULL,
  druh_odpadu varchar(3) NULL
)
GO

CREATE TABLE lcs.subjekty (
  cislo_subjektu int NOT NULL PRIMARY KEY,
  cislo_poradace int NOT NULL,
  reference_subjektu varchar(30) NULL,
  nazev_subjektu varchar(40) NULL
)
GO

CREATE TABLE lcs.organizace (
  cislo_subjektu int NOT NULL PRIMARY KEY,
  adr_tp_sup_cislo varchar(10) NULL,
  adr_tp_or_cislo varchar(10) NULL,
  adresa_tp_sidlo int NULL
)
GO

CREATE TABLE lcs.zamestnanci (
  cislo_subjektu int NOT NULL PRIMARY KEY,
  telefon_prace varchar(30) NULL,
  e_mail varchar(255) NULL
)
GO

-- Formats a number with a decimal comma and spaces between thousands, rounded half away from zero: 1234.5 -> '1 234,50'.
-- NULL is formatted as 0.
CREATE FUNCTION lcs.fn21_dec2string (@cislo decimal(15, 6), @dec int)
RETURNS varchar(30)
AS
BEGIN
  RETURN REPLACE(
    REPLACE(FORMAT(ROUND(ISNULL(@cislo, 0), @dec), CONCAT('N', @dec), 'en-US'), ',', ' '),
    '.',
    ','
  )
END
GO

-- Joins the building number (supisne) and street number (orientacne) with a slash: '1234/5A'. A missing one is left
-- out, both missing give ''. The address id is not used by the queries (always NULL).
CREATE FUNCTION lcs.fn21_adresa_string (@cs_adresa int, @supisne_cislo varchar(10), @orientacne_cislo varchar(10))
RETURNS varchar(1024)
AS
BEGIN
  DECLARE @supisne varchar(10) = NULLIF(TRIM(@supisne_cislo), '')
  DECLARE @orientacne varchar(10) = NULLIF(TRIM(@orientacne_cislo), '')
  RETURN COALESCE(@supisne + '/' + @orientacne, @supisne, @orientacne, '')
END
GO

-- Name of the person or organisation, '' when unknown. The stub takes it from subjekty.
CREATE FUNCTION lcs.fn21_meno_osoby_org (@cs int, @typ varchar(2))
RETURNS varchar(256)
AS
BEGIN
  RETURN ISNULL((SELECT nazev_subjektu FROM lcs.subjekty WHERE cislo_subjektu = @cs), '')
END
GO

UPDATE "Forms" 
SET "state" = 'FINISHED'
WHERE "state" = 'PROCESSING'
AND "formDefinitionSlug" IN (
    'olo-mimoriadny-odvoz-a-zhodnotenie-odpadu',
    'olo-energeticke-zhodnotenie-odpadu-v-zevo',
    'olo-uzatvorenie-zmluvy-o-nakladani-s-odpadom',
    'olo-docistenie-stanovista-zbernych-nadob',
    'olo-odvoz-odpadu-velkokapacitnym-alebo-lisovacim-kontajnerom',
    'olo-kolo-taxi',
    'olo-olo-taxi',
    'olo-podnety-a-pochvaly-obcanov',
    'olo-odvoz-objemneho-odpadu-valnikom',
    'olo-triedeny-zber-papiera-plastov-a-skla-pre-pravnicke-osoby',
    'olo-triedeny-zber-papiera-plastov-a-skla-pre-spravcovske-spolocnosti',
    'tsb-objednavka-zakresu-sieti',
    'tsb-objednavka-vytycenia',
    'tsb-ziadost-o-stanovisko-pd',
    'tsb-umiestnenie-zariadenia'
);
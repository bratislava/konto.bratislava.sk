import { SharepointColumnMapValue } from '../../definitions/sharepointTypes';
export declare const ziadostONajomBytuSharepointData: {
    databaseName: string;
    columnMap: Record<string, SharepointColumnMapValue>;
    oneToMany: {
        'deti.zoznamDeti': {
            databaseName: string;
            originalTableId: string;
            columnMap: Record<string, SharepointColumnMapValue>;
        };
        'inyClenoviaClenkyDomacnosti.zoznamInychClenov': {
            databaseName: string;
            originalTableId: string;
            columnMap: Record<string, SharepointColumnMapValue>;
        };
    };
    oneToOne: {
        ziadatelZiadatelka: {
            databaseName: string;
            originalTableId: string;
            columnMap: Record<string, SharepointColumnMapValue>;
        };
        'manzelManzelka.manzelManzelkaSucastouDomacnosti': {
            databaseName: string;
            originalTableId: string;
            columnMap: Record<string, SharepointColumnMapValue>;
        };
        'druhDruzka.druhDruzkaSucastouDomacnosti': {
            databaseName: string;
            originalTableId: string;
            columnMap: Record<string, SharepointColumnMapValue>;
        };
    };
};

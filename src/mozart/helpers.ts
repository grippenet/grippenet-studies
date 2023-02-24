import { as_option } from "../common";

export const _T = (id:string, text: string) => {
    return new Map<string,string>([
        ['id', K(id)],
        ['fr', text]
    ]);
}

export const K = (id: string) => {
    return 'mozart.' + id;
}

export const options_french = (oo: string[][], prefix: string ) => {
    return  oo.map(e =>  as_option(e[0], _T(prefix + e[0], e[1])));
};

export interface ObservationPeriod {
    start: number;
    end: number;
    label: string;
}

export const getTimestamp = (d: Date): number => {
    return Math.floor(d.getTime() / 1000);
}

export const createPeriod = (start: string, end: string, label: string): ObservationPeriod => {
    const toDate = (d: string)=> new Date(Date.parse(d));
    return {
        start: getTimestamp(toDate(start)),
        end: getTimestamp(toDate(end)),
        label: label
    }
}
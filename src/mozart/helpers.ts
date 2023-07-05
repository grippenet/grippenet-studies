import { as_option } from "../common";
import { addMonths, format, fromUnixTime } from "date-fns";
import { fr } from "date-fns/locale";

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

export const getTimestamp = (d: Date): number => {
    return Math.floor(d.getTime() / 1000);
}

export const createPeriod = (start: string, end: string, label: string): ObservationPeriod => {
    return new ObservationPeriod(start, end, label);
}

const toDate = (d: string)=> new Date(Date.parse(d));
    
export class ObservationPeriod {
    start: number;
    end: number;
    label: string;

    constructor(start: string, end: string, label: string) {
        this.start = getTimestamp(toDate(start));
        this.end = getTimestamp(toDate(end));
        this.label= label;
    }

    startDate(): Date {
        return  fromUnixTime(this.start);
    }

    endDate(): Date {
        return fromUnixTime(this.end);
    }
 
    toRange():string {   
        const fullDate = (d:Date) => {
            const day = (d.getDate() == 1) ? 'do': 'd';
            return format(d, day +' MMMM yyyy', {locale: fr});
        }
       return 'du ' + fullDate(this.startDate()) + ' au ' + fullDate(this.endDate());
    }    

}
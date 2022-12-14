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
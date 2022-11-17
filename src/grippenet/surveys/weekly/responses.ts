import { Logger } from "case-editor-tools/logger";
import { responses as common_responses } from "../../../common"

const common = common_responses.weekly;

interface EncodingDict {
    [key:string]: string
};

interface EncodingLibrary {
    [key:string]: EncodingDict
}

const omit = (l: EncodingLibrary, ...without: string[]): EncodingLibrary => {
    const o: EncodingLibrary = {};
    const excluded = new Set<string>(without);
    Object.entries(l).forEach(e => {
        const name = e[0];
        const codes = e[1];
        if(excluded.has(name)) {
            return;
        }
        o[name] = codes;
    });
    return o;
}

const check_encoding = (o:EncodingDict): Map<string, string[]> => {
    const codes = new Set<string>();
    const duplicates: Map<string, string[]> = new Map();
    
    const add = (code:string, name: string)=> {
        const d = duplicates.get(code) ?? [];
        if(d.length == 0) {
            duplicates.set(code, d);
        }
        d.push(name);
    }
    
    Object.entries(o).forEach(e=>{
        const code = e[1];
        if(codes.has(code)) {
            add(code, e[0] );
        }
    });
    return duplicates;
}

const check_encoding_library = (l: EncodingLibrary):void =>{
    Object.entries(l).forEach(e => {
        const name = e[0];
        const codes = e[1];
        const dup = check_encoding(codes);
        if(dup.size > 0) {
            dup.forEach( (names, key) => {
                Logger.error("Duplicate encoding for key "+ key + " in " + names.join(','));
            });
        }
    });
}

const ResponseEncoding = {
    ...common,
    visit_medical : {
        'other_community': '6',
        'gynecologist': '9',
        'midwife': '10',
        'pharmacist':'7',
        'scholar': '8',
       
        ...common.visit_medical
    } as const
} as const;


check_encoding_library(ResponseEncoding);

export default ResponseEncoding;
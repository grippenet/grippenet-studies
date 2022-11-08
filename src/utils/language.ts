import { Translation } from "../common";

export const extra_texts = new Map<string, Map<string,string>>();

function create_for_lang(text: string, language: string, id?:string) {
    const  trans = new Map<string,string>([
        [language, text]
    ]);
    if(id) {
        extra_texts.set(id, trans);
    }
    return trans;
}


/**
 * Returns a french text
 */
 export function french(text:string, id?:string): Map<string,string> {
    return create_for_lang(text, 'fr', id);
}

export function english(text:string, id?:string): Map<string,string> {
    return create_for_lang(text, 'en', id);   
}





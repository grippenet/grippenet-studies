import {  _T, Translation } from "../common"
import { OptionDef } from "case-editor-tools/surveys/types";
import { as_option } from "../../common/tools/options";

/**
 * Describe a response encoding a simple dictionary
 * Key is the option key to use
 */
 export interface DictResponse {
    [key:string]: Translation
}

/**
 * Create a response option array from a simple dictionary
 * In very simple cases, option list can be only a key and some translations list
 * 
 * @param dict 
 * @returns 
 */
export function dict_to_response(dict: DictResponse): OptionDef[] {
    
    const responses = Object.entries(dict).map(r=>{
        const key = r[0];
        const trans = Object.entries(r[1]);
        return as_option(key, new Map(trans));
    });

    return responses;
}

/**
 * 
 * Create options from an array of [key, en_text]
 * @param opts 
 * @param prefix prefix to add to the key to obtain the translation id
 * @returns 
 */
export function array_to_options(opts: Array<string[]>, prefix: string):OptionDef[] {
    const oo : OptionDef[] = opts.map(o => {
        const id = prefix + o[0];
        return as_option(o[0], _T(id, o[1]) );
   });
   return oo;
}

export interface ResponseOveriddes {
    [key:string]: string[]
};


export interface OverridenResponses {
    getResponseOverrides(): ResponseOveriddes
}

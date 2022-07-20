import {  _T, Translation, LanguageMap } from "../../common"
import { OptionDef } from "case-editor-tools/surveys/types";

export function as_option(key:string, content: Map<string,string> ): OptionDef {
    return {
        role: 'option',
        key: key,
        content: content,
    }   
}

/**
 * Returns a french text
 */
export function french(text:string): Map<string,string> {
    return new Map<string,string>([
        ['fr', text]
    ]);
}

export function english(text:string): Map<string,string> {
    return new Map<string,string>([
        ['en', text]
    ]);
}


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

export function as_input_option(key:string, content: Map<string,string>, description?: Map<string, string>  ): OptionDef {
    return {
        key: key,
        role: "input",
        style: [{ key: 'className', value: 'w-100' }],
        content: content,
        description: description
    };
}

export interface ResponseOveriddes {
    [key:string]: string[]
};


export interface OverridenResponses {
    getResponseOverrides(): ResponseOveriddes
}

export class OptionList {
    options: OptionDef[]

    constructor(options:OptionDef[]) {
        this.options = options;
    }

    /**
     * 
     * @param key key to find and insert element after this element
     * @param oo list of options to add
     * @returns OptionList fluent interface
     */
    insertAfterKey(key:string, ...oo:OptionDef[]) {
        const index = this.indexOf(key);
        if(index < 0) {
            throw new Error("Option key '"+key+"' is not found in list");
        }
        this.insertAt(index + 1, ...oo);
        return this;
    }

    insertBeforeKey(key:string, ...oo:OptionDef[]) {
        const index = this.indexOf(key);
        if(index < 0) {
            throw new Error("Option key '"+key+"' is not found in list");
        }
        var i = index -1;
        if(i < 0) {
            i = 0;
        }
        this.insertAt(i, ...oo);
        return this;
    }

    indexOf(key:string):number {
        return this.options.findIndex((o)=>{
            return o.key == key;
        });
    }

    insertAt(index: number, ...oo:OptionDef[]) {
        this.options = this.options.splice(index, 0, ...oo);
        return this;
    }

    /**
     * Get options after update
     * @returns Get
     */
    values(): OptionDef[] {
        return this.options;
    }
}


export function add_meta(m: LanguageMap, meta: Map<string,string> ):LanguageMap {
    meta.forEach((value, key)=> {
        m.set('_' + key, value);
    });
    return m;
}




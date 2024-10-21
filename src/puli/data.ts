import { option_input_other } from "../common";
import * as SurveyData from "./data.json";

export class QuestionInfo {
    
    options?: Map<string,string>;

    scale?: Map<string, string>;

    title: string;

    top?: string;
    
    constructor(title:string, options?: Map<string,string>, scale?: Map<string,string>) {
        this.title = title;
        this.options = options;
        this.scale = scale;
    }

    hasScale(): boolean {
        return typeof(this.scale) != "undefined" && this.scale.size > 0;
    }
    hasOptions(): boolean {
        return typeof(this.options) != "undefined" && this.options.size > 0;
    }
}

interface OptionInfo {
    key: string;
    label: string;
}

interface OptionData {
    key?: any;
    label?: any;
}

class OptionImportError extends Error {

}

const import_options = (options: OptionData[], name: string): Map<string,string> => {
   const oo: Map<string,string> = new Map();
    options.forEach((o, idx) => {
        if(typeof(o['key']) != "string") {
            throw new OptionImportError("Expecting field 'key' with string value at " + idx + " for '" + name + "'");
        }
        if(!(typeof(o['label']) == "string" || typeof(o['label']) == "number" )) {
            throw new OptionImportError("Expecting field 'label' with string value at " + idx+ " for '" + name + "'");
        }
        oo.set(o['key'], '' + o['label']);
    });
    return oo;
}

class SurveyInfo {
    data : Map<string, QuestionInfo>;

    constructor(data: object) {
        this.data = new Map();
        Object.entries(data).forEach( v => {
            const [name, info] = v;
            if(name.startsWith("_")) {
                return;
            }
            if(name == "default") {
                return;
            }
            if(this.data.has(name)) {
                console.warn("Duplicate entry for "+ name);
            }
            if(typeof(info) == "object") {
                const title = info['title'];
                if(!title) {
                    console.log(info);
                    throw new Error("Title not found for " + name);
                }

                const options = info['options'] ?? undefined;
                const scale = info['scale'] ?? undefined;
                let oo: Map<string,string>|undefined = undefined;
                let sc: Map<string, string>|undefined = undefined;
                if(options) {
                    if(Array.isArray(options)) {
                        oo = import_options(options, name);
                    } else {
                        console.warn("Options must be an array in " + name);
                    }
                }
                if(scale) {
                    if(Array.isArray(scale)) {
                        sc = import_options(scale, name);
                    } else {
                        console.warn("scale must be an array in " + name);
                    }
                }
                const q = new QuestionInfo(title, oo, sc);
                if( typeof(info['top']) == "string" ) {
                    q.top = info['top'];
                }
                this.data.set(name, q);
            } else {
               if(typeof(info) == "string") {
                const q = new QuestionInfo(info);
                this.data.set(name, q);
               } else {
                console.warn("Survey info Entry " + name +" has not an object");
               }
            }
        });
    }

    get(name: string): QuestionInfo|undefined {
        return this.data.get(name);
    }
}

export const surveyInfo = new SurveyInfo(SurveyData);

export const question_info = (name: string):QuestionInfo=> {
    const info = surveyInfo.get(name);
    if(!info) {
        throw new Error("Unable to get question for name : " + name);
    }
    return info;
}
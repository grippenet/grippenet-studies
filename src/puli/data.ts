import * as SurveyData from "./data.json";

export class QuestionInfo {
    
    options?: Map<string,string>;

    scale?: Map<string, string>;

    title: string;
    
    constructor(title:string, options?: Map<string,string>) {
        this.title = title;
        this.options = options;
    }
}

interface OptionInfo {
    key: string;
    label: string;
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
            if(this.data.has(name)) {
                console.warn("Duplicate entry for "+ name);
            }
            if(typeof(info) == "object") {
                const title = info['title'];
                const options = info['options'] ?? undefined;
                let oo: Map<string,string>|undefined = undefined;
                if(options) {
                    if(Array.isArray(options)) {
                        const o = new Map<string, string>();
                        options.forEach((v) => {
                            const key = v['key'];
                            const label = v['label'];
                            o.set(key, ''+ label);
                        });
                        oo = o;
                        
                    } else {
                        console.warn("Options must be an array in " + name);
                    }
                    
                }
                const q = new QuestionInfo(title, oo);
                this.data.set(name, q);
            } else {
                console.warn("Survey info Entry " + name +" has not an object");
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
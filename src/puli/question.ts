import { SurveyItem, Expression, SurveySingleItem, Validation, ItemComponent } from "survey-engine/data_types";
import { as_option, BaseChoiceQuestion, exp_as_arg, ItemQuestion, option_def, ClientExpression as client, textComponent, as_input_option, make_exclusive_options, num_as_arg, ItemProps, markdownComponent, } from "../common";
import { SurveyItems } from "case-editor-tools/surveys";
import { _T } from "./helpers";
import { QuestionInfo, question_info } from "./data";
import { Item, OptionDef, StyledTextComponentProp, ResponsiveSingleChoiceArrayProps } from "case-editor-tools/surveys/types";
import { QuestionType } from "../../common/types/item";
import { likertScaleKey } from "case-editor-tools/constants/key-definitions";
import { initResponsiveSingleChoiceArray } from "case-editor-tools/surveys/responseTypeGenerators/likertGroupComponents";
import { RandomCodeQuestion as BaseRandomCodeQuestion } from "../grippenet/questions";

interface ItemWithKey {
    key: string;
}

const text = function(item: ItemWithKey, name: string, text: string) {
    return _T(item.key + '.' + name, text);
}

export class MarkdownQuestion extends ItemQuestion {
    
    text: string

    constructor(parentKey:string, key:string) {
        super({parentKey: parentKey}, key);
        const info = question_info(key);
        this.text = info.title;
    }

    buildItem(): SurveySingleItem {
        return SurveyItems.display({
            parentKey: this.parentKey,
            itemKey: this.itemKey,
            content: [
                markdownComponent({
                    key: this.itemKey,
                    content: text(this, "text", this.text )
                })
            ]
        });
    }
}

export class TitleQuestion extends ItemQuestion {
    
    text: string;
    constructor(parentKey: string, key: string, text:string) {
        super({parentKey: parentKey}, key);
        this.text = text;
    }

    buildItem() {
        return SurveyItems.display({
            parentKey: this.parentKey,
            itemKey: this.itemKey,
            content: [ 
                textComponent({
                    key: this.itemKey + '_txt',
                    content: _T(this.key, this.text),
                    variant: 'h1',
                })
            ],
            condition: this.getCondition()
        });
    }
}

type ResponseHandler = (options: OptionDef[])=>OptionDef[];

interface ChoiceQuestionOptions {
    otherOptions?: string[];
    exclusive?: string[];
    required?: boolean;
    placeholders?: Record<string,string>;
}

export class RandomCodeQuestion extends BaseRandomCodeQuestion {
    
    constructor(parentKey:string, itemKey: string, responseKey: string, text: Map<string,string>) {
        super({
            parentKey: parentKey,
            questionText: text,
            codeConfig: {
                responseKey: responseKey,
                codeLabel: _T(itemKey +'.code', "Code à nous communiquer :"),
                codeAlphabet: "0123456789ABCDEFGHJKLMNPQRSTUVWXYZ",
                codeSize: 5,
                codeLink: 'mailto:punaisedelit@iplesp.upmc.fr?subject=%code%',
                linkLabel: _T(itemKey + '.link', "Cliquez ici pour envoyer un courriel")
            }
        }, itemKey);
    }
    
}

const apply_plaholders = (text: string, placeholders: Record<string,string>) => {
    Object.entries(placeholders).forEach(v => {
        const [name, replacement] = v;
        text = text.replaceAll('{' + name + '}', replacement);
    });
    return text;
}


export class InfestationHistory extends BaseChoiceQuestion {
    
    constructor(parentKey: string, name: string, period:string) {
        super({'parentKey': parentKey}, name, 'single');

        this.setOptions({
            questionText: 
                 text(this, 'title', "Avez-vous été confronté à une infestation de punaises de lit depuis "+ period + " que ce soit chez vous ou hors de votre domicile, que vous ayez été piqué ou non ?")
            },
        );
    }
    
    getResponses(): OptionDef[] {
        return [
            option_def('1', text(this, 'option.yes', "Oui")),
            option_def('0', text(this, 'option.no', "Non")),
            option_def('3', text(this, 'option.nsp', "Je ne sais pas")),
        ]
    }
}


export class ChoiceQuestion extends BaseChoiceQuestion {

    info: QuestionInfo;

    otherOptions: string[];

    exclusiveOptions: string[];

    constructor(parentKey: string, name:string, type: QuestionType, opts?: ChoiceQuestionOptions ) {
        super({parentKey: parentKey}, name, type);
        this.info = question_info(name);

        if(opts?.placeholders) {
            this.info.title = apply_plaholders(this.info.title, opts.placeholders);
        }

        const top = type == "multiple" ? [
            textComponent({"content": text(this, 'several', "Plusieurs réponses possibles"), className:"mt-0 mb-1", key: "several"})
        ] : undefined;

        this.setOptions({
            questionText: text(this, 'title', this.info.title),
            topDisplayCompoments: top,
        });
        this.otherOptions = [];
        this.exclusiveOptions = [];
        if(opts) {
            if(opts.otherOptions) {
               this.otherOptions.push(...opts.otherOptions);
            }
            if(opts.exclusive) {
                this.exclusiveOptions.push(...opts.exclusive);
            }
            if(opts.required) {
                this.isRequired = opts.required;
            }
        }
    }



    getResponses(): OptionDef[] {
        const oo: OptionDef[] = [];
        if(!this.info.options) {
            console.warn("No option defined for " + this.key);
        } else {

            const create_option = (key: string, text:Map<string, string>) => {
                if(this.otherOptions.includes(key)) {
                    return as_input_option(key, text, _T(this.key + '.other', "Précisez"));
                }
                return option_def(key, text );
            }

            this.info.options.forEach((value, key)=> {

                let o : OptionDef;
                const text = _T(this.key +'.opt.' + key, value);

                oo.push(create_option(key, text));                
            });
        }

        if(this.exclusiveOptions) {
            make_exclusive_options(this.key, oo, this.exclusiveOptions);
        }

        return oo;
    }

    createConditionFrom(responses: string[]):Expression|undefined {
        if(!this.info.options) {
            console.warn("Unable to create condition with No option ");
            return undefined;
        }
        responses.forEach(v => {
            if(!this.info.options?.get(v)) {
                console.warn("Option '" + v + "' unknown for question " + this.key);
            }
        });
       return super.createConditionFrom(responses);
    }

}

interface QuestionValidation {
        condition: Expression,
        message: string
}

interface MonthDateOptions {
    validation?: QuestionValidation
}


export class MonthDateQuestion extends ItemQuestion {

   static readonly DateComponent = 'rg.scg.date';

   info: QuestionInfo;

   validation?: QuestionValidation

   addLesssOneMonth?: string
   
  constructor(parent: string, itemKey:string) {
    super({parentKey: parent}, itemKey);
    this.addLesssOneMonth = undefined;
    this.info = question_info(itemKey);
  } 

  required(b: boolean) {
    this.isRequired = b;
    return true;
  }

  setValidation(validation?: QuestionValidation) {
    this.validation = validation;
  }
  
  getValidations(): Validation[]|undefined {
    
    const vv : Validation[] = [];
    if(this.validation) {
       vv.push(
            {
                'key': 'pc1',
                'type':'hard',
                rule: this.validation.condition
            },
       );
    }
    
    if(this.isRequired) {
        vv.push(
            {
                'key': 'pc2',
                'type':'hard',
                rule: client.compare.gt(client.getResponseValueAsNum(this.key, MonthDateQuestion.DateComponent), 0),
            }
        );
    }

    if(vv.length == 0) {
        return undefined;
    }

    return vv;
  } 

  getBottomComponents() {
    const b : ItemComponent[] = [];

    if(this.validation) {
    
        b.push(
                textComponent({
                    displayCondition: client.logic.not(client.getSurveyItemValidation(this.key, 'pc1')),
                    content: text(this, 'validationError', this.validation.message),
                    className: "text-danger",
                })
        );
    }

    if(this.isRequired) {
       b.push(textComponent({
            displayCondition: client.logic.not(client.getSurveyItemValidation(this.key, 'pc2')),
            content: text(this, 'dateError', "Une date est attendue pour cette question (si vous avez déjà indiqué une date, ne tenez pas compte de ce message, il va disparaître en remplissant les questions suivantes)."),
            className: "text-danger",
            })
        );
    }

    if(b.length == 0) {
        return undefined;
    }

    return b;
  }

  buildItem(): SurveySingleItem {

        const rr: OptionDef[] = [
            {
                key: 'date', role: 'dateInput',
                optionProps: {
                    dateInputMode: { str: 'YM' },
                    min: exp_as_arg( client.timestampWithOffset({'years': -1})),
                    max: exp_as_arg( client.timestampWithOffset({'minutes': 1}) )
                },
                content: _T(this.key + '.date', "Choissez une date (année, puis mois) "),
                //description: _T("Q10a.option.date.desc","desc")
            },
        ];

        if(this.addLesssOneMonth) {
            as_option('2', _T(this.key + '.option.l1m.title', this.addLesssOneMonth)) 
        }

        rr.push(as_option('3', _T(this.key + '.option.idk.title', "Je ne sais pas")) );

        return SurveyItems.singleChoice({
        parentKey: this.parentKey,
        itemKey: this.itemKey,
        isRequired: this.isRequired,
        condition: this.getCondition(),
        questionText: _T(this.key, this.info.title),
        responseOptions: rr,
        customValidations: this.getValidations(),
        bottomDisplayCompoments: this.getBottomComponents(),
    });
  }

  getDateValue() {
    return client.getResponseValueAsNum(this.key, MonthDateQuestion.DateComponent);
  }

}

interface NumericQuestionOptions {
    min?: number;
    max?: number;
}

type NumericInputParameters = Parameters<typeof SurveyItems.numericInput>;

type ComponentPoperties = NumericInputParameters[0]['componentProperties']

export class NumericQuestion extends ItemQuestion {
    
    title: string;

    componentProps?: NumericQuestionOptions;

    constructor(parentKey: string, itemKey: string, opts?: NumericQuestionOptions) {
        super({parentKey: parentKey}, itemKey);
        const info = question_info(itemKey);
        this.title = info.title;
        this.componentProps = opts;
    }

    required(b: boolean) {
        this.isRequired = b;
        return this;
    }

    getComponentProperties(): ComponentPoperties {
        if(!this.componentProps) {
            return undefined;
        }
        const p : ComponentPoperties = {};
        if(typeof(this.componentProps.min) != "undefined") {
            p.min = num_as_arg(this.componentProps.min);
        }
        if(typeof(this.componentProps.max) != "undefined") {
            p.max = num_as_arg(this.componentProps.max);
        }
        return p;
    }

    buildItem() {

        return SurveyItems.numericInput({
            componentProperties: this.getComponentProperties(),
            parentKey: this.parentKey,
            isRequired: this.isRequired,
            itemKey: this.itemKey,
            questionText: _T(this.key + '.title', this.title),
            inputLabel: _T(this.key + '.input', "Entrez un nombre"),
            condition: this.getCondition()
        });
    }
}

interface ScaleOption {
    key: string;
    className?: string;
    content: Map<string, string> | Array<StyledTextComponentProp>;
}

type LikertRow = ResponsiveSingleChoiceArrayProps['rows'][0];

export class LikertQuestion extends ItemQuestion {
    
    info: QuestionInfo;
    
    constructor(parentKey: string, key: string) {
        super({"parentKey": parentKey}, key);
        this.info = question_info(key);
        if(!this.info.hasScale()) {
            throw new Error("Cannot use Likert without scale in " + key);
        }
        if(!this.info.hasOptions()) {
            throw new Error("Cannot use Likert without options in " + key);
        }
    }

    required(b: boolean) {
        this.isRequired = b;
        return this;
    }

    getScaleOptions() {
        if(!this.info.scale) {
            return [];
        }
        const oo : ScaleOption[] = [];
        this.info.scale.forEach((value, key) => {
            oo.push({"key":  key, content: _T(this.key + '.scale.' + key, value)});
        });
        return oo;
    }

    getRows(): LikertRow[] {
        if(!this.info.options) {
            return [];
        }
        const oo: LikertRow[] = [];
        this.info.options.forEach((value, key)=> {
            oo.push({"key": key, "content": text(this, "opt." + key, value)});
        });
        return oo;
    }

    getTopDisplay() {
        if(this.info.top) {
            return [textComponent({
                'key': 'top',
                content: text(this, 'top', this.info.top),
                className: 'mb-1'
            })];
        }
        return undefined;
    }

    buildItem() {
        return SurveyItems.responsiveSingleChoiceArray({
            parentKey: this.parentKey,
            itemKey: this.itemKey,
            isRequired: this.isRequired,
            scaleOptions: this.getScaleOptions(),
            questionText: text(this, 'title', this.info.title),
            rows: this.getRows(),
            defaultMode: "horizontal",
            topDisplayCompoments: this.getTopDisplay()
        })
    }
} 

    
interface NumberDontKnowQuestionOpts {
    inputLabel?:string;
}

export class NumberDontKnowQuestion extends ItemQuestion {

    static readonly NumberComponent = 'rg.1';
 
    info: QuestionInfo;

    inputLabel: string;
    
   constructor(parent: string, itemKey:string, opts?: NumberDontKnowQuestionOpts) {
     super({parentKey: parent }, itemKey);
     this.info = question_info(itemKey);
     this.inputLabel = "Entrez un nombre";
     if(opts) {
        if(opts.inputLabel) {
            this.inputLabel = opts.inputLabel;
        }
     }
   } 
   
   buildItem(): SurveySingleItem {
         return SurveyItems.singleChoice({
         parentKey: this.parentKey,
         itemKey: this.itemKey,
         isRequired: this.isRequired,
         condition: this.getCondition(),
         questionText: _T(this.key, this.info.title),
         responseOptions: [
             {
                 key: '1', role: 'numberInput',
                 optionProps: {
                     min: 1,
                 },
                 content: _T(this.key + '.num', this.inputLabel),
                 //description: _T("Q10a.option.date.desc","desc")
             },
             as_option('3', _T(this.key + '.option.idk.title', "Je ne sais pas")),
             as_option('0', _T(this.key + '.option.dwa.title', "Je ne souhaite pas répondre")),
         ]
     });
   }
 }


export class SurveyEnd extends Item {

    text: string;

    constructor(parentKey: string, text:string) {
        super(parentKey, 'surveyEnd');
        this.text = text;
    }

    buildItem() {
       return SurveyItems.surveyEnd(
            this.parentKey,
             _T("surveyEnd", this.text)
        );
    }

}
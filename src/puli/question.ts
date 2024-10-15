import { SurveyItem, Expression, SurveySingleItem } from "survey-engine/data_types";
import { as_option, BaseChoiceQuestion, exp_as_arg, ItemQuestion, option_def, ClientExpression as client, textComponent, as_input_option, } from "../common";
import { SurveyItems } from "case-editor-tools/surveys";
import { _T } from "./helpers";
import { QuestionInfo, question_info } from "./data";
import { Item, OptionDef } from "case-editor-tools/surveys/types";
import { QuestionType } from "../../common/types/item";

interface ItemWithKey {
    key: string;
}

const text = function(item: ItemWithKey, name: string, text: string) {
    return _T(item.key + '.' + name, text);
}

export class TitleQuestion extends ItemQuestion {
    
    text: string;
    constructor(parentKey: string, key: string, text:string) {
        super({parentKey: parentKey}, key);
        this.text = text;
    }

    buildItem() {
        return SurveyItems.display({
            parentKey: this.key,
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
}

export class ChoiceQuestion extends BaseChoiceQuestion {

    info: QuestionInfo;

    otherOptions: string[];

    exclusiveOptions: string[];

    constructor(parentKey: string, name:string, type: QuestionType, opts?: ChoiceQuestionOptions ) {
        super({parentKey: parentKey}, name, type);
        this.info = question_info(name);
        this.setOptions({
            questionText: text(this, 'title', this.info.title),
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

export class MonthDateQuestion extends ItemQuestion {

   static readonly DateComponent = 'rg.1';

   info: QuestionInfo;
   
  constructor(parent: string, itemKey:string) {
    super({parentKey: parent }, itemKey);
    this.info = question_info(itemKey);
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
                key: '1', role: 'dateInput',
                optionProps: {
                    dateInputMode: { str: 'YM' },
                    min: exp_as_arg( client.timestampWithOffset({'years': -1})),
                    max: exp_as_arg( client.timestampWithOffset({'minutes': 1}) )
                },
                content: _T(this.key + '.date', "Choissez une date"),
                //description: _T("Q10a.option.date.desc","desc")
            },
            as_option('3', _T(this.key + '.option.idk.title', "Je ne sais pas")),
        ]
    });
  }
}

export class NumericQuestion extends ItemQuestion {
    
    title: string;
    constructor(parentKey: string, key: string) {
        super({parentKey: parentKey}, key);
        const info = question_info(key);
        this.title = info.title;
    }

    buildItem() {
        return SurveyItems.numericInput({
            parentKey: this.key,
            itemKey: this.itemKey,
            questionText: _T(this.key + '.title', this.title),
            inputLabel: _T(this.key + '.input', "Entrez un nombre"),
            condition: this.getCondition()
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
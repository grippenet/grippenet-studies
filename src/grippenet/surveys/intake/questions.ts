// [X] Q3 PostalCode
// [X] Q4b 
// [X] Q4e
// [X] Q4f
// [X] Q4g
// [X] Q5 PeopleMet +Option5
// [X] Q13 Smoking +5, +6, no
// [X] Q19 Body Weight
// [X] Q20 Body Height
// [X] Q24 Homeopathic Medecine => Q26
// [X] Q17 +8, +9, +10, +11 ....
// [X] Q34 GastroEnteritisFrequency

import {  questionPools as pool, _T,  ItemQuestion,  ItemProps, BaseChoiceQuestion,transTextComponent,  } from "../../../common"
import { ClientExpression as client, as_option, as_input_option,OptionList, markdownComponent, textComponent } from "../../../common";
import { Item, OptionDef } from "case-editor-tools/surveys/types";
import { SurveyItems } from 'case-editor-tools/surveys';
import { french, dict_to_response, OverridenResponses, ResponseOveriddes, array_to_options } from "../../../utils";
import { postalCode } from "../../questions/postalCode";
import { Expression, SurveySingleItem } from "survey-engine/data_types";
import { ComponentGenerators } from "case-editor-tools/surveys/utils/componentGenerators";

import ResponseEncoding from "./responses";
import { text_how_answer, text_why_asking } from "../../../../common/studies/common/questionPools";

export class SurveyPrelude extends ItemQuestion {
    
    constructor(props: ItemProps) {
        super(props, 'prelude');
    }

    buildItem(): SurveySingleItem {
        return SurveyItems.display({
            parentKey: this.parentKey,
            itemKey: this.itemKey,
            content: [
                markdownComponent({
                    key: 'prelude',
                    content: _T("intake.prelude", "intake survey prelude text in markdown")
                })
            ]
        });
    }
}

export class UnsupervisedMinorWarning extends ItemQuestion {
    
    constructor(props: ItemProps) {
        super(props, 'N2');
    }

    buildItem(): SurveySingleItem {
        return SurveyItems.display({
            parentKey: this.parentKey,
            condition: this.condition,
            itemKey: this.itemKey,
            content: [
                textComponent({
                    key: 'N2',
                    content: _T("intake.unsupervised.minor", "Minor people must use supervised")
                })
            ]
        });
    }
}


export class PeopleAtRisk extends pool.intake.PeopleAtRisk {

    getHelpGroupContent(){
        return undefined;
    }
}

export class SurveyImpersonateResponse extends ItemQuestion {
    
    constructor(props: ItemProps) {
        super(props, 'impersonate');
    }

    buildItem(): SurveySingleItem {
        return SurveyItems.display({
            condition: this.condition,
            parentKey: this.parentKey,
            itemKey: this.itemKey,
            content: [
                transTextComponent("vaccination.impersonate", "Please fill this form as if you were the person your are filling it for")
            ]
        });
    }
}
export class FillingForWhom extends BaseChoiceQuestion {

    readonly codes = ResponseEncoding.for_whom;

    constructor(props: ItemProps) {
        super(props, 'Q0', 'single');
        this.options = {
            questionText: _T("intake.Q0.text", "For whom do you want to fill this survey"),
        }
    }

    createConditionLegalRepresentative(): Expression {
        return client.singleChoice.any(this.key, this.codes.representative);
    }
    
    createConditionHousehold(): Expression {
        return client.singleChoice.any(this.key, this.codes.household);
    }

    createConditionMyself(): Expression {
        return client.singleChoice.any(this.key, this.codes.myself);
    }

    createConditionSomeoneElse(): Expression {
        return client.singleChoice.any(this.key, this.codes.someone);
    }

    getResponses() {
            return  [
                as_option(this.codes.myself, _T("intake.Q0.option.0", "Myself")),
                as_option(this.codes.representative, _T("intake.Q0.option.3", "For a person under 18 years-old for whom I'm the legal representative")),
                as_option(this.codes.household, _T("intake.Q0.option.1","A member of my household")),
                as_option(this.codes.someone, _T("intake.Q0.option.2","Someone else")),
            ];        
    }  
    
    getHelpGroupContent() {
        return undefined;
    }
}

export class FillingForWhomLegalRepresentative extends BaseChoiceQuestion {

    readonly codes = {
        'yes': '1',
        'no': '0'
    } as const;


    constructor(props: ItemProps) {
        super(props, 'Q23', 'single');
        this.options = {
            questionText: _T("intake.Q23.text", "Q23.text"),
        }
    }
    
    getResponses() {
            return  [
                as_option(this.codes.no, _T("intake.Q23.option.0", "No")),
                as_option(this.codes.yes, _T("intake.Q23.option.1", "Yes")),
            ];        
    }  
    
    createYesCondition(): Expression {
        return client.singleChoice.any(this.key, this.codes.yes);
    }

    createNoCondition(): Expression {
        return client.singleChoice.any(this.key, this.codes.no);
    }


    getHelpGroupContent() {
        return undefined;
    }
}

export class NotPossibleToContinue extends BaseChoiceQuestion {
    constructor(props: ItemProps) {
        super(props, 'QEnd', 'single');
        this.options = {
            questionText: _T("intake.QEnd.text", "It's not possible to continue this survey"),
            customValidations: [
                {
                    key:'v1',
                    type:"hard",
                    rule: client.compare.eq(0, 1)
                }
            ]
        };
    }

    getResponses(): OptionDef[] {
        return [
            as_option("0", _T("intake.QEnd.option", ""))
        ];
    }
}

export class FillingForWhomHousold extends BaseChoiceQuestion {

    readonly codes = {
        'yes': '1',
        'no': '0'
    } as const;

    constructor(props: ItemProps) {
        super(props, 'Q22', 'single');
        this.options = {
            questionText: _T("intake.Q22.text", "Q22.text"),
        }
    }

    createYesCondition(): Expression {
        return client.singleChoice.any(this.key, this.codes.yes);
    }

    createNoCondition(): Expression {
        return client.singleChoice.any(this.key, this.codes.no);
    }

    
    getResponses() {
            return  [
                as_option(this.codes.no,  _T("intake.Q22.option.0", "No")),
                as_option(this.codes.yes, _T("intake.Q22.option.1", "Yes")),
            ];        
    }
    
    getHelpGroupContent() {
        return undefined;
    }
}


export class PostalCode extends ItemQuestion {

    constructor(props: ItemProps) {
        super(props, 'Q3');
    }

    getHelpGroupContent() {
        return [
            pool.text_why_asking( "intake.Q3.helpGroup.text.0"),
            {
                content: _T("intake.Q3.helpGroup.text.1", "In order to verify the representativeness of our cohort (the group of participants in this study), and to examine the geographical differences in the spread of the coronavirus and influenza."),
                style: [{ key: 'variant', value: 'p' }],
            },
            pool.text_how_answer("intake.Q3.helpGroup.text.2"),
            {
                content: _T("intake.Q3.helpGroup.text.3", "Insert the postal code of your place of residence"),
            },
        ];
    }

    buildItem() {

        return postalCode({
            parentKey: this.parentKey,
            responseKey: '0',
            itemKey: this.itemKey,
            isRequired: this.isRequired,
            condition: this.condition,
            questionText: _T("intake.Q3.title.0", "What is your home postal code?"),
            helpGroupContent: this.getHelpGroupContent(),
        });

        /*
        bottomDisplayCompoments: [
                {
                    role: 'error',
                    content: generateLocStrings(_T("intake.Q3.error.3", "Please enter the digits of your postal code")),
                    displayCondition: expWithArgs('not', expWithArgs('getSurveyItemValidation', 'this', 'r2'))
                },
                {
                    role: 'error',
                    content: generateLocStrings(_T("intake.Q3.error.4", "Please enter at most 5 digits")),
                    displayCondition: expWithArgs('not', expWithArgs('getSurveyItemValidation', 'this', 'r2max'))
                }
            ]
        */
    }

}

export const working_mainactivity_condition = (item: Item) => {
    const codes = ResponseEncoding.main_activity;
    return client.singleChoice.any(item.key,
        codes.fulltime, codes.partial, codes.self, codes.student 
    );
}

export class PostalCodeWork extends BaseChoiceQuestion {
    
    constructor(props: ItemProps) {
        super(props, 'Q4b', 'single');
        this.options = {
            questionText: _T("intake.Q4b.title.0", "What is the postal code of your school/college/workplace (where you spend the majority of your working/studying time)?"),
        };
    }

    getResponses() {
        return [
            {
                key: '0', role: 'option',
                content: _T("intake.Q4b.option.0", "I know this postal code")
            },
            {
                key: '1', role: 'option',
                content: _T("intake.Q4b.rg.scg.option.1", "I don’t know/can’t remember")
            },
            {
                key: '2', role: 'option',
                content: _T("intake.Q4b.rg.scg.option.2", "Not applicable (e.g. don’t have a fixed workplace)")
            },
        ];
    }

    hasPostalCodeCondition() {
        return this.createConditionFrom(['0']);
    }

    getHelpGroupContent() {
        return [
            pool.text_why_asking("intake.Q4b.helpGroup.text.0"),
            {
                content: _T("intake.Q4b.helpGroup.text.1", "To be able to determine the distance you regularly travel during your movements."),
            },
        ]
    }
}

export class PostalCodeWorkLocation extends ItemQuestion {

    constructor(props: ItemProps, postal: PostalCodeWork) {
        super(props, 'Q4b_0');
        this.condition = postal.hasPostalCodeCondition();
    }

    buildItem() {
        return postalCode({
            parentKey: this.parentKey,
            responseKey: '0',
            itemKey: this.itemKey,
            isRequired: this.isRequired,
            condition: this.condition,
            questionText: _T("intake.Q4b_0.text", "Select the postal code of your homework or study location"),
           // helpGroupContent: this.getHelpGroupContent(),
        });
    }

}
export class HighestEducation extends ItemQuestion {

    constructor(props: ItemProps) {
        super(props, 'Q4dfr');
    }

    buildItem() {

        return SurveyItems.singleChoice({
            parentKey: this.parentKey,
            itemKey: this.itemKey,
            isRequired: this.isRequired,
            condition: this.condition,
            questionText: _T("intake.Q4d.title.0", "What is the highest level of formal education/qualification that you have?"),
            helpGroupContent: this.getHelpGroupContent(),
            responseOptions: this.getResponses()
        });
    }

    getResponses(): OptionDef[] {
       return [
            {
                key: '0', role: 'option',
                content: _T("intake.Q4d.rg.mcg.option.0", "I have no formal qualification")
            },
            {
                key: '1', role: 'option',
                content: _T("intake.Q4d.rg.mcg.option.1", "GCSE's, levels, CSEs or equivalent")
            },
            {
                key: '2', role: 'option',
                content: _T("intake.Q4d.rg.mcg.option.2", "A-levels or equivalent (e.g. Higher, NVQ Level3, BTEC)")
            },
            {
                key: '3', role: 'option',
                content: _T("intake.Q4d.rg.mcg.option.3", "Bachelors Degree (BA, BSc) or equivalent")
            },
            {
                key: '4', role: 'option',
                content: _T("intake.Q4d.rg.mcg.option.4", "Higher Degree or equivalent (e.g. Masters Degree, PGCE, PhD, Medical Doctorate, Advanced Professional Award)")
            },
        ];
    }

    getHelpGroupContent() {
        return [
            text_why_asking( "intake.Q4d.helpGroup.text.0"),
            {
                content: _T("intake.Q4d.helpGroup.text.1", "To check how representative our sample is compared to the population of the UK (Italy, Belgium..) as a whole."),
                style: [{ key: 'variant', value: 'p' }],
            },
            text_how_answer("intake.Q4d.helpGroup.text.2"),
            {
                content: _T(
                    "intake.Q4d.helpGroup.text.3",
                    "Please choose the box that represents your HIGHEST level of educational achievements. The different option rougly equate to: 1 - no qualifications, 2 - school-leaving exams at around 16 years of age, 3 - school-leaving exams at around 18 years of age, 4 - University degree or equivalent professional qualification, 5 - Higher degree or advanced professional qualification. If you are an adult who is currently undergoing part - time training(e.g.night school) then tick the box that represents your current highest level of education."),
            },
        ];
    }
}




export class PeopleMet extends pool.intake.PeopleMet {

    getResponses(): OptionDef[] {
        const options = super.getResponses();

        const list = new OptionList(options);

        const o_5 = as_option('5', _T("intake.Q5.option.5", "Between 1 to 9 children in the same day (not counting your own children)"));

        o_5.disabled = this.getExclusiveNoneCondition();

        list.insertAfterKey('0', o_5);

        return list.values();
    }
}


export class BodyHeight extends ItemQuestion {

    constructor(props:ItemProps) {
        super(props, 'Q19');
    }

    buildItem() {
        return SurveyItems.numericInput({
            parentKey: this.parentKey,
            itemKey: this.itemKey,
            isRequired: this.isRequired,
            condition: this.condition,
            questionText: _T("intake.Q19.text", "What is your body height (in centimeter)"),
            helpGroupContent: this.getHelpGroupContent(),
            inputLabel: _T("intake.Q19.inputlabel","Your height"),
            componentProperties: {
                min: 60,
                max: 280, // Taller known human 272 cm (1918)
            } 
        });
    }

    getHelpGroupContent() {
        return [
                pool.text_why_asking("intake.Q19.helpGroup.why_asking"),
                {
                    content: _T("intake.Q19.helpGroup.asking_reason", "To know your body mass index"),
                },
                pool.text_how_answer("intake.Q19.helpGroup.how_answer"),
                {
                    content: _T("intake.Q19.helpGroup.answer_tip", "Enter your approximative height in cm"),
                }
        ];
    }

}

export class BodyWeight extends ItemQuestion {

    constructor(props: ItemProps) {
        super(props,'Q20');
    }

    
    buildItem() {
        return SurveyItems.numericInput({
            parentKey: this.parentKey,
            itemKey: this.itemKey,
            isRequired: this.isRequired,
            condition: this.condition,
            questionText: _T("intake.Q20.text" ,"What is your body weight"),
            helpGroupContent: this.getHelpGroupContent(),
            inputLabel: _T("intake.Q20.inputlabel", "Your weight"),
            componentProperties: {
                min: 1,
                max: 500, 
            } 
        });
    }

    getHelpGroupContent() {
        return [
                pool.text_why_asking("intake.Q20.helpGroup.why_asking"),
                {
                    content: _T("intake.Q20.helpGroup.asking_reason", "To know your BMI")
                },
                pool.text_how_answer("intake.Q20.helpGroup.how_answer"),
                {
                    content: _T("intake.Q20.helpGroup.answer_tip", "Enter you weight in Kg")
                }
        ];
    }

}

export class HealthProfessional extends BaseChoiceQuestion {

    constructor(props:ItemProps) {
        super(props,'Q4e', 'single');
        this.options = {
            questionText: french("Exercez-vous actuellement en tant que professionnel de santé humaine ou animale ?", "intake.Q4e.text", "Are you working in the domain of human or animal health"),
        };
    }

    getResponses() {
        const codes = ResponseEncoding.health_prof;
        return [
            as_option(codes.no, french("Non", "intake.Q4e.option.no", "No") ),
            as_option(codes.yes_human, french("Oui, j’exerce en tant que professionnel de la santé humaine", "intake.Q4f.option.human", "Human health prof")),
            as_option(codes.yes_animal,french( "Yes, j'exerce en tant que professionnel de la santé animale", "intake.Q4f.option.animal", "Animal health prof"))
        ];
    }

    isHumanHealthProfessionalCondition(): Expression {
        const codes = ResponseEncoding.health_prof;
        return client.singleChoice.any(this.key, codes.yes_human ); 
    }

    /*
    getHelpGroupContent() {
        return [
            pool.text_why_asking("intake.Q20.helpGroup.why_asking"),
            {
                content: ""),
            },
            pool.text_how_answer("intake.Q20.helpGroup.how_answer"),
            {
                content: "Indiquez votre poids actuel approximatif en kilogrammes, sans virgule.")
            }
        ];
    }
    */

}

export class HealthProfessionalType extends BaseChoiceQuestion {

    constructor(props:ItemProps) {
        super(props, 'Q4f', 'single');
        this.options = {
            questionText:french( "Exercez-vous actuellement en tant que professionnel de santé humaine ou animale ?", "intake.Q4f.text", "Are you working in the domain of human or animal health"),
        }
    }

    getResponses():OptionDef[] {
        const dict = {
            "1": {
                "en": "Nurse",
                "fr": "Infirmier"
            },
            "2": {
                "en": "General practitioner",
                "fr": "Médecin généraliste"
            },
            "3": {
                "en": "Other physician (specialist)",
                "fr": "Médecin (autre spécialité)"
            },
            "4": {
                "en": "Physiotherapist",
                "fr": "Masseur-kinésithérapeute"
            },
            "5": {
                "en": "Pharmacist",
                "fr": "Pharmacien"
            },
            "6": {
                "en": "Dental surgeon",
                "fr": "Chirurgien-dentiste"
            },
            "7": {
                "en": "Optician",
                "fr": "Opticien-lunetier"
            },
            "8": {
                "en": "Technician specialized in electro-radiology",
                "fr": "Manipulateur ERM"
            },
            "9": {
                "en": "Speech pathologist",
                "fr": "Orthophoniste"
            },
            "10": {
                "en": "Midwife",
                "fr": "Sage-femme"
            },
            "11": {
                "en": "Chiropodist, podiatrist",
                "fr": "Pédicure-podologue"
            },
            "12": {
                "en": "Psycho-motor therapist",
                "fr": "Psychomotricien"
            },
            "13": {
                "en": "Occupational therapist",
                "fr": "Ergothérapeute"
            },
            "14": {
                "en": "Orthoptist",
                "fr": "Orthoptiste"
            },
            "15": {
                "en": "Hearing care professional",
                "fr": "Audioprothésiste"
            }
        };
        
        const responses = dict_to_response(dict);
        
        const r = as_input_option("16", _T("intake.Q4f.option.other.label", "Other (specify)", "common.other_specify"))
        
        responses.push(r);

        return responses;
    }
   
}

export class HealthProfessionalPractice extends BaseChoiceQuestion {

    constructor(props:ItemProps) {
        super(props, 'Q4g', 'single');
        this.options = {
            questionText: french("Dans quelle structure exercez-vous ?", "intake.Q4g.text", "In which kind of practice"),
        }
    }

    getResponses() {
       const dict = {
        "1": {
            "en": "Physician office",
            "fr": "Cabinet libéral, maison de santé"
        },
        "2": {
            "en": "Health center",
            "fr": "Centre de santé public ou privé"
        },
        "3": {
            "en": "Public or private hospital",
            "fr": "Structure hospitalière publique ou privée"
        },
        "4": {
            "en": "Residential long-term care facility for elderlies",
            "fr": "EHPAD"
        },
        "5": {
            "en": "Other nursing and residential care facility",
            "fr": "Etablissements de soins de suite et de réadaptation, établissements de soins de longue durée"
        },
        "6": {
            "en": "Industry",
            "fr": "Dans le secteur industriel (laboratoire pharmaceutique, société produisant des produits de santé…)"
        },
       };

       const responses = dict_to_response(dict);
       responses.push(as_input_option("7", _T("intake.Q4g.option.other.label", "Other (specify)", "common.other_specify")))

       return responses;
    }

}

export class Smoking extends pool.intake.Smoking implements OverridenResponses {

    getResponses(): OptionDef[] {

        const oo =  [
            ["0", "No"],
            ["5", "No, I stopped smoking more than one year ago"],
            ["6", "No, I stopped smoking less than one year ago"],
            ["1","Yes, occasionally"],
            ["2", "Yes, daily, fewer than 10 times a day"],
            ["3","Yes, daily, 10 or more times a day"],
            ["4", "Dont know\/would rather not answer"]
        ];

       return array_to_options(oo, "intake.Q13.option.");
    }

    getResponseOverrides(): ResponseOveriddes {
        const o : ResponseOveriddes = {};
        const r = ResponseEncoding.smoking;
        o[r.no] = ['5','6'];
        return o;
    }
}

export class GastroEnteritisFrequency extends BaseChoiceQuestion {

    constructor(props:ItemProps) {
        super(props, 'Q34', 'single');
        this.options =  {
            questionText: _T("intake.Q34.text", "How often do you have gastro-enteritis")
        }
    }

    getResponses() {
        const oo =  [
            ["0", "Almost never"],
            ["6", "Sometimes, not every year"],
            ["1", "One to two times a year"],
            ["2",  "3 to 5 times a year"],
            ["3", "6 to 10 times a year"],
            ["4", "More than 10 times a year"],
            ["5", "I dont know"],
        ];
        return array_to_options(oo, "intake.Q34.option.");
    }
}
export class CommonColdFrequency extends pool.intake.CommonColdFrequency implements OverridenResponses {

    getResponses(): OptionDef[] {

       const codes = ResponseEncoding.cold_frequency;

        const responses = super.getResponses();

        const list = new OptionList(responses);

        list.insertAfterKey(codes.never, as_option(codes.sometimes,  _T("intake.Q8.option.6", "Sometimes, not every year")));

        return list.values();
    }

    getResponseOverrides():ResponseOveriddes {
        const o : ResponseOveriddes = {};

        const codes = ResponseEncoding.cold_frequency;

        o[codes.never] = [codes.never, codes.sometimes];

        return o;
    }

}

/**
 * Find out about Platform: multiple choice question about where the participant found out about the platform
 */
 export class FindOutAboutPlatform extends pool.intake.FindOutAboutPlatform implements OverridenResponses {

   getReponses(): OptionDef[] {

       const codes = ResponseEncoding.find_about;

       return [
                as_option( codes.radio , _T("intake.Q17.rg.mcg.option.0", "Radio or television")), // 0
                as_option( codes.newspaper,  _T("intake.Q17.rg.mcg.option.1", "In the newspaper or in a magazine")), // 1
               
                as_option( codes.webinstit,  _T("intake.Q17.option.site_official", "Using an official website (public health agency, ...)")),
               
                as_option( codes.webinfo,  _T("intake.Q17.option.site_news", "Using an news website")),
               
                as_option( codes.webhealth, _T("intake.Q17.option.webhealth", "Using an health related information website")),
              
                as_option( '11', _T("intake.Q17.option.email", "By an email")),

                as_option(codes.social, _T("intake.Q17.option.social", "Via a social network")),
            
               // as_option( '2', _T("intake.Q17.rg.mcg.option.2", "The internet (a website, link, a search engine)")),
                as_option( codes.poster, _T("intake.Q17.rg.mcg.option.3", "By poster")),
                as_option( codes.family,  _T("intake.Q17.rg.mcg.option.4", "Via family or friends")),
                as_option( codes.work, _T("intake.Q17.rg.mcg.option.5", "Via school or work")),
                as_option( codes.healthworker, _T("intake.Q17.option.healtworker","By an health worker")),
                as_option( codes.project,  _T("intake.Q17.option.project", "By a relative working on the project")),
                as_input_option(codes.other_alt, _T("intake.Q17.rg.mcg.option.6", "Other"))
            ];
        }

    getResponseOverrides():ResponseOveriddes {
        const codes = ResponseEncoding.find_about;

        const o : ResponseOveriddes = {};

        o[codes.internet] = [codes.webhealth, codes.webinfo, codes.webinstit, codes.social];
        o[codes.other] = [codes.other_alt, codes.project, codes.healthworker, '11'];
        return o;
    }
}

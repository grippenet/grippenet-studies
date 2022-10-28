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

import {  questionPools as pool, _T, responses as common_responses, ItemQuestion, ItemProps, SingleItemDependency, BaseChoiceQuestion, BaseQuestionOptions } from "../../../common"
import { Item, OptionDef } from "case-editor-tools/surveys/types";
import { SurveyItems } from 'case-editor-tools/surveys';

import { french, dict_to_response, as_option, as_input_option, OverridenResponses, ResponseOveriddes, OptionList } from "../../../utils";
import { postalCode } from "../../questions/postalCode";
import { Expression } from "survey-engine/data_types";
import { ClientExpression as client } from "../../../common";

const ResponseEncoding = {
    health_prof: {
        no: "0",
        yes_human: "1",
        yes_animal: "2"
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
    const codes = common_responses.intake.main_activity;
    return new SingleItemDependency({
        item: item,
        type: 'single',
        responses: [codes.fulltime, codes.partial, codes.self, codes.student ] 
    });
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
                content: french("Je connais ce code postal")
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
            questionText: french("Selectionnez la commune de votre lieu de travail ou d'étude"),
           // helpGroupContent: this.getHelpGroupContent(),
        });
    }

}

export class PeopleMet extends pool.intake.PeopleMet {

    getResponses(): OptionDef[] {
        const options = super.getResponses();

        const list = new OptionList(options);

        const o_5 = as_option('5', french("Entre 1 et 9 enfants ou adolescents dans la même journée (en ne comptant pas vos propres enfants) "));

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
            questionText: french("Quelle est votre taille (en centimètres)?"),
            helpGroupContent: this.getHelpGroupContent(),
            inputLabel: french("Votre taille"),
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
            questionText: french("Quelle est votre poids (en kilogrammes)?"),
            helpGroupContent: this.getHelpGroupContent(),
            inputLabel: french("Votre poids"),
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
                    content: french("Pour savoir si votre indice de masse corporelle est supérieur à 40, et si vous faites donc partie d’une catégorie de personnes ciblées par les recommandations vaccinales."),
                },
                pool.text_how_answer("intake.Q20.helpGroup.how_answer"),
                {
                    content: french("Indiquez votre poids actuel approximatif en kilogrammes, sans virgule.")
                }
        ];
    }

}

export class HealthProfessional extends BaseChoiceQuestion {

    constructor(props:ItemProps) {
        super(props,'Q4e', 'single');
        this.options = {
            questionText: french("Exercez-vous actuellement en tant que professionnel de santé humaine ou animale ?"),
        };
    }

    getResponses() {
        const codes = ResponseEncoding.health_prof;
        return [
            as_option(codes.no, french("Non") ),
            as_option(codes.yes_human, french("Oui, j’exerce en tant que professionnel de la santé humaine")),
            as_option(codes.yes_animal, french("Yes, j'exerce en tant que professionnel de la santé animale"))
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
                content: french(""),
            },
            pool.text_how_answer("intake.Q20.helpGroup.how_answer"),
            {
                content: french("Indiquez votre poids actuel approximatif en kilogrammes, sans virgule.")
            }
        ];
    }
    */

}

export class HealthProfessionalType extends BaseChoiceQuestion {

    constructor(props:ItemProps) {
        super(props, 'Q4f', 'single');
        this.options = {
            questionText: french("Exercez-vous actuellement en tant que professionnel de santé humaine ou animale ?"),
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
            questionText: french("Dans quelle structure exercez-vous ?"),
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

        const dict =  {
            "0": {
                "en": "No",
                "fr": "Non, je n'ai jamais fumé"
            },
            "5": {
                "en": "No, I stopped smoking more than one year ago",
                "fr": "Non, j’ai arrêté de fumer depuis plus d’un an"
            },
            "6": {
                "en": "No, I stopped smoking less than one year ago",
                "fr": "Non, j’ai arrêté de fumer depuis moins d’un an"
            },
            "1": {
                "en": "Yes, occasionally",
                "fr": "Oui, occasionnellement"
            },
            "2": {
                "en": "Yes, daily, fewer than 10 times a day",
                "fr": "Oui, tous les jours, moins de 10 fois par jour"
            },
            "3": {
                "en": "Yes, daily, 10 or more times a day",
                "fr": "Oui, tous les jours, 10 fois ou plus par jour"
            },
            "4": {
                "en": "Dont know\/would rather not answer",
                "fr": "Je ne sais pas \/ préfère ne pas répondre"
            }
        };

       return dict_to_response(dict);
    }

    getResponseOverrides(): ResponseOveriddes {
        const o : ResponseOveriddes = {};
        const r = common_responses.intake.smoking;
        o[r.no] = ['5','6'];
        return o;
    }
}

export class GastroEnteritisFrequency extends BaseChoiceQuestion {

    constructor(props:ItemProps) {
        super(props, 'Q34', 'single');
        this.options =  {
            questionText: french("A quelle fréquence avez vous une gastro-entértie?")
        }
    }

    getResponses() {
        return [
            as_option("0",french( "Presque jamais")),
            as_option("6", french("Parfois, pas tous les ans")),
            as_option("1", french("Une à deux fois par an")),
            as_option("2", french( "Entre 3 et 5 fois par an")),
            as_option("3", french("Entre 6 et 10 fois par an")),
            as_option("4", french( "Plus de 10 fois par an")),
            as_option("5", french("Je ne sais pas")),
        ];
    }
}

const common_cold_codes = {
    "sometimes": "6",
    ...common_responses.intake.cold_frequency
}

export class CommonColdFrequency extends pool.intake.CommonColdFrequency implements OverridenResponses {

    getResponses(): OptionDef[] {

       const codes = common_responses.intake.cold_frequency;

        const responses = super.getResponses();

        const list = new OptionList(responses);

        list.insertAfterKey(codes.never, as_option(common_cold_codes.sometimes, french("Parfois, pas tous les ans")));

        return list.values();
    }

    getResponseOverrides():ResponseOveriddes {
        const o : ResponseOveriddes = {};

        const codes = common_cold_codes;

        o[codes.never] = [codes.never, codes.sometimes];

        return o;
    }

}



/**
 * Find out about Platform: multiple choice question about where the participant found out about the platform
 */
 export class FindOutAboutPlatform extends pool.intake.FindOutAboutPlatform implements OverridenResponses {

   getReponses(): OptionDef[] {

       const codes = common_responses.intake.find_about;

       return [
                as_option( codes.radio , _T("intake.Q17.rg.mcg.option.0", "Radio or television")), // 0
                as_option( codes.newspaper,  _T("intake.Q17.rg.mcg.option.1", "In the newspaper or in a magazine")), // 1
               
                as_option( codes.webinstit,  _T("intake.Q17.option.site_official", "Using an official website (public health agency, ...)")),
               
                as_option( codes.webinfo,  _T("intake.Q17.option.site_news", "Using an news website")),
               
                as_option( codes.webhealth, _T("intake.Q17.option.webhealth", "Using an health related information website")),
              
                as_option( '11', french("Par un email")),

                as_option(codes.social, _T("intake.Q17.option.social", "Via a social network")),
            
               // as_option( '2', _T("intake.Q17.rg.mcg.option.2", "The internet (a website, link, a search engine)")),
                as_option( codes.poster, _T("intake.Q17.rg.mcg.option.3", "By poster")),
                as_option( codes.family,  _T("intake.Q17.rg.mcg.option.4", "Via family or friends")),
                as_option( codes.work, _T("intake.Q17.rg.mcg.option.5", "Via school or work")),
                as_option( codes.healthworker, french("Par un professionnel de santé")),
                as_option( codes.project, french("Par un de mes proches qui travaille sur le projet")),
                as_input_option(codes.other_alt, _T("intake.Q17.rg.mcg.option.6", "Other"))
            ];
        }

    getResponseOverrides():ResponseOveriddes {
        const codes = common_responses.intake.find_about;

        const o : ResponseOveriddes = {};

        o[codes.internet] = [codes.webhealth, codes.webinfo, codes.webinstit, codes.social];
        o[codes.other] = [codes.other_alt, codes.project, codes.healthworker, '11'];
        return o;
    }
}

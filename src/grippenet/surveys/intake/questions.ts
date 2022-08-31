// Q4e
// Q4f
// Q4g
// Q5 +Option5
// Q34
// Q13 +5, +6, no
// Q24 => Q26
// Q17 +8, +9, +10, +11 ....

import {  questionPools as pool, _T, responses as common_responses, questionPools,  } from "../../../common"
import { Item, OptionDef } from "case-editor-tools/surveys/types";
import { SurveyItems } from 'case-editor-tools/surveys';
import { StudyEngine as se } from "case-editor-tools/expression-utils/studyEngineExpressions";
import { french, dict_to_response, as_option, as_input_option, OverridenResponses, ResponseOveriddes } from "../utils";

type ItemProps = pool.ItemProps;
const singleChoicePrefix = pool.singleChoicePrefix;

const ResponseEncoding = {
    health_prof: {
        no: "0",
        yes_human: "1",
        yes_animal: "2"
    }
}


export class BodyHeight extends questionPools.ItemQuestion {

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
                    content: french("Pour savoir si votre indice de masse corporelle est supérieur à 40, et si vous faites donc partie d’une catégorie de personnes ciblées par les recommandations vaccinales."),
                },
                pool.text_how_answer("intake.Q19.helpGroup.how_answer"),
                {
                    content: french("Indiquez votre taille approximative en centimètres, sans virgule.")
                }
        ];
    }

}

export class BodyWeight extends questionPools.ItemQuestion {

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

export class HealthProfessional extends questionPools.ItemQuestion {

    constructor(props:ItemProps) {
        super(props,'Q4e');
    }

    buildItem() {
        return SurveyItems.singleChoice({
            parentKey: this.parentKey,
            itemKey: this.itemKey,
            isRequired: this.isRequired,
            condition: this.condition,
            questionText: french("Exercez-vous actuellement en tant que professionnel de santé humaine ou animale ?"),
            helpGroupContent: this.getHelpGroupContent(),
            responseOptions: this.getResponses()
        });
    }

    getResponses() {
        const codes = ResponseEncoding.health_prof;
        return [
            as_option(codes.no, french("Non") ),
            as_option(codes.yes_human, french("Oui, j’exerce en tant que professionnel de la santé humaine")),
            as_option(codes.yes_animal, french("Yes, I am practicing as an animal health professional"))
        ];
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

interface HealthProfessionalSubProps extends ItemProps {
    healthProfessional: HealthProfessional
}

abstract class HealthProfessionalSub extends questionPools.ItemQuestion {
    
    healthProKey: string;

    constructor(props:HealthProfessionalSubProps, defaultKey: string) {
        super(props, defaultKey);
        this.healthProKey = props.healthProfessional.key;
    }

    getCondition() {
        const codes = ResponseEncoding.health_prof;
        return se.responseHasKeysAny(this.healthProKey, singleChoicePrefix, codes.yes_human );
    }
}

export class HealthProfessionalType extends HealthProfessionalSub {

    constructor(props:HealthProfessionalSubProps) {
        super(props, 'Q4f');
    }

    buildItem() {
        return SurveyItems.singleChoice({
            parentKey: this.parentKey,
            itemKey: this.itemKey,
            isRequired: this.isRequired,
            condition: this.condition,
            questionText: french("Exercez-vous actuellement en tant que professionnel de santé humaine ou animale ?"),
          //  helpGroupContent: this.getHelpGroupContent(),
            responseOptions: this.getResponses()
        });
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

export class HealthProfessionalPractice extends HealthProfessionalSub {

    constructor(props:HealthProfessionalSubProps) {
        super(props, 'Q4g');
    }

    buildItem() {
        return SurveyItems.singleChoice({
            parentKey: this.parentKey,
            itemKey: this.itemKey,
            isRequired: this.isRequired,
            condition: this.condition,
            questionText: french("Dans quelle structure exercez-vous ?"),
            //helpGroupContent: this.getHelpGroupContent(),
            responseOptions: this.getResponses()
        });
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

export class GastroEnteritisFrequency extends questionPools.ItemQuestion {

    constructor(props:ItemProps) {
        super(props, 'Q34');
    }

    buildItem() {
        return SurveyItems.singleChoice({
            parentKey: this.parentKey,
            itemKey: this.itemKey,
            isRequired: this.isRequired,
            condition: this.condition,
            questionText: french("Exercez-vous actuellement en tant que professionnel de santé humaine ou animale ?"),
            //helpGroupContent: this.getHelpGroupContent(),
            responseOptions: this.getResponses()
        });
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
                as_option( codes.poster, french("Par un de mes proches qui travaille sur le projet")),
                as_option( codes.other_alt, _T("intake.Q17.rg.mcg.option.6", "Other")),
            ]
        }

    getResponseOverrides():ResponseOveriddes {
        const codes = common_responses.intake.find_about;

        const o : ResponseOveriddes = {};

        o[codes.internet] = [codes.webhealth, codes.webinfo, codes.webinstit, codes.social];
        o[codes.other] = [codes.other_alt, codes.project, codes.healthworker, '11'];
        return o;
    }
}

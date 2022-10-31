import {  questionPools, _T, responses as common_responses, LanguageMap, ItemProps, ItemQuestion, BaseChoiceQuestion, GroupQuestion, GroupProps, ClientExpression as client } from "../../../common"
import {  Expression, ItemComponent, SurveySingleItem } from "survey-engine/data_types";
import { OptionDef } from "case-editor-tools/surveys/types";
import { SurveyItems } from 'case-editor-tools/surveys';
import { as_input_option, as_option, french, OptionList } from "../../../utils";
import { text_select_all_apply } from "../../../../common/studies/common/questionPools";
import { matrixKey, responseGroupKey } from "case-editor-tools/constants/key-definitions";

const MultipleChoicePrefix = questionPools.MultipleChoicePrefix;

// [X] Q16
// [ ] Q7 
// [ ] Q7b
// [ ] +Q9d
// [ ] Qcov7 4a=>4, 4b=>17, 18=>, 12=>()
// [ ] Q11 => +7, +8
// [ ] +Q17

interface SymptomDependentProps extends ItemProps {
    SymptomQuestion: questionPools.weekly.Symptoms
}

export class StoolCount extends BaseChoiceQuestion {

    constructor(props: SymptomDependentProps) {
        super(props, 'Q16', 'single');
        this.condition = props.SymptomQuestion.createSymptomCondition('diarrhea');
        this.options = {
            questionText: french("Combien de selles par jour avez-vous ?"),
        }
    }
    
    getResponses() {
            return  [
               as_option("0", french("Moins de 3")),
               as_option("1", french("Plus de 3"))
            ];
    }
    
    getHelpGroupContent() {
        return undefined;
    }
}


export class VisitedMedicalService extends questionPools.weekly.VisitedMedicalService {

    getResponses() {
        
            const codes = common_responses.weekly.visit_medical;
    
            // All response except no
            const exclusiveNo = client.responseHasOnlyKeysOtherThan(this.key, MultipleChoicePrefix, codes.no);
    
            // All response except planned visit
            const exclusivePlan = client.responseHasOnlyKeysOtherThan(this.key, MultipleChoicePrefix, codes.plan);
    
            const exclusiveOther = client.multipleChoice.any(this.key, codes.no, codes.plan);
    
            return [
                {
                    key: codes.no, role: 'option',
                    disabled: exclusiveNo,
                    content: _T("weekly.EX.Q7.rg.mcg.option.0", "No")
                },
                {
                    key: codes.plan, role: 'option',
                    disabled: exclusivePlan,
                    content: _T("weekly.EX.Q7.rg.mcg.option.5", "No, but I have an appointment scheduled")
                },
                {
                    key: codes.gp, role: 'option',
                    disabled: exclusiveOther,
                    content: _T("weekly.EX.Q7.rg.mcg.option.1", "GP or GP's practice nurse")
                },
                {
                    key: '6', role: 'option',
                    disabled: exclusiveOther,
                    content: french("Autre médecin de ville (pédiatre, ORL, cardiologue…)")
                },
                {
                    key: '9', role: 'option',
                    disabled: exclusiveOther,
                    content: french("Gynécologue\/obstétricien")
                },
                {
                    key: '10', role: 'option',
                    disabled: exclusiveOther,
                    content: french("Sage-femme")
                },
                {
                    key: '7', role: 'option',
                    disabled: exclusiveOther,
                    content: french("Pharmacien")
                },
                {
                    key: '8', role: 'option',
                    disabled: exclusiveOther,
                    content: french("Infirmier scolaire")
                },
                {
                    key: codes.emergency, role: 'option',
                    disabled: exclusiveOther,
                    content: _T("weekly.EX.Q7.rg.mcg.option.3", "Hospital accident & emergency department / out of hours service")
                },
                {
                    key: codes.other, role: 'option',
                    disabled: exclusiveOther,
                    content: _T("weekly.EX.Q7.rg.mcg.option.4", "Other medical services")
                },
                {
                    key: codes.hospital, role: 'option',
                    disabled: exclusiveOther,
                    content: _T("weekly.EX.Q7.rg.mcg.option.2", "Hospital admission")
                },
                
            ];
        }
}

interface AntibioticFromProps extends ItemProps {
    medicationQuestion: questionPools.weekly.TookMedication
}
export class AntibioticFrom extends BaseChoiceQuestion {

    constructor(props: AntibioticFromProps) {
        super(props, 'Q9d', 'single');
        this.condition = props.medicationQuestion.createTookAntibioticCondition();
        this.options = {
            questionText: french("Concernant les antibiotiques que vous avez pris :"),
        };
    }

    getResponses() {
        return  [
            as_option("0", french("Ils viennent de vous être prescrits par un médecin pour les symptômes que vous rapportez aujourd'hui")),
            as_option("1", french("Vous les aviez déjà chez vous"))
        ];
    }
    
}

export class CovidHabitsChange extends questionPools.weekly.CovidHabitsChange {

    getOptionItems(): Map<string, LanguageMap>  {

        const codes = common_responses.weekly.covid_habits;

        return new Map([
            [codes.wash_hands,  _T("weekly.EX.Qcov7.rg.v1C0.text.1", 'Regularly wash or disinfect hands') ],
            [codes.cough_elbow, _T("weekly.EX.Qcov7.rg.nEMR.text.3", 'Cough or sneeze into your elbow') ],
            [codes.use_tissue, _T("weekly.EX.Qcov7.rg.oTIp.text.5", 'Use a disposable tissue')],
            
            [codes.wear_mask_french, _T("weekly.EX.Qcov7.rg.vHvi.text.9", "Wear a face mask outdoors")],

            [codes.wear_mask_home_french, _T("weekly.EX.Qcov7.rg.7w6F.text.7", "Wear a face mask indoors")],
            
            [codes.avoid_shakehands, _T("weekly.EX.Qcov7.rg.ocTu.text.11", "Avoid shaking hands")],

            [codes.stop_hug, _T("weekly.EX.Qcov7.rg.ioJs.text.13", "Stop greeting by hugging and/or kissing on both cheeks")],

            [codes.public_transport, _T("weekly.EX.Qcov7.rg.ujsK.text.15", "Limit your use of public transport")],

            [codes.avoid_gathering, _T("weekly.EX.Qcov7.rg.Ijdr.text.17", "Avoid busy places and gatherings (supermarket, cinema, stadium)")],

            [codes.stay_home ,_T("weekly.EX.Qcov7.rg.t8MS.text.19", "Stay at home")],
 
            [codes.telework, _T("weekly.EX.Qcov7.rg.z4bE.text.21", "Telework or increase your number of telework days")],

            [codes.avoid_travel, _T("weekly.EX.Qcov7.rg.Koue.text.23", "Avoid travel outside your own country or region")],

            [codes.food_delivered, _T("weekly.EX.Qcov7.rg.zuDa.text.25", "Have your food/shopping delivered by a store or a friend/family member")],

            [codes.isolate_home, _T("weekly.EX.Qcov7.rg.isolate_at_home", "Isolate from people living in your home")],

            [codes.avoid_friends, _T("weekly.EX.Qcov7.rg.QSBP.text.27", "Avoid seeing friends and family")],

            [codes.avoid_at_risk, _T("weekly.EX.Qcov7.rg.fRla.text.29", "Avoid being in contact with people over 65 years old or with a chronic disease")],

            [codes.avoid_children,_T("weekly.EX.Qcov7.rg.h3fK.text.31", "Avoid being in contact with children")],
        ]
       );
    }   

    createWearMaskCondition(): Expression {
        const codes = common_responses.weekly.covid_habits;
        const scale_codes = questionPools.weekly.CovidHabitsChange.likertScaleCodes;
        
        return client.logic.or(
            client.responseHasKeysAny(this.key, [responseGroupKey, this.getLikertRowKey(codes.wear_mask_french)].join('.'), scale_codes.yes_more, scale_codes.yes_already ),
            client.responseHasKeysAny(this.key, [responseGroupKey, this.getLikertRowKey(codes.wear_mask_home_french)].join('.'), scale_codes.yes_more, scale_codes.yes_already ),
        )
    }
}

export class CauseOfSymptoms extends questionPools.weekly.CauseOfSymptoms {

    getResponses(): Array<OptionDef> {
    
        const list = new OptionList(super.getResponses());
        
        list.insertAfterKey('9',  as_option("7", french("Mon médecin m'a dit qu'il s'agissait de la grippe")) );

        return list.values();
    }
}


export class HowDoYouFeel extends ItemQuestion {

    
    constructor(props:ItemProps) {
        super(props, 'Q9d');
    }

    buildItem(): SurveySingleItem {
        return SurveyItems.numericSlider({
            parentKey: this.parentKey,
            itemKey: this.itemKey,
            isRequired: this.isRequired,
            condition: this.condition,
            questionText:french("Globalement, comment vous sentez-vous ?"),
            sliderLabel: french(""),
            noResponseLabel: french("Pour répondre "),
            min: 0,
            max: 100,
            stepSize: 1
        });
    }

}

export class MaskGroup extends GroupQuestion {
    
    constructor(props: GroupProps) {
        super(props, 'mask');
    }
   
    buildGroup(): void {
    }

}

export class MaskWearingContext extends BaseChoiceQuestion {

    constructor(props: ItemProps) {
        super(props, 'QFRmask1', 'multiple');
        this.setOptions({
            questionText: french("Dans quelle(s) circonstance(s) avez-vous porté un masque ?"),
            topDisplayCompoments: [
                text_select_all_apply("weekly.Qmask1.select_all_apply"),
            ],
            helpGroupContent: [
            ]
        });
    }

    getResponses(): OptionDef[] {
        return [
            as_option("1", french("Chez vous pour ne pas contaminer votre entourage (enfants, parents, conjoint")),
            as_option("2", french("A l’extérieur (pour aller faire vos courses, voir des amis, dans les transports en commun, etc.) pour ne pas contaminer les autres")),
            as_option("3", french("Sur votre lieu de travail (ou d’étude)")),
            as_option("4", french("Lorsque vous avez été en contact avec une ou plusieurs personnes âgées de 65 ans et plus")),
            as_option("5", french("Lorsque vous avez été en contact avec une ou plusieurs personnes porteuses de pathologie(s) chronique(s) (asthme, diabète, maladie cardiaque, cancer, etc.)")),
            as_option("6", french("Lorsque vous avez rendu visite à une ou plusieurs personnes hospitalisées")),
            as_option("7", french("Lorsque vous avez été en contact avec un ou plusieurs jeunes enfants (moins de deux ans)")),
            as_option("8", french("Dans d’autres circonstances (précisez)")),
            as_option("99", french("Je ne sais pas  / je ne souhaite pas répondre")),
        ]
    }

}

export class MaskWearingAlways extends BaseChoiceQuestion {

    constructor(props: ItemProps) {
        super(props, 'QFRmask2', 'single');
        this.setOptions({
            questionText: french("Dans ces circonstances, avez-vous systématiquement porté un masque, tant que vous aviez des symptômes ?"),
            helpGroupContent: [
            ]
        });
    }

    getResponses(): OptionDef[] {
        return [
            as_option("1", french("Oui")),
            as_option("0", french("Non")),
            as_option("99", french("Je ne sais pas  / je ne souhaite pas répondre")),
        ]
    }

    createConditionNoUnknown() {
        return client.singleChoice.any(this.key, '0', '99');
    } 

    createConditionYes() {
        return client.singleChoice.any(this.key, '1');
    }

}

export class MaskNotWearingReason extends BaseChoiceQuestion {
    
    constructor(props: ItemProps) {
        super(props, 'QFRmask3', 'multiple');
        this.setOptions({
            questionText: french("pour quelle(s) raison(s) n’avez-vous pas systématiquement porté un masque, tant que vous aviez des symptômes ?"),
            topDisplayCompoments: [
                text_select_all_apply("weekly.Qmask3.select_all_apply"),
            ],
            helpGroupContent: [
            ]
        });
    }

    getResponses(): OptionDef[] {
        return [
            as_option("1", french("Chez vous pour ne pas contaminer votre entourage (enfants, parents, conjoint)")),
            as_option("2", french("Vous n’aviez pas suffisamment de masques")),
            as_option("3", french("Cela vous gênait pour respirer ou vous donnait une sensation désagréable (chaleur, humidité)")),
            as_option("4", french("Vous avez trouvé cela trop contraignant à utiliser")),
            as_option("5", french("A cause du regard des autres")),
            as_input_option("6", french("Pour une autre raison (précisez)")), 
            as_option("99", french("Je ne sais pas / je ne souhaite pas répondre")),
        ]
    }

}

export class MaskProvidedFrom extends BaseChoiceQuestion {
    
    constructor(props: ItemProps) {
        super(props, 'QFRmask4', 'multiple');
        this.setOptions({
            questionText: french("Où vous êtes-vous procuré ce ou ces masques ?"),
            topDisplayCompoments: [
                text_select_all_apply("weekly.Qmask4.select_all_apply"),
            ],
            helpGroupContent: [
            ]
        });
    }

    getResponses(): OptionDef[] {
        return [
            as_option("1", french("En pharmacie / parapharmacie")),
            as_option("2", french("Sur Internet")),
            as_option("3", french("Sur votre lieu de travail")),
            as_option("4", french("Votre médecin traitant vous en a donné")),
            as_input_option("5", french("Autre (précisez)")),
            as_option("99", french("Je ne sais pas / je ne souhaite pas répondre")),
        ];
    }

}

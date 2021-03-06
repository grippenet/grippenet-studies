import {  questionPools, _T, responses as common_responses, LanguageMap } from "../../../common"
import {  SurveySingleItem } from "survey-engine/data_types";
import { OptionDef } from "case-editor-tools/surveys/types";
import { SurveyItems } from 'case-editor-tools/surveys';
import { StudyEngine as se } from "case-editor-tools/expression-utils/studyEngineExpressions";
import { as_option, french, OptionList } from "../utils";
import { multipleChoiceKey } from "case-editor-tools/constants/key-definitions";

const MultipleChoicePrefix = questionPools.MultipleChoicePrefix;

// Q16
// Q7 
// Q7b
// +Q9d
// Qcov7 4a=>4, 4b=>17, 18=>, 12=>()
// Q11 => +7, +8
// +Q17

interface SymptomDependentProps extends questionPools.ItemProps {
    SymptomQuestion: questionPools.weekly.Symptoms
}

export class StoolCount extends questionPools.ItemQuestion {

    symptomsKey: string

    constructor(props: SymptomDependentProps) {
        super(props, 'Q16');
        this.symptomsKey = props.SymptomQuestion.key;
    }

    buildItem(): SurveySingleItem {
        return SurveyItems.singleChoice({
            parentKey: this.parentKey,
            itemKey: this.itemKey,
            isRequired: this.isRequired,
            condition: this.condition,
            questionText: french("Combien de selles par jour avez-vous ?"),
            helpGroupContent: this.getHelpGroupContent(),
            responseOptions: this.getResponses()
        });
    }
    
    getCondition() {
        const codes = common_responses.weekly.symptoms;
        return se.responseHasKeysAny(this.symptomsKey, MultipleChoicePrefix, codes.diarrhea);
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
            const exclusiveNo = se.responseHasOnlyKeysOtherThan(this.key, MultipleChoicePrefix, codes.no);
    
            // All response except planned visit
            const exclusivePlan = se.responseHasOnlyKeysOtherThan(this.key, MultipleChoicePrefix, codes.plan);
    
            const exclusiveOther = se.multipleChoice.any(this.key, codes.no, codes.plan);
    
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
                    content: french("Autre m??decin de ville (p??diatre, ORL, cardiologue???)")
                },
                {
                    key: '9', role: 'option',
                    disabled: exclusiveOther,
                    content: french("Gyn??cologue\/obst??tricien")
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

interface AntibioticFromProps extends questionPools.ItemProps {
    medicationQuestion: questionPools.weekly.TookMedication
}


export class AntibioticFrom extends questionPools.ItemQuestion {

    medicationKey: string

    constructor(props: AntibioticFromProps) {
        super(props, 'Q9d');
        this.medicationKey = props.medicationQuestion.key;
    }

    buildItem(): SurveySingleItem {
        return SurveyItems.singleChoice({
            parentKey: this.parentKey,
            itemKey: this.itemKey,
            isRequired: this.isRequired,
            condition: this.condition,
            questionText: french("Concernant les antibiotiques que vous avez pris :"),
            helpGroupContent: this.getHelpGroupContent(),
            responseOptions: this.getResponses()
        });
    }
    
    getCondition() {
        const codes = common_responses.weekly.took_medication;
        return se.responseHasKeysAny(this.medicationKey, multipleChoiceKey, codes.antibio);
    }

    getResponses() {
        return  [
            as_option("0", french("Ils viennent de vous ??tre prescrits par un m??decin pour les sympt??mes que vous rapportez aujourd'hui")),
            as_option("1", french("Vous les aviez d??j?? chez vous"))
        ];
    }
    
    getHelpGroupContent() {
            return undefined;
    }
}

export class CovidHabitsChange extends questionPools.weekly.CovidHabitsChange {

    getOptionItems(): Map<string, LanguageMap>  {
        return new Map([
            ['1',  _T("weekly.EX.Qcov7.rg.v1C0.text.1", 'Regularly wash or disinfect hands') ],
            ['2', _T("weekly.EX.Qcov7.rg.nEMR.text.3", 'Cough or sneeze into your elbow') ],
            ['3', _T("weekly.EX.Qcov7.rg.oTIp.text.5", 'Use a disposable tissue')],
            ['4', _T("weekly.EX.Qcov7.rg.vHvi.text.9", "Wear a face mask outdoors")],

            ['17', _T("weekly.EX.Qcov7.rg.7w6F.text.7", "Wear a face mask indoors")],
            
            ['5', _T("weekly.EX.Qcov7.rg.ocTu.text.11", "Avoid shaking hands")],

            ['11', _T("weekly.EX.Qcov7.rg.ioJs.text.13", "Stop greeting by hugging and/or kissing on both cheeks")],

            ['6', _T("weekly.EX.Qcov7.rg.ujsK.text.15", "Limit your use of public transport")],

            ['7', _T("weekly.EX.Qcov7.rg.Ijdr.text.17", "Avoid busy places and gatherings (supermarket, cinema, stadium)")],

            ['8' ,_T("weekly.EX.Qcov7.rg.t8MS.text.19", "Stay at home")],
 
            ['9', _T("weekly.EX.Qcov7.rg.z4bE.text.21", "Telework or increase your number of telework days")],

            ['10', _T("weekly.EX.Qcov7.rg.Koue.text.23", "Avoid travel outside your own country or region")],

            ['13', _T("weekly.EX.Qcov7.rg.zuDa.text.25", "Have your food/shopping delivered by a store or a friend/family member")],

            ['18', _T("weekly.EX.Qcov7.rg.isolate_at_home", "Isolate from people living in your home")],

            ['14', _T("weekly.EX.Qcov7.rg.QSBP.text.27", "Avoid seeing friends and family")],

            ['15', _T("weekly.EX.Qcov7.rg.fRla.text.29", "Avoid being in contact with people over 65 years old or with a chronic disease")],

            ['16',_T("weekly.EX.Qcov7.rg.h3fK.text.31", "Avoid being in contact with children")],
        ]
       );
    }   
}

export class CauseOfSymptoms extends questionPools.weekly.CauseOfSymptoms {

    getResponses(): Array<OptionDef> {
    
        const list = new OptionList(super.getResponses());
        
        list.insertAfterKey('9',  as_option("7", french("Mon m??decin m'a dit qu'il s'agissait de la grippe")) );

        return list.values();
    }
}


export class HowDoYouFeel extends questionPools.ItemQuestion {

    
    constructor(props:questionPools.ItemProps) {
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
            noResponseLabel: french("Pour r??pondre "),
            min: 0,
            max: 100,
            stepSize: 1
        });
    }

}
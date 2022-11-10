import {  questionPools, _T, responses as common_responses, LanguageMap, ItemProps, ItemQuestion, BaseChoiceQuestion,
     GroupQuestion, GroupProps, ClientExpression as client, trans_text } from "../../../common"
import {  Expression, ItemComponent, SurveySingleItem } from "survey-engine/data_types";
import { OptionDef } from "case-editor-tools/surveys/types";
import { SurveyItems } from 'case-editor-tools/surveys';
import { as_input_option, as_option, french, OptionList } from "../../../utils";
import { text_how_answer, text_select_all_apply, text_why_asking } from "../../../../common/studies/common/questionPools";
import { matrixKey, responseGroupKey } from "case-editor-tools/constants/key-definitions";

const MultipleChoicePrefix = questionPools.MultipleChoicePrefix;

// [X] Q16
// [X] Q7 
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
            questionText: _T("weekly.Q16.text", "How many stool a day did you have"),
        }
    }
    
    getResponses() {
            return  [
               as_option("0", _T( "weekly.Q16.option.less3", "Less than 3")),
               as_option("1", _T( "weekly.Q16.option.more3", "More than 3"))
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
                    content: _T( "weekly.EX.Q7.rg.mcg.option.other_community_pract", "Other community practitioner")
                },
                {
                    key: '9', role: 'option',
                    disabled: exclusiveOther,
                    content: _T( "weekly.EX.Q7.rg.mcg.option.gynecologist", "Gynecologist")
                },
                {
                    key: '10', role: 'option',
                    disabled: exclusiveOther,
                    content: _T("weekly.EX.Q7.rg.mcg.option.midwife", "Midwife")
                },
                {
                    key: '7', role: 'option',
                    disabled: exclusiveOther,
                    content: _T("weekly.EX.Q7.rg.mcg.option.pharmacist", "Pharmacist")
                },
                {
                    key: '8', role: 'option',
                    disabled: exclusiveOther,
                    content: _T("weekly.EX.Q7.rg.mcg.option.scholar_nurse","Scholar nurse")
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
            questionText: _T("weekly.Q9d.text", "About the antibiotic you used"),
        };
    }

    getResponses() {
        return  [
            as_option("0", _T("weekly.Q9d.option.from_doctor", "They have just been prescribed by a doctor")),
            as_option("1", _T("weekly.Q9d.option.from_home","You already have them at home"))
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
        
        const yes_codes = [ scale_codes.yes_more, scale_codes.yes_already ];

        return client.logic.or(
            client.responseHasKeysAny(this.key, [responseGroupKey, this.getLikertRowKey(codes.wear_mask_french)].join('.'), ...yes_codes ),
            client.responseHasKeysAny(this.key, [responseGroupKey, this.getLikertRowKey(codes.wear_mask_home_french)].join('.'), ...yes_codes ),
        )
    }
}

export class CauseOfSymptoms extends questionPools.weekly.CauseOfSymptoms {

    getResponses(): Array<OptionDef> {
    
        const list = new OptionList(super.getResponses());
        
        list.insertAfterKey('9',  as_option("7", _T("weekly.Q11.option.doctor_said_flu", "My doctor said they are caused by flu")) );

        return list.values();
    }
}


export class HowDoYouFeel extends ItemQuestion {

    
    constructor(props:ItemProps) {
        super(props, 'Q17');
    }

    buildItem(): SurveySingleItem {
        return SurveyItems.numericSlider({
            parentKey: this.parentKey,
            itemKey: this.itemKey,
            isRequired: this.isRequired,
            condition: this.condition,
            questionText:_T("weekly.Q17.text", "Globally, how do you feel today"),
            sliderLabel: _T( "weekly.Q17.sliderLabel", "Slider label"),
            noResponseLabel: _T("weekly.Q17.noResponseLabel", "noResponseLabel"),
            helpGroupContent: this.getHelpGroupContent(),
            min: 0,
            max: 100,
            stepSize: 1
        });
    }

    getHelpGroupContent() {
        return [
            text_why_asking("weekly.Q17.helpGroup.why_asking"),
            trans_text("weekly.Q17.helpGroup.asking_reason", "How do you feel asking reason"),
            text_how_answer("weekly.Q17.helpGroup.how_answer"),
            trans_text("weekly.Q17.helpGroup.answer_tip", "How do you feel answer tip"),
        ]
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
            questionText: _T("weekly.QFRmask1.text", "Under what circumstances did you wear a mask"),
            topDisplayCompoments: [
                text_select_all_apply("weekly.Qmask1.select_all_apply"),
            ]
        });
    }

    getResponses(): OptionDef[] {
        return [
            as_option("1", _T( "weekly.QFRmask1.option.fear_transmit", "By fear of transmitting to household")),
            as_option("2", _T( "weekly.QFRmask1.option.oustide", "Oustide home")),
            as_option("3", _T( "weekly.QFRmask1.option.at_work", "At work")),
            as_option("4", _T("weekly.QFRmask1.option.contact_elder", "Close to elder people")),
            as_option("5", _T("weekly.QFRmask1.option.contact_at_risk","Close to people with chronic disease")),
            as_option("6", _T( "weekly.QFRmask1.option.hospital","By visiting people at hospital")),
            as_option("7", _T( "weekly.QFRmask1.option.young_children","Close to young people")),
            as_option("8", _T( "weekly.QFRmask1.option.other","Other")),
            as_option("99", _T( "weekly.QFRmask1.option.dnk","I dont know")),
        ]
    }

}

export class MaskWearingAlways extends BaseChoiceQuestion {

    constructor(props: ItemProps) {
        super(props, 'QFRmask2', 'single');
        this.setOptions({
            questionText: _T( "weekly.QFRmask2.text","In this context, did you always wear a mask"),
        });
    }

    getResponses(): OptionDef[] {
        return [
            as_option("1", _T("weekly.QFRmask2.option.yes", "Yes")),
            as_option("0", _T("weekly.QFRmask2.option.no", "No")),
            as_option("99", _T("weekly.QFRmask2.option.dnk", "I dont know")),
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
            questionText: _T( "weekly.QFRmaskE.text", "Why did you not always wear a mask in this context"),
            topDisplayCompoments: [
                text_select_all_apply("weekly.Qmask3.select_all_apply"),
            ],
        });
    }

    getResponses(): OptionDef[] {
        return [
            as_option("1", _T("weekly.QFRmask3.option.at_home", "At home")),
            as_option("2", _T("weekly.QFRmask3.option.not_enough", "Dont have enough mask")),
            as_option("3", _T("weekly.QFRmask3.option.incommode", "Mask incommode me for breathing")),
            as_option("4", _T("weekly.QFRmask3.option.constraint", "Too constraining")),
            as_option("5", _T("weekly.QFRmask3.option.other_look", "Because of other people's opinion when seeing me")),
            as_input_option("6", _T( "weekly.QFRmask3.option.other_look", "Other reason")), 
            as_option("99", _T( "weekly.QFRmask3.option.dnk", "I dont know")),
        ]
    }

}

export class MaskProvidedFrom extends BaseChoiceQuestion {
    
    constructor(props: ItemProps) {
        super(props, 'QFRmask4', 'multiple');
        this.setOptions({
            questionText: _T( "weekly.QFRmask4.text", "Where did you get this mask from?"),
            topDisplayCompoments: [
                text_select_all_apply("weekly.Qmask4.select_all_apply"),
            ]
        });
    }

    getResponses(): OptionDef[] {
        return [
            as_option("1", _T( "weekly.QFRmask4.option.pharmacy", "At the pharmacy")),
            as_option("2", _T("weekly.QFRmask4.option.internet", "On internet")),
            as_option("3", _T( "weekly.QFRmask4.option.work", "At work")),
            as_option("4", _T("weekly.QFRmask4.option.doctor", "From my doctor")),
            as_input_option("5", _T("weekly.QFRmask4.option.other", "Other")),
            as_option("99", _T( "weekly.QFRmask4.option.dnk", "I dont know")),
        ];
    }

}

export class MaskWhyNotWearing extends BaseChoiceQuestion {
    
    constructor(props: ItemProps) {
        super(props, 'QFRmask5', 'multiple');
        this.setOptions({
            questionText: _T("weekly.QFRmask5.text", "Why did you not wear a mask"),
            topDisplayCompoments: [
                text_select_all_apply("weekly.QFRmask5.select_all_apply"),
            ]
        });
    }

    getResponses(): OptionDef[] {
        return [
            as_option("1", _T("weekly.QFRmask5.option.ridiculous", "You fear to be ridiculous")),
            as_option("2", _T("weekly.QFRmask5.option.excessive", "it's a little excessive")),
            as_option("3", _T("weekly.QFRmask5.option.efficient", "it would not be efficient")),
            as_option("4", _T("weekly.QFRmask5.option.unrisky.trans", "There is no risk of transmission")),
            as_option("5", _T("weekly.QFRmask5.option.dontcare.trans", "I dont care much if I transmit the virus")),
            as_option("6", _T("weekly.QFRmask5.option.find.mask", "I dont know where to obtain this kind of mask")),
            as_option("7", _T("weekly.QFRmask5.option.spend.money", "I don't want to spend money for that")),
            as_option("8", _T("weekly.QFRmask5.option.keep.mask", "I find hard to keep the mask a long time on my face")),
            as_option("9", _T("weekly.QFRmask5.option.concerned", "I dont feel concerned")),
            as_input_option("10", _T("weekly.QFRmask5.option.other", "Other")),
            as_option("99", _T("weekly.QFRmask5.option.dnk", "I dont know"))
        ];
    }

}

import {  questionPools, _T, LanguageMap, ItemProps, ItemQuestion, BaseChoiceQuestion,
     GroupQuestion, GroupProps, ClientExpression as client, trans_text, as_input_option, as_option, OptionList, MatrixRow, 
     markdownComponent,
     textComponent, option_def, option_input_other, HelpGroupContentType, SimpleGroupQuestion, ItemBuilder, make_exclusive_options }  from "../../../common"
import {  Expression, ItemComponent, SurveySingleItem } from "survey-engine/data_types";
import { Item, OptionDef } from "case-editor-tools/surveys/types";
import { SurveyItems } from 'case-editor-tools/surveys';
import { require_response, text_how_answer, text_select_all_apply, text_why_asking } from "../../../../common/studies/common/questionPools";
import { matrixKey, responseGroupKey } from "case-editor-tools/constants/key-definitions";
import { ItemEditor } from "case-editor-tools/surveys/survey-editor/item-editor";
import { generateHelpGroupComponent, generateTitleComponent } from "case-editor-tools/surveys/utils/simple-generators";
import { initMatrixQuestion, ResponseRowCell } from "case-editor-tools/surveys/responseTypeGenerators/matrixGroupComponent";
import responses from "./responses";

const MultipleChoicePrefix = questionPools.MultipleChoicePrefix;

// Alias namespace
import pool = questionPools.weekly;
import { GrippenetFlags } from "../../flags";
import { quartersInYear } from "date-fns";


// [X] Q16
// [X] Q7 
// [ ] Q7b
// [ ] +Q9d
// [ ] Qcov7 4a=>4, 4b=>17, 18=>, 12=>()
// [ ] Q11 => +7, +8
// [ ] +Q17

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
                    content: _T("weekly.prelude", "weekly survey prelude text in markdown")
                })
            ]
        });
    }
}

const createDefaultHelpGroup = (prefix: string) => {
    return [
        text_why_asking(prefix + ".helpGroup.why_asking"),
        trans_text(prefix + ".helpGroup.asking_reason", prefix + " Question asking reason"),
        text_how_answer(prefix + ".helpGroup.how_answer"),
        trans_text(prefix + ".helpGroup.answer_tip", prefix + " Question answer tip"),
    ];
}



interface SymptomDependentProps extends ItemProps {
    SymptomQuestion: pool.Symptoms
}

export class SymptomsStart extends pool.SymptomsStart {

    getCondition(): Expression {
        const codes = responses.same_illness;
        return client.logic.not(
            client.singleChoice.any(this.keySameIllness, codes.yes)
        );
    }
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

export class VisitedMedicalService extends pool.VisitedMedicalService {

    getResponses():OptionDef[] {
        
            const codes = responses.visit_medical;
    
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
                    key: codes.other_community, role: 'option',
                    disabled: exclusiveOther,
                    content: _T( "weekly.EX.Q7.rg.mcg.option.other_community_pract", "Other community practitioner")
                },
                
                {
                    key: codes.pharmacist, role: 'option',
                    disabled: exclusiveOther,
                    content: _T("weekly.EX.Q7.rg.mcg.option.pharmacist", "Pharmacist")
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
                
            ];
        }

        getCov18Condition(): Expression {
            const codes = responses.visit_medical;
            return client.multipleChoice.none(this.key, codes.other_community, codes.emergency, codes.gp)
        }

        getQ1AnsmCondition(): Expression {
            const codes = responses.visit_medical;
            return client.multipleChoice.any(this.key, codes.other_community, codes.emergency, codes.gp, codes.other)
        }


        /**
         * Get List visits labels of by code
         * @returns 
         */
        getVisitTypes() {
            const r = this.getResponses();
            const codes = responses.visit_medical;
    
            const d = new Map<string, LanguageMap>();
            r.forEach(resp=> {
                if(resp.key == codes.no || resp.key == codes.plan) {
                    return;
                }
                if(resp.content) {
                    d.set(resp.key, resp.content);
                }
            });
            return d;
        }

}

interface VisitedMedicalServiceProps extends ItemProps {
    visiteMedicalService: VisitedMedicalService 
}
export class VisitedMedicalServiceWhen extends ItemQuestion {

    visiteMedicalService: VisitedMedicalService 
    
    constructor(props: VisitedMedicalServiceProps) {
        super(props, 'Q7b');
        this.visiteMedicalService = props.visiteMedicalService;
    }

    buildItem() {

        const itemKey = this.key;
        const editor = new ItemEditor(undefined, { itemKey: itemKey, isGroup: false });

        editor.setTitleComponent(
            generateTitleComponent(_T("weekly.EX.Q7b.title.0", "How soon after your symptoms appeared did you first VISIT this medical service?"))
        );

        // INFO POPUP
        editor.setHelpGroupComponent( generateHelpGroupComponent(this.getHelpGroupContent())  );

        // RESPONSE PART
        const rg = editor.addNewResponseComponent({ role: 'responseGroup' });

        editor.addExistingResponseComponent(
            textComponent({
             key: "note1",
             content:  _T("weekly.EX.Q7b.rg.sFcN.text.0", 'Select the correct number of days')
            })
        , rg?.key);

        const ddOptions: ResponseRowCell = {
            key: 'col1', role: 'dropDownGroup', items: [
                {
                    key: '0', role: 'option', content: _T("weekly.EX.Q7b.rg.mat.r1.col1.option.0", "Same day"),
                },
                {
                    key: '1', role: 'option', content: _T("weekly.EX.Q7b.rg.mat.r1.col1.option.1", "1 day"),
                },
                {
                    key: '2', role: 'option', content: _T("weekly.EX.Q7b.rg.mat.r1.col1.option.2", "2 days"),
                },
                {
                    key: '3', role: 'option', content: _T("weekly.EX.Q7b.rg.mat.r1.col1.option.3", "3 days"),
                },
                {
                    key: '4', role: 'option', content: _T("weekly.EX.Q7b.rg.mat.r1.col1.option.4", "4 days"),
                },
                {
                    key: '5', role: 'option', content: _T("weekly.EX.Q7b.rg.mat.r1.col1.option.5", "5 - 7 days"),
                },
                {
                    key: '6', role: 'option', content: _T("weekly.EX.Q7b.rg.mat.r1.col1.option.6", "More than 7 days"),
                },
                {
                    key: '7', role: 'option', content: _T("weekly.EX.Q7b.rg.mat.r1.col1.option.7", "I don't know/can't remember"),
                },
            ]
        };

        const visitTypes = this.visiteMedicalService.getVisitTypes();

        const visits = responses.visit_medical;

        const displayCondition = (...codes:string[]) => {
            return client.multipleChoice.any(this.visiteMedicalService.key, ...codes);
        }

        interface rowDef {
            row: string;
            codes: string|string[];
            label_from?: string;
        }

        const conditionCodes: string[] = [];

        // Wanted entries
        // Row id, visit code to show (label is auto from the visit question)
        const rows: rowDef[] = [
            {row:'r1', codes:visits.gp},
            {row:'r2', codes: visits.emergency},
            {row:'r4', codes:[ visits.other, visits.midwife, visits.pharmacist, visits.scholar,  ], label_from: visits.other},
            {row:'r5', codes:[visits.other_community, visits.gynecologist ], label_from:visits.other_community }
        ];

        const matrixRows: MatrixRow[] =  rows.map(r =>  {
            const visitCode = r.codes;
            const key = r.row;
            
            const label_from = r.label_from ? r.label_from : ( Array.isArray(r.codes) ? r.codes[0] : r.codes);
            
            const label = visitTypes.get(label_from);
            if(!label) {
                throw new Error("weekly.Q7b: no visit code known for "+ visitCode);
            }
            
            conditionCodes.push(...visitCode);

            return {
                key: key, role: 'responseRow', cells: [
                    {
                        key: 'col0', role: 'label', content:label,
                    },
                    { ...ddOptions }
                ],
                displayCondition: displayCondition(...visitCode)
            }
        });

        const rg_inner = initMatrixQuestion(matrixKey, matrixRows);

        editor.addExistingResponseComponent(rg_inner, rg?.key);

        // Condition

        // Select dynamically used codes in boxes
        const condition = client.multipleChoice.any(this.visiteMedicalService.key, ...conditionCodes);
        
        editor.setCondition(condition);

        // VALIDATIONs
        if (this.isRequired) {
            require_response(editor, this.key, responseGroupKey);
        }

        return editor.getItem();

    }

    getHelpGroupContent() {
        return [
            text_why_asking("weekly.EX.Q7b.helpGroup.text.0"),
            {
                content: _T("weekly.EX.Q7b.helpGroup.text.1", "To find out how quickly people with symptoms are seen by the health services."),
                style: [{ key: 'variant', value: 'p' }],
            },
            text_how_answer("weekly.EX.Q7b.helpGroup.text.2"),
            {
                content: _T("weekly.EX.Q7b.helpGroup.text.3", "Only record the time until your FIRST contact with the health services."),
            },
        ]
    }
}

export class WhyVisitedNoMedicalService extends pool.WhyVisitedNoMedicalService {

    getCondition(): Expression|undefined {
        return this.condition; // Use condition defined in survey
    }
}

interface AntibioticFromProps extends ItemProps {
    medicationQuestion: pool.TookMedication
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

export class CovidHabitsChange extends pool.CovidHabitsChange {

    getOptionItems(): Map<string, LanguageMap>  {

        const codes = responses.covid_habits;

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
        const codes = responses.covid_habits;
        const scale_codes = pool.CovidHabitsChange.likertScaleCodes;
        
        const yes_codes = [ scale_codes.yes_more, scale_codes.yes_already ];

        return client.logic.or(
            client.responseHasKeysAny(this.key, [responseGroupKey, this.getLikertRowKey(codes.wear_mask_french)].join('.'), ...yes_codes ),
            client.responseHasKeysAny(this.key, [responseGroupKey, this.getLikertRowKey(codes.wear_mask_home_french)].join('.'), ...yes_codes ),
        )
    }

    createDontWearMaskCondition(): Expression {
        const codes = responses.covid_habits;
        const scale_codes = pool.CovidHabitsChange.likertScaleCodes;
        
        const no_codes = [ scale_codes.no];

        return client.logic.or(
            client.responseHasKeysAny(this.key, [responseGroupKey, this.getLikertRowKey(codes.wear_mask_french)].join('.'), ...no_codes ),
            client.responseHasKeysAny(this.key, [responseGroupKey, this.getLikertRowKey(codes.wear_mask_home_french)].join('.'), ...no_codes ),
        )
    }

}

export class CauseOfSymptoms extends pool.CauseOfSymptoms {
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
        super(props, 'Qm1', 'multiple');
        this.setOptions({
            questionText: _T("weekly.QFRmask1.text", "Under what circumstances did you wear a mask"),
            topDisplayCompoments: [
                text_select_all_apply("weekly.Qmask1.select_all_apply"),
            ]
        });
    }

    getResponses(): OptionDef[] {
        const exclusiveCondition = client.multipleChoice.any(this.key, "99");
        const exclusiveIDontKnow = client.multipleChoice.none(this.key, "99");
        const opts = {disabled: exclusiveCondition};
        return [
            option_def("1", _T( "weekly.QFRmask1.option.fear_transmit", "By fear of transmitting to household"), opts),
            option_def("2", _T( "weekly.QFRmask1.option.oustide", "Oustide home"), opts),
            option_def("3", _T( "weekly.QFRmask1.option.at_work", "At work"), opts),
            option_def("4", _T("weekly.QFRmask1.option.contact_elder", "Close to elder people"), opts),
            option_def("5", _T("weekly.QFRmask1.option.contact_at_risk","Close to people with chronic disease"), opts),
            option_def("6", _T( "weekly.QFRmask1.option.hospital","By visiting people at hospital"), opts),
            option_def("7", _T( "weekly.QFRmask1.option.young_children","Close to young people"), opts),
            option_input_other("8", _T( "weekly.QFRmask1.option.other","Other"), "weekly.QFRmask1.option.other.desc", opts ),
            option_def("99", _T( "weekly.QFRmask1.option.dnk","I dont know"), {disabled: exclusiveIDontKnow}),
        ]
    }
}

export class MaskWearingAlways extends BaseChoiceQuestion {

    constructor(props: ItemProps) {
        super(props, 'Qm2', 'single');
        this.setOptions({
            questionText: _T( "weekly.QFRmask2.text","In this context, did you always wear a mask"),
        });
    }

    getResponses(): OptionDef[] {
        return [
            as_option("1", _T("weekly.QFRmask2.option.yes", "Yes")),
            as_option("0", _T("weekly.QFRmask2.option.no", "No")),
            as_option("2", _T("weekly.QFRmask2.option.dnk", "I dont know")),
        ]
    }

    createConditionNoUnknown() {
        return client.singleChoice.any(this.key, '0', '2');
    } 

    createConditionYes() {
        return client.singleChoice.any(this.key, '1');
    }

}

export class MaskNotWearingReason extends BaseChoiceQuestion {
    
    constructor(props: ItemProps) {
        super(props, 'Qm3', 'multiple');
        this.setOptions({
            questionText: _T( "weekly.QFRmaskE.text", "Why did you not always wear a mask in this context"),
            topDisplayCompoments: [
                text_select_all_apply("weekly.Qmask3.select_all_apply"),
            ],
        });
    }

    getResponses(): OptionDef[] {

        const exclusiveCondition = client.multipleChoice.any(this.key, "6");
        const exclusiveDontKnow = client.multipleChoice.none(this.key, "6");

        return [
            option_def("1", _T("weekly.QFRmask3.option.not_enough", "Dont have enough mask"), {disabled: exclusiveCondition}),
            option_def("2", _T("weekly.QFRmask3.option.incommode", "Mask incommode me for breathing"), {disabled: exclusiveCondition}),
            option_def("3", _T("weekly.QFRmask3.option.constraint", "Too constraining"), {disabled: exclusiveCondition}),
            option_def("4", _T("weekly.QFRmask3.option.other_look", "Because of other people's opinion when seeing me"), {disabled: exclusiveCondition}),
            option_input_other("5", _T( "weekly.QFRmask3.option.other", "Other reason"), "weekly.QFRmask3.option.other.desc", {disabled: exclusiveCondition}), 
            option_def("6", _T( "weekly.QFRmask3.option.dnk", "I dont know"),  {disabled: exclusiveDontKnow}),
        ]
    }

}

export class MaskProvidedFrom extends BaseChoiceQuestion {
    
    constructor(props: ItemProps) {
        super(props, 'Qm4', 'multiple');
        this.setOptions({
            questionText: _T( "weekly.QFRmask4.text", "Where did you get this mask from?"),
            topDisplayCompoments: [
                text_select_all_apply("weekly.Qmask4.select_all_apply"),
            ]
        });
    }

    getResponses(): OptionDef[] {

        const exclusiveCondition = client.multipleChoice.any(this.key, "6");
        const exclusiveDontKnow = client.multipleChoice.none(this.key, "6");

        return [
            option_def("1", _T( "weekly.QFRmask4.option.pharmacy", "At the pharmacy"), {disabled: exclusiveCondition}),
            option_def("2", _T("weekly.QFRmask4.option.internet", "On internet"), {disabled: exclusiveCondition}),
            option_def("3", _T( "weekly.QFRmask4.option.work", "At work"), {disabled: exclusiveCondition}),
            option_def("4", _T("weekly.QFRmask4.option.doctor", "From my doctor"), {disabled: exclusiveCondition}),
            option_input_other("5", _T("weekly.QFRmask4.option.other", "Other"), "weekly.QFRmask4.option.other.desc", {disabled: exclusiveCondition}),
            option_def("6", _T( "weekly.QFRmask4.option.dnk", "I dont know"), {disabled: exclusiveDontKnow}),
        ];
    }

}

export class MaskWhyNotWearing extends BaseChoiceQuestion {
    
    constructor(props: ItemProps) {
        super(props, 'Qm5', 'multiple');
        this.setOptions({
            questionText: _T("weekly.QFRmask5.text", "Why did you not wear a mask"),
            topDisplayCompoments: [
                text_select_all_apply("weekly.QFRmask5.select_all_apply"),
            ]
        });
    }

    getResponses(): OptionDef[] {
        const exclusiveCondition = client.multipleChoice.any(this.key, "11");
        const exclusiveDontKnow = client.multipleChoice.none(this.key, "11");

        return [
            option_def("1", _T("weekly.QFRmask5.option.ridiculous", "You fear to be ridiculous"), {disabled: exclusiveCondition}),
            option_def("2", _T("weekly.QFRmask5.option.excessive", "it's a little excessive"), {disabled: exclusiveCondition}),
            option_def("3", _T("weekly.QFRmask5.option.efficient", "it would not be efficient"), {disabled: exclusiveCondition}),
            option_def("4", _T("weekly.QFRmask5.option.unrisky.trans", "There is no risk of transmission"), {disabled: exclusiveCondition}),
            option_def("5", _T("weekly.QFRmask5.option.dontcare.trans", "I dont care much if I transmit the virus"), {disabled: exclusiveCondition}),
            option_def("6", _T("weekly.QFRmask5.option.find.mask", "I dont know where to obtain this kind of mask"), {disabled: exclusiveCondition}),
            option_def("7", _T("weekly.QFRmask5.option.spend.money", "I don't want to spend money for that"), {disabled: exclusiveCondition}),
            option_def("8", _T("weekly.QFRmask5.option.keep.mask", "I find hard to keep the mask a long time on my face"), {disabled: exclusiveCondition}),
            option_def("9", _T("weekly.QFRmask5.option.concerned", "I dont feel concerned"), {disabled: exclusiveCondition}),
            option_def("12", _T("weekly.QFRmask5.option.nosympt", "I dont have any respiratory symptom"), {disabled: exclusiveCondition}),
            option_input_other("10", _T("weekly.QFRmask5.option.other", "Other"), "weekly.QFRmask5.option.other.desc", {disabled: exclusiveCondition}),
            option_def("11", _T("weekly.QFRmask5.option.dnk", "I dont know"), {disabled: exclusiveDontKnow})
        ];
    }

}



export class Q1ANSM extends BaseChoiceQuestion {
    
    constructor(props: ItemProps) {
        super(props, 'Q1ansm', 'single');
        this.setOptions({
            questionText: _T("weekly.Q1ansm.text", "Q1ansm")
        });
    }

    getResponses(): OptionDef[] {
        
        return [
            option_def("0", _T("weekly.Q1ansm.option.no", "No")),
            option_def("1", _T("weekly.Q1ansm.option.yes", "Yes")),
            option_def("99", _T("weekly.Q1ansm.option.dnk", "I dont know")),
        ];
    }

    getYesCondition(): Expression {
        return client.singleChoice.any(this.key, '1');
    }

}
export class Q2ANSM extends BaseChoiceQuestion {
    
    constructor(props: ItemProps) {
        super(props, 'Q2ansm', 'single');
        this.setOptions({
            questionText: _T("weekly.Q2ansm.text", "Q2ansm")
        });
    }

    getResponses(): OptionDef[] { 
        return [
            option_def("0", _T("weekly.Q2ansm.option.no", "No")),
            option_def("1", _T("weekly.Q2ansm.option.yes", "Yes")),
        ];
    }

    getYesCondition(): Expression {
        return client.singleChoice.any(this.key, '1');
    }

    getHelpGroupContent(): HelpGroupContentType | undefined {
        return createDefaultHelpGroup("weekly.Q2ansm");
    }
}

/*
Q3 ANSM (si 1 à la Q2 ANSM)
Qu’est-ce qui ne vous a pas été délivré ?
o	Médicament contre la douleur ou la fièvre (par exemple paracétamol,  ibuprofène, aspirine, etc.) (Préciser  Champ libre)  1
o	Médicament contre la toux  (préciser)  Champ libre 2
o	Antiviral contre la grippe (Tamiflu) (préciser) Champ libre 3
o	Antiviral contre la Covid-19 (Paxlovid) (préciser)Champ libre 7
o	Antibiotique (préciser) Champ libre 4
o	Dispositif médical (chambre d’inhalation, dispositif d’oxygénothérapie, etc.)  (préciser) Champ libre 8
o	Vaccin (préciser) Champ libre 9
o	Autre (préciser) Champ libre 5
*/

export class QAnsmNotDelivered extends BaseChoiceQuestion {
    
    constructor(props: ItemProps, defaultKey: string) {
        super(props, defaultKey, 'multiple');
        this.setOptions({
            questionText: _T("weekly.QAnsmNotDelivered.text", "Q3ansm")
        });
    }

    getResponses(): OptionDef[] { 

        const desc = _T("weekly.QAnsmNotDelivered.option.input_desc","Name it if possible");


        return [
            as_input_option('1', _T('weekly.QAnsmNotDelivered.option.text.painkiller','Pain killer'), _T("weekly.QAnsmNotDelivered.option.desc.painkiller", "tylenol, ...")),
            as_input_option('2', _T('weekly.QAnsmNotDelivered.option.text.cough','Cough medication'), desc),
            as_input_option('3', _T('weekly.QAnsmNotDelivered.option.text.flu', 'Influenza antiviral'), desc),
            as_input_option('7', _T('weekly.QAnsmNotDelivered.option.text.covid19', 'Covid19 antiviral'), desc),
            as_input_option('4', _T('weekly.QAnsmNotDelivered.option.text.antibiotic.', 'Antibiotic'), desc),
            as_input_option('8', _T('weekly.QAnsmNotDelivered.option.text.device', 'Medical device'), _T("weekly.QAnsmNotDelivered.option.desc.device", "inhalation chamber, ...")),
            as_input_option('9', _T('weekly.QAnsmNotDelivered.option.text.vaccine', 'Vaccine'), desc),
            option_input_other('5', _T('weekly.QAnsmNotDelivered.option.text.other', 'Other'), 'weekly.QAnsmNotDelivered.option.text.other_desc'),            
        ];
    }
}

export class QAnsmDelivedyReplaced extends BaseChoiceQuestion {
    
    constructor(props: ItemProps, defaultKey: string) {
        super(props, 'Q4ansm', 'single');
        this.setOptions({
            questionText: _T("weekly.QAnsmDelivedyReplaced.text", "QAnsmDelivedyReplaced")
        });
    }

    getResponses(): OptionDef[] { 
        return [
            option_def("0", _T("weekly.QAnsmDelivedyReplaced.option.no", "No")),
            option_def("1", _T("weekly.QAnsmDelivedyReplaced.option.yes", "Yes")),
        ];
    }

    getYesCondition(): Expression {
        return client.singleChoice.any(this.key, '1');
    }

}

export class QAnsmProposedAlternative extends BaseChoiceQuestion {
    
    constructor(props: ItemProps, defautlKey:string) {
        super(props, defautlKey, 'multiple');
        this.setOptions({
            questionText: _T("weekly.QAnsmProposedAlternative.text", "QAnsmProposedAlternative")
        });
    }

    getResponses(): OptionDef[] { 

        //const ExcludeDontKnow = client.multipleChoice.any(this.key, '99');
    
        const desc = _T("weekly.QAnsmProposedAlternative.option.input_desc", "Name it if possible");

        const oo = [
            option_def("1", _T("weekly.QAnsmProposedAlternative.option.dose", "Other dose")),
            option_def("2", _T("weekly.QAnsmProposedAlternative.option.medication", "Other medication"), {role:'input', description:desc}),
            option_def("3", _T("weekly.QAnsmProposedAlternative.option.preparation", "Magistral preparation")),
            option_def("4", _T("weekly.QAnsmProposedAlternative.option.generic", "Generic"), {role:'input', description:desc}),
            option_input_other('5', _T('weekly.QAnsmProposedAlternative.option.text.other', 'Other'), 'QAnsmProposedAlternative.option.text.other_desc'),
            option_def("99", _T("weekly.QAnsmProposedAlternative.option.dnk", "I dont know")),
        ];

        make_exclusive_options(this.key, oo, ['99']);

        return oo;
    }
}



interface AsnmDeliveryProps extends GroupProps {
    NotDeliveredKey: string;
    DelivedyReplaced: string;
    ProposedAlternative: string;
}

export class AnsmDeliveryGroup extends SimpleGroupQuestion {
    
    constructor(props: AsnmDeliveryProps) {
        super(props, 'AnsmG');
        
        const QNotDelivered = new QAnsmNotDelivered({parentKey: this.key}, props.NotDeliveredKey);
        this.add(QNotDelivered);
        
        const QDelivedyReplaced = new QAnsmDelivedyReplaced({parentKey: this.key}, props.DelivedyReplaced);
        this.add(QDelivedyReplaced);

        const QAlternative = new QAnsmProposedAlternative({parentKey: this.key}, props.ProposedAlternative);
        QAlternative.setCondition(QDelivedyReplaced.getYesCondition());
        this.add(QAlternative);
    }

}

export class AnsmEndGroup extends SimpleGroupQuestion {
    
    QDeliveryFailure: ItemQuestion;

    constructor(props: GroupProps) {
        super(props, 'AnsmEnd');
        this.add(new QansmPrelude({parentKey: this.key}));

        const ansmFlag = GrippenetFlags.ansmNoChild;

        const IsNotConcerned = client.participantFlags.hasKeyAndValue(ansmFlag.key, ansmFlag.values.yes);

        const Q6ansm = new Q6ANSM({parentKey: this.key});
        this.add(Q6ansm);
    
        const Q7ansm = new Q7ANSM({parentKey: this.key});
    
        Q7ansm.setCondition(client.logic.not(IsNotConcerned));
        this.QDeliveryFailure = Q7ansm;

        this.add(Q7ansm);

        const deliveryGroup = new AnsmDeliveryGroup({
            parentKey: this.key, 
            NotDeliveredKey: 'Q8ansm',
            DelivedyReplaced: 'Q9ansm',
            ProposedAlternative: 'Q10ansm'
        });

        deliveryGroup.setCondition(Q7ansm.getYesCondition());
        this.add(deliveryGroup);
    }

    getDeliveryFailureItem() {
        return this.QDeliveryFailure;
    }

}

export class QansmPrelude extends ItemQuestion {
    
    constructor(props: ItemProps) {
        super(props, 'Qansm0');
    }

    buildItem(): SurveySingleItem {
        return SurveyItems.display({
            parentKey: this.parentKey,
            itemKey: this.itemKey,
            content: [
                markdownComponent({
                    key: 'prelude',
                    content: _T("weekly.Qansm.prelude", "ANSM ancillary study")
                })
            ]
        });
    }
}

export class Q7ANSM extends BaseChoiceQuestion {
    
    constructor(props: ItemProps) {
        super(props, 'Q7ansm', 'single');
        this.setOptions({
            questionText: _T("weekly.Q7ansm.text", "Q7ansm")
        });
    }

    getResponses(): OptionDef[] { 
        return [
            option_def("0", _T("weekly.Q7ansm.option.no", "No")),
            option_def("1", _T("weekly.Q7ansm.option.yes", "Yes")),
            option_def("2", _T("weekly.Q7ansm.option.not_concerned", "Not concerned")),
            option_def("99", _T("weekly.Q7ansm.option.dnk", "I dont know")),
        ];
    }

    getHelpGroupContent(): HelpGroupContentType | undefined {
        return createDefaultHelpGroup("weekly.Q7ansm");
    }

    getYesCondition(): Expression {
        return client.singleChoice.any(this.key, '1');
    }

}

export class Q6ANSM extends BaseChoiceQuestion {
    
    constructor(props: ItemProps) {
        super(props, 'Q6ansm', 'single');
        this.setOptions({
            questionText: _T("weekly.Q6ansm.text", "Q6ansm")
        });
    }

    getResponses(): OptionDef[] { 
        return [
            option_def("0", _T("weekly.Q6ansm.option.no", "No")),
            as_input_option("1", _T("weekly.Q6ansm.option.yes", "Yes")),
        ];
    }

    getHelpGroupContent(): HelpGroupContentType | undefined {
        return createDefaultHelpGroup("weekly.Q6ansm");
    }

}


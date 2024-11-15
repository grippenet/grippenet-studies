import { SurveyItems } from "case-editor-tools/surveys";
import {  OptionDef } from "case-editor-tools/surveys/types";
import { SurveyItem, SurveySingleItem } from "survey-engine/data_types";
import { questionPools as pool, 
    _T, ItemQuestion, ItemProps, BaseChoiceQuestion, 
    ClientExpression as client, exp_as_arg, as_input_option, as_option, option_input_other, OptionList, markdownComponent, transTextComponent, trans_text, num_as_arg } from "../../../common"
import {  OverridenResponses, ResponseOveriddes } from "../../../utils";
import ResponseEncoding from "./responses";

import encoding from "./responses";
import { createDefaultHelpGroup } from "../../../utils/questions";
import { create } from "domain";

const text_how_answer = pool.text_how_answer;
const text_why_asking = pool.text_why_asking;

// Q10c.11
// Q10d.15, 16, 17, 18, 19
// Q37

export class SurveyPrelude extends ItemQuestion {
    
    buildItem(): SurveySingleItem {
        return SurveyItems.display({
            parentKey: this.parentKey,
            itemKey: this.itemKey,
            content: [
                markdownComponent({
                    key: 'prelude',
                    content: _T("vaccination.prelude", "Vaccination survey prelude text in markdown")
                })
            ]
        });
    }

}

export class FluVaccineThisSeasonReasonFor extends pool.vaccination.FluVaccineThisSeasonReasonFor implements OverridenResponses {
    
    getResponses(): OptionDef[] {
        const options = super.getResponses();
        const codes = encoding.flu_vac_reason;
        const list = new OptionList(options);
        list.insertBeforeKey(codes.riskgroup, as_option(codes.voucher, _T("vaccination.Q10c.option.voucher", "I have a voucher")) );
        list.insertAfterKey(codes.riskgroup, as_option(codes.pregnant_baby, _T("vaccination.Q10c.option.pregnant_baby","I'm pregnant and want to protect my baby")));
        return list.values();
    }

    getResponseOverrides(): ResponseOveriddes { 
        const codes = encoding.flu_vac_reason;
        const o : ResponseOveriddes = {};
        o[codes.riskgroup] = [ codes.voucher, codes.pregnant_baby ];
        return o;
    }

    getHelpGroupContent() {
        return [
            text_why_asking("vaccination.Q10c.helpGroup.why_asking"),
            trans_text("vaccination.Q10c.helpGroup.asking_reason", "We would like to know why some people are willing to be vaccinated or not"),
            text_how_answer("vaccination.Q10c.helpGroup.how_answer"),
            trans_text("vaccination.Q10c.helpGroup.answer_tip", "Select all options which have counted to make your decision"),
        ];
    }
}

export class FluVaccineThisSeasonReasonAgainst extends pool.vaccination.FluVaccineThisSeasonReasonAgainst implements OverridenResponses {


    getResponses(): OptionDef[] {
        const prev_options = super.getResponses();
        const codes = encoding.flu_notvac_reason; 
        const list = new OptionList(prev_options);
        
        list.insertAfterKey(codes.offer, 
           // as_option(codes.advised_pregnancy,  _T("vaccination.Q10d.option.advisory_pregnant", "advised_not_to_pregnant")), // Removed 2023
            as_option(codes.pregnant_baby, _T("vaccination.Q10d.option.pregnant_baby", "I'm pregnant and fear for my baby"))
        );
       
        list.insertAfterKey(codes.doubt,
            as_option(codes.prefer_other_measures, _T("vaccination.Q10d.option.prefer_other_measures", "I prefer to protect my self by other protective measures (mask, hand washing...)"))
        )

        list.insertAfterKey(codes.minor_illness,
            as_option(codes.avoid_healthseek, _T("vaccination.Q10d.option.avoid_healthseeking","Because of pandemic, I avoid to visit doctor or pharmacy")),
            as_option(codes.risk_covid,  _T("vaccination.Q10d.option.increase_risk_covid", "I fear the influenza vaccine to increase my risk to get Covid19")),
            option_input_other(codes.covid_other, _T( "vaccination.Q10d.option.other_covid19", "Other reason related to Covid19"), "none")
        );

        list.insertAfterKey(codes.doctor,
            as_option(codes.bad_experience, _T("vaccination.Q10d.option.bad_experience","I had a bad experience with vaccination")),
        );
        
        const exclusiveDontknow =client.multipleChoice.any(this.key, codes.no_reason);
        const exclusiveOthers = client.multipleChoice.none(this.key, codes.no_reason);

        const new_options = list.values()

        new_options.forEach(o => {
            if(o.key == codes.no_reason) {
                o.disabled = client.multipleChoice.none(this.key, codes.no_reason);
            } else {
                o.disabled = client.multipleChoice.any(this.key, codes.no_reason);
            }
        });

        return new_options;     
    }

    getResponseOverrides(): ResponseOveriddes { 
        const codes = encoding.flu_notvac_reason; 
        const o : ResponseOveriddes = {};
        o[codes.other] = [ codes.covid_other, codes.advised_pregnancy, codes.risk_covid, codes.avoid_healthseek, codes.pregnant_baby ];
        return o;
    }
}


export class CovidVaccineAgainstReasons extends pool.vaccination.CovidVaccineAgainstReasons {

    getResponses(): OptionDef[] {

        const codes = encoding.covid_notvac_reason;

        const r = super.getResponses();
        const list = new OptionList(r);
        
        list.insertAfterKey(codes.disagree, 
 //           as_option('18', _T("vaccination.Q35m.option.18", "counter indication")),
            as_option(codes.bad_experience, _T("vaccination.Q35m.option.19", "bad experience with previous vaccine"))
        )

        list.insertAfterKey(
            codes.natural_immunity,
            as_option(codes.vaccined_or_infected, _T("vaccination.Q35m.option.vaccinated", "I'm already vaccinated or have been tested postivive to covid 19 in the last 6 months"))
        );

        list.insertAfterKey(
            codes.notriskgroup,
            as_option(codes.prefer_other_measures, _T("vaccination.Q35m.option.prefer_other_measures", "I prefer to protect my self by other protective measures (mask, hand washing...)"))
        )
    
        list.without(codes.counter_indication, codes.not_free, codes.pregnant_disc);

        const new_options = list.values();
        new_options.forEach(o => {
            if(o.key == codes.dontknow) {
                o.disabled = client.multipleChoice.none(this.key, codes.dontknow);
            } else {
                o.disabled = client.multipleChoice.any(this.key, codes.dontknow);
            }
        });

        return new_options;

    }
}

export class FluVaccinationByWhom extends BaseChoiceQuestion {
    
    constructor(props: ItemProps) {
        super(props, 'Q10e', 'single');
        this.setOptions({
            questionText: _T("vaccination.Q10e.text", "By who have you been vaccinated")
        });
    }

    getResponses(): OptionDef[] {
        return [
            as_option('1', _T("vaccination.Q10e.option.gp",  "By a generalist practitioner")),
            as_option('2', _T("vaccination.Q10e.option.nurse", "By a nurse")),
            as_option('3',  _T("vaccination.Q10e.option.midwife", "By a midwife")),
            as_option('4', _T("vaccination.Q10e.option.pharmacist", "By a pharmacist")),
            as_option('5', _T( "vaccination.Q10e.option.occupational", "By an occupational med practitioner")),
            option_input_other('6', _T("vaccination.Q10e.option.other", "By another kind of practitioner"), "none")
        ];
    }   
}

export class FluVaccinationVoucher extends BaseChoiceQuestion { 
    constructor(props: ItemProps) {
        super(props, 'Q18', 'single');
        this.setOptions({
            questionText: _T("vaccination.Q18.text", "Do you have a voucher for influenza vaccine since last october")
        });
    }

    getResponses(): OptionDef[] {

        return [
            as_option('1', _T("vaccination.Q18.option.yes", "Yes")),
            as_option('0', _T("vaccination.Q18.option.no", "No")),
            as_option("2",  _T("vaccination.Q18.option.dnk","I dont know"))
        ];
    }

    getHelpGroupContent() { 
        return [
            text_why_asking("vaccination.Q18.why_asking"),
            {content: _T("vaccination.Q18.asking_reason","asking_reason")},
            text_how_answer("vaccination.Q18.how_answer"),
            {content: _T("vaccination.Q18.answer_tip","how_answer")},
        ];
        
    }
}

export class LastCovid19Infection extends ItemQuestion {

    constructor( props: ItemProps) {
        super(props, 'Q37');
    }

    buildItem() {
        return SurveyItems.singleChoice({
            parentKey: this.parentKey,
            itemKey: this.itemKey,
            isRequired: this.isRequired,
            condition: this.condition,
            questionText: _T("vaccination.Q37.text", "Did you get a COVID19 infection in the past last months"),
            helpGroupContent: this.getHelpGroupContent(),
            responseOptions: [
                {
                    key: '1', role: 'dateInput',
                    optionProps: {
                        dateInputMode: { str: 'YM' },
                        min: exp_as_arg( client.timestampWithOffset({'years': -2}) ), // 2020-01-01
                        max: exp_as_arg( client.timestampWithOffset({'minutes': 1}) )
                    },
                    content: _T("vaccination.Q37.rg.scg.option.1.text", "Choose date"),
                },
                as_option('0', _T("vaccination.Q37.rg.scg.option.0.text", "No")),
                as_option('2', _T("vaccination.Q37.rg.scg.option.2.text", "I don't know (anymore)"))
            ]
        });
    }

    getHelpGroupContent() {
        return [
            text_why_asking("vaccination.Q37.helpGroup.text.0"),

            {
                content: _T("vaccination.Q37.helpGroup.text.1", "Knowing where is your last infection"),
                style: [{ key: 'variant', value: 'p' }],
            },
            text_how_answer("vaccination.Q37.helpGroup.text.2"),
            {
                content: _T("vaccination.Q37.helpGroup.text.3", "Response as precisely as possible"),
            },
        ]
    }
}

/**
 Contexte Q35n (non préremplie) (Condition si « Non Jamais » coché, décocher les deux autres)
Avez-vous été vacciné contre la Covid-19 lors des saisons précédentes ?
o Oui entre octobre 2023 et septembre 2024 0
o Oui avant octobre 2023 1
o Non jamais 2

Pourquoi demandons-nous cela ?
Connaître votre historique de vaccination récent et ancien permet de savoir l’évolution des campagnes de vaccination
Comment dois-je répondre ?
Répondez « Oui » si vous avez été vacciné contre la Covid-19, une ou plusieurs fois, avant octobre 2024.

 */

export class LastCovidVaccine extends BaseChoiceQuestion { 
    constructor(props: ItemProps) {
        super(props, 'Q35n', 'single');
        this.setOptions({
            questionText: _T("vaccination.Q35n.text", "Did yout get a vaccine covid during previous seasons")
        });
    }

    getResponses(): OptionDef[] {
        return [
            as_option('1', _T("vaccination.Q35n.option.yes_last", "Yes, during last season")),
            as_option('2', _T("vaccination.Q35n.option.yes_before", "Yes, before last season")),
            as_option("0",  _T("vaccination.Q35n.option.never","No, never"))
        ];
    }

    getHelpGroupContent() { 
        return createDefaultHelpGroup("vaccination.Q35n");
    }
}


/**
 * CovidVac: single choice question about vaccination status
 */
export class CovidVacThisSeason extends ItemQuestion {

    constructor(props: ItemProps) {
        super(props,  'Q35v2');
    }

    buildItem():SurveyItem {
        return SurveyItems.singleChoice({
            parentKey: this.parentKey,
            itemKey: this.itemKey,
            isRequired: this.isRequired,
            condition: this.condition,
            questionText: _T("vaccination.Q35v2.title.0", "Have you received a COVID-19 vaccine this season?"),
            helpGroupContent: this.getHelpGroupContent(),
            responseOptions: this.getResponses()
        });
    }

    getResponses(): OptionDef[] {

        const codes = ResponseEncoding.covid_vac;

        return [
            {
                key: codes.yes, role: 'option',
                content: _T("vaccination.Q35v2.options.yes", "Yes")
            },
            {
                key: codes.no, role: 'option',
                content: _T("vaccination.Q35v2.options.no", "No")
            },
            {
                key: codes.dontknow, role: 'option',
                content: _T("vaccination.Q35v2.options.dnk", "I don't know/can't remember.")
            },
        ];
    }

    getHelpGroupContent() {
        return createDefaultHelpGroup(this.key);
    }
}

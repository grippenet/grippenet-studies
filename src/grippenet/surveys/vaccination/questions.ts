import { OptionDef } from "case-editor-tools/surveys/types";
import { text_how_answer, text_why_asking } from "../../../../common/studies/common/questionPools";
import {  questionPools as pool, _T, responses as common_responses, ItemQuestion, ItemProps, BaseChoiceQuestion, BaseQuestionOptions } from "../../../common"
import { as_input_option, as_option, french, OptionList, OverridenResponses, ResponseOveriddes } from "../../../utils";
import { starting_year } from "../../constants";

// Q10c.11
// Q10d.15, 16, 17, 18, 19

const encoding = common_responses.vaccination;

export class FluVaccineThisSeasonReasonFor extends pool.vaccination.FluVaccineThisSeasonReasonFor implements OverridenResponses {
    
    getResponses(): OptionDef[] {
        const options = super.getResponses();
        const codes = encoding.flu_vac_reason;
        const list = new OptionList(options);
        list.insertBeforeKey(codes.riskgroup, as_option(codes.voucher, french("J’ai eu un bon de vaccination")) );
        list.insertAfterKey(codes.riskgroup, as_option(codes.pregnant_baby, french("Je suis enceinte et je souhaite protéger mon bébé contre la grippe")));
        return list.values();
    }

    getResponseOverrides(): ResponseOveriddes { 
        const codes = encoding.flu_vac_reason;
        const o : ResponseOveriddes = {};
        o[codes.riskgroup] = [ codes.voucher, codes.pregnant_baby ];
        return o;
    }
}

export class FluVaccineThisSeasonReasonAgainst extends pool.vaccination.FluVaccineThisSeasonReasonAgainst implements OverridenResponses {

    getResponses(): OptionDef[] {
        const options = super.getResponses();
        const codes = encoding.flu_notvac_reason; 
        const list = new OptionList(options);
        list.insertAfterKey(codes.offer, 
            as_option(codes.advised_pregnancy, french("On m'a déconseillé de me faire vacciner car je suis enceinte")),
            as_option(codes.pregnant_baby, french("Je suis enceinte et je crains que le vaccin présente un danger pour mon bébé"))
        );

        list.insertAfterKey(codes.minor_illness,
            as_option(codes.avoid_healthseek, french("Du fait de la pandémie de COVID-19, j’évite de me rendre chez le médecin ou à la pharmacie")),
            as_option(codes.risk_covid, french("Je crains que le vaccin contre la grippe saisonnière augmente mon risque d’attraper la COVID-19 ")),
            as_input_option(codes.covid_other, 
                french("Autre raison en lien avec la COVID-19 (champs libre, préciser)")
            )
        );
        
        return list.values();        
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
        const r = super.getResponses();
        const list = new OptionList(r);
        
        list.insertAfterKey('20', 
            as_option('18', _T("vaccination.Q35m.option.18", "counter indication")),
            as_option('19', _T("vaccination.Q35m.option.19", "bad experience with previous vaccine"))
        )

        return list.values();
    }
}

export class FluVaccinationByWhom extends BaseChoiceQuestion {
    
    constructor(props: ItemProps) {
        super(props, 'Q10e', 'single');
        this.setOptions({
            questionText: french("Par qui avez-vous été vacciné ?")
        });
    }

    getResponses(): OptionDef[] {
        return [
            as_option('1', french("Par un médecin généraliste")),
            as_option('2', french('Par un infirmier')),
            as_option('3', french('Par un sage-femme')),
            as_option('4', french('Par un pharmacien')),
            as_option('5', french('Par un médecin ou infirmier du travail')),
            as_input_option('6', french("Par un professionnel d’une autre spécialité (préciser)")),
        ];
    }
    
}


export class FluVaccinationVoucher extends BaseChoiceQuestion { 
    constructor(props: ItemProps) {
        super(props, 'Q18', 'single');
        this.setOptions({
            questionText: french("Avez-vous eu un bon de vaccination contre la grippe cette année (depuis octobre "+starting_year+")?")
        });
    }

    getResponses(): OptionDef[] {
        return [
            as_option('1', french("Oui")),
            as_option('0', french("None")),
            as_option("2", french("Je ne sais pas / ne me souviens pas"))
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


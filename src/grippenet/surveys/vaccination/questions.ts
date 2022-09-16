import { OptionDef } from "case-editor-tools/surveys/types";
import { LanguageMap } from "../../../../common/studies/common/languages";
import {  questionPools as pool, _T, responses as common_responses, ItemQuestion, ItemProps, SingleItemDependency, BaseChoiceQuestion, BaseQuestionOptions } from "../../../common"
import { as_input_option, as_option, french, OptionList, OverridenResponses, ResponseOveriddes } from "../../../utils";

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
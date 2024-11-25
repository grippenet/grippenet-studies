import {  text_how_answer,  text_why_asking } from "../../common/studies/common/questionPools";
import { trans_text } from "../common";


interface DefaultHelpGroupOptions {
    howAnswer?: boolean
    WhyAsking?: boolean
}

/**
 * Create a default help group wiht 2 sections : Why are we asking this and How answert this question
 * Prefix indicate the namespace of the translation (usually the question key in the survey)
 * @param prefix
 * @param opts 
 * @returns 
 */
export const createDefaultHelpGroup = (prefix: string, opts?: DefaultHelpGroupOptions) => {

    const oo = opts || {howAnswer: true, WhyAsking: true};

    const h = [];

    if(oo.WhyAsking) {
        h.push(
            text_why_asking(prefix + ".helpGroup.why_asking"),
            trans_text(prefix + ".helpGroup.asking_reason", prefix + " Question asking reason"),
        )
    }

    if(oo.howAnswer) {
        h.push(
            text_how_answer(prefix + ".helpGroup.how_answer"),
            trans_text(prefix + ".helpGroup.answer_tip", prefix + " Question answer tip"),
        )
    }

    if(!oo.howAnswer && !oo.WhyAsking) {
        console.warn("Empty helpgroup : Both part asking_reason and answer_tip are disabled in " + prefix);
    }

    return h;
}

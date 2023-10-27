import {  text_how_answer,  text_why_asking } from "../../common/studies/common/questionPools";
import { trans_text } from "../common";

export const createDefaultHelpGroup = (prefix: string) => {
    return [
        text_why_asking(prefix + ".helpGroup.why_asking"),
        trans_text(prefix + ".helpGroup.asking_reason", prefix + " Question asking reason"),
        text_how_answer(prefix + ".helpGroup.how_answer"),
        trans_text(prefix + ".helpGroup.answer_tip", prefix + " Question answer tip"),
    ];
}

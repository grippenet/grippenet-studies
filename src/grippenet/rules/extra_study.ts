import { Expression } from "survey-engine/data_types";
import { ServerExpression as se } from "../../common";
import { GrippenetFlags as flags } from "../flags";
import { assignedSurveys, updateFlag, updateLastSubmission} from "./helpers";

export class ExtraStudyRulesBuilder {

    getSubmitRules(): Expression[] {
        const mozartKey = 'mozart';
        const puliKey = 'puli';

        const submitRules : Expression[] = [];

        if(mozartKey) {
            const handleMozart = se.ifThen(
                se.checkSurveyResponseKey(mozartKey),
                se.do(
                    updateFlag(flags.mozartS0.key, '1'),
                    assignedSurveys.remove(mozartKey, 'all'),
                    updateLastSubmission(flags.lastMozart.key)
                ),
            );
            
            submitRules.push(handleMozart);
        }

        if(puliKey) {
            const handlePuli = se.ifThen(
                se.checkSurveyResponseKey(puliKey),
                se.do(
                    assignedSurveys.remove(puliKey, 'all'),
                    updateLastSubmission(flags.lastPuli.key)
                ),
            );
            submitRules.push(handlePuli);
        }
        return submitRules;
    }
}
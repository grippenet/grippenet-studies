import { StudyEngine as se } from "case-editor-tools/expression-utils/studyEngineExpressions";
import { Expression } from "survey-engine/data_types";
import { RuleSet } from "./base"
import { mozartSurveyKey } from "../constants";

const create = (): Expression[]=> {

    const assignedSurveys = se.participantActions.assignedSurveys;
    
    const out: Expression[] = [];

    const exp = se.do(
            assignedSurveys.remove(mozartSurveyKey, 'all'),
        )
    out.push(exp);
   
    return out;
};

export const ruleset: RuleSet = {
    name : 'remove_mozart',
    rules: create
}

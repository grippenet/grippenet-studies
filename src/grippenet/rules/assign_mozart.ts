import { StudyEngine as se } from "case-editor-tools/expression-utils/studyEngineExpressions";
import { Expression } from "survey-engine/data_types";
import { RuleSet } from "./base"

const create = (): Expression[]=> {

    const assignedSurveys = se.participantActions.assignedSurveys;
    const hasSurveyKeyAssigned = se.participantState.hasSurveyKeyAssigned;

    const out: Expression[] = [];

    const mozartKey = 'mozart'

    const exp = se.do(
            assignedSurveys.remove(mozartKey, 'all'),
            assignedSurveys.add(mozartKey, 'prio')
        )
    out.push(exp);
   
    return out;
};

export const ruleset: RuleSet = {
    name : 'assign_mozart',
    rules: create
}

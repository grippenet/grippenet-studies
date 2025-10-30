import { StudyEngine as se } from "case-editor-tools/expression-utils/studyEngineExpressions";
import { Expression } from "survey-engine/data_types";
import { RuleSet } from "./base"

const create = (): Expression[]=> {

    const assignedSurveys = se.participantActions.assignedSurveys;
    const hasSurveyKeyAssigned = se.participantState.hasSurveyKeyAssigned;

    const out: Expression[] = [];

    const vacKey = 'vaccination'

    const exp = se.ifThen(
        hasSurveyKeyAssigned(vacKey),
        se.do(
            assignedSurveys.remove(vacKey, 'all'),
            assignedSurveys.add(vacKey, 'prio')
        )
    );
    out.push(exp);
   
    return out;
};

export const ruleset: RuleSet = {
    name : 'assign_vaccination_prio',
    rules: create
}

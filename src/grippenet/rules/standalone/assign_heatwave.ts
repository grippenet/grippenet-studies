import { StudyEngine as se } from "case-editor-tools/expression-utils/studyEngineExpressions";
import { Expression } from "survey-engine/data_types";
import { RuleSet } from "./base"
import { HeatwaveKeys } from "../../../../common/studies/heatwave/surveys/keys";

const create = (): Expression[]=> {

    const assignedSurveys = se.participantActions.assignedSurveys;
    
    const out: Expression[] = [];

    const backgroundKey = HeatwaveKeys.BackgroundSurvey

    const exp = se.do(
            assignedSurveys.remove(backgroundKey, 'all'),
            assignedSurveys.add(backgroundKey, 'prio')
        )
    out.push(exp);
   
    return out;
};

export const ruleset: RuleSet = {
    name : 'assign_heatwave',
    rules: create
}

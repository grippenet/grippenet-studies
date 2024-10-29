import { StudyEngine as se } from "case-editor-tools/expression-utils/studyEngineExpressions";
import { Expression } from "survey-engine/data_types";
import { RuleSet } from "./base"
import { intakeSurveyKey, vaccinationSurveyKey, weeklySurveyKey } from "../../constants";

const create = (): Expression[]=> {

    const assignedSurveys = se.participantActions.assignedSurveys;
    const out: Expression[] = [];
    
    const exp =  se.do(
            assignedSurveys.remove(intakeSurveyKey, 'all'),
            assignedSurveys.remove(weeklySurveyKey, 'all'),
            assignedSurveys.remove(vaccinationSurveyKey, 'all'),
            assignedSurveys.add(intakeSurveyKey, 'prio'),
            assignedSurveys.add(vaccinationSurveyKey, 'prio'),
        );

    out.push(exp);
   
    return out;
};

export const ruleset: RuleSet = {
    name : 'assign_survey_all',
    rules: create
}

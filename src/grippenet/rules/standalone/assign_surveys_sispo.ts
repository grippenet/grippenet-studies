import { StudyEngine as se } from "case-editor-tools/expression-utils/studyEngineExpressions";
import { Expression } from "survey-engine/data_types";
import { RuleSet } from "./base"
import { GrippenetFlags } from "../../flags";
import { intakeSurveyKey, vaccinationSurveyKey, weeklySurveyKey } from "../../constants";

const create = (): Expression[]=> {

    const assignedSurveys = se.participantActions.assignedSurveys;
    const hasParticipantFlagKey = se.participantState.hasParticipantFlagKey;
    const sispoFlag = GrippenetFlags.sispo;
    const out: Expression[] = [];

    
    const exp = se.ifThen(
        hasParticipantFlagKey(sispoFlag.key),
        se.do(
            assignedSurveys.remove(intakeSurveyKey, 'all'),
            assignedSurveys.remove(weeklySurveyKey, 'all'),
            se.if(
                se.gt(se.participantState.getParticipantFlagValueAsNum('lastIntakeTime'), 1731888000), // 2024-11-18
                assignedSurveys.add(intakeSurveyKey, 'optional'),
                assignedSurveys.add(intakeSurveyKey, 'prio'),
            ),
            assignedSurveys.add(weeklySurveyKey, 'prio'),
        ));

    out.push(exp);
   
    return out;
};

export const ruleset: RuleSet = {
    name : 'assign_survey_sispo',
    rules: create
}

import { StudyEngine as se } from "case-editor-tools/expression-utils/studyEngineExpressions";
import { Expression } from "survey-engine/data_types";
import { RuleSet } from "./base"
import { GrippenetFlags } from "../../flags";
import { intakeSurveyKey, vaccinationSurveyKey, weeklySurveyKey } from "../../constants";

const flagSispo = GrippenetFlags.sispo.key;

const create = (): Expression[]=> {

    const assignedSurveys = se.participantActions.assignedSurveys;
   
    const rule = se.if(
        se.not(
            se.participantState.hasParticipantFlagKeyAndValue(flagSispo, '1')
        ),
        se.do(
            assignedSurveys.remove(intakeSurveyKey, 'all'),
            assignedSurveys.remove(weeklySurveyKey, 'all'),
        )
    );
   
    return [
        rule
    ];
};

export const ruleset: RuleSet = {
    name : 'remove_surveys_nonsispo',
    rules: create
}

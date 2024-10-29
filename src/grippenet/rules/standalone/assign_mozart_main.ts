import { StudyEngine as se } from "case-editor-tools/expression-utils/studyEngineExpressions";
import { Expression } from "survey-engine/data_types";
import { RuleSet } from "./base"
import { GrippenetFlags } from "../../flags";
import { mozartSurveyKey } from "../../constants";

const create = (): Expression[]=> {

    const assignedSurveys = se.participantActions.assignedSurveys;
    const hasParticipantFlagKeyAndValue = se.participantState.hasParticipantFlagKeyAndValue;
    const mainFlag = GrippenetFlags.main;
    const out: Expression[] = [];

    const mozartKey = mozartSurveyKey;

    const exp = se.ifThen(
        hasParticipantFlagKeyAndValue(mainFlag.key, mainFlag.values.yes),
        se.do(
            assignedSurveys.remove(mozartKey, 'all'),
            assignedSurveys.add(mozartKey, 'prio')
        ));

    out.push(exp);
   
    return out;
};

export const ruleset: RuleSet = {
    name : 'assign_mozart_main',
    rules: create
}

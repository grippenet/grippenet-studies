import { StudyEngine as se } from "case-editor-tools/expression-utils/studyEngineExpressions";
import { Expression } from "survey-engine/data_types";
import { intakeSurveyKey } from "../constants";
import { GrippenetFlags } from "../flags";
import { RuleSet } from "./base"

const create = (): Expression[]=> {

    const assignedSurveys = se.participantActions.assignedSurveys;

    const needLocationFlag = GrippenetFlags.needLocation;

    const hasParticipantFlagKeyAndValue = se.participantState.hasParticipantFlagKeyAndValue;
    
    const out: Expression[] = [];
  
    const exp = se.ifThen(
        hasParticipantFlagKeyAndValue(needLocationFlag.key, needLocationFlag.values.yes),
        se.do(
            assignedSurveys.remove(intakeSurveyKey, 'all'),
            assignedSurveys.add(intakeSurveyKey, 'prio')
        )
    );

    out.push(exp);
   
    return out;
};

export const ruleset: RuleSet = {
    name : 'location_catchup',
    rules: create
}

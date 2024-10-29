import { Expression } from "survey-engine/data_types";
import { ServerExpression as se } from "../../common";

export const assignedSurveys = se.participantActions.assignedSurveys;
export const updateFlag = se.participantActions.updateFlag;
export const hasParticipantFlagKeyAndValue = se.participantState.hasParticipantFlagKeyAndValue
export const hasSurveyKeyAssigned = se.participantState.hasSurveyKeyAssigned;

export const updateLastSubmission = (key: string) => {
    return  updateFlag(key, se.timestampWithOffset({seconds:0}) )
}

export const onSurveySubmitted = (surveyKey: string, ...expressions: Expression[])=> {
    return se.ifThen(
        se.checkSurveyResponseKey(surveyKey),
        se.do(...expressions)
    );
}

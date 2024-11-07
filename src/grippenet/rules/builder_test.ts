import { AbstractStudyRulesBuilder, responses } from "../../common";
import { GrippenetKeys } from "../keys";
import { ServerExpression as se } from "../../common";
import { Expression } from "survey-engine/data_types";
import { updateLastSubmission } from "./helpers";
import { expWithArgs } from "case-editor-tools/surveys/utils/simple-generators";

const hasFlag = se.participantState.hasParticipantFlagKey;
const updateFlag = se.participantActions.updateFlag;
const getFlagValueAsNum = se.participantState.getParticipantFlagValueAsNum;
const add = (...values: (Expression|number)[]):Expression => {
    return expWithArgs('sum', ...values);
};


const incrementFlag = (flagName: string) => {
    return se.if(
        hasFlag(flagName),
        updateFlag(flagName, add(getFlagValueAsNum(flagName), 1)),
        updateFlag(flagName, 1)
    );
}

export class GrippenetRulesTestBuilder extends AbstractStudyRulesBuilder {

    protected keys: GrippenetKeys;

    constructor(keys: GrippenetKeys) {
        super();
        this.keys = keys;
    }

    create(): void {
       
        const intakeKey = this.keys.intake.key;
        const weeklyKey = this.keys.weekly.key;

        const submitRules: Expression[] = [];

        const handleIntake = se.ifThen(
            se.checkSurveyResponseKey(intakeKey),
            updateLastSubmission(intakeKey),
            incrementFlag('intakeC')
        );

        const handleWeekly = se.ifThen(
            se.checkSurveyResponseKey(weeklyKey),
            updateLastSubmission(weeklyKey),
            incrementFlag('weeklyC')
        );

        submitRules.push(handleIntake);
        submitRules.push(handleWeekly);

        this.rules.submit = submitRules;

    }
}
import { StudyRulesBuilder } from "../common";
import { StudyEngine as se } from "case-editor-tools/expression-utils/studyEngineExpressions";
import { GrippenetFlags } from "./flags";
import { GrippenetKeys } from "./keys";
import { responseGroupKey } from "case-editor-tools/constants/key-definitions";
import { singleChoicePrefix } from "../../common/studies/common/questionPools";


export function response_item_key(name:string) {
    return responseGroupKey + '.' + name;
}


export class GrippenetRulesBuilder extends StudyRulesBuilder {

    constructor(keys: GrippenetKeys) {
        super(keys);
    }

    extraRules(): void {
        
        const reminder_weekly = GrippenetFlags.reminder_weekly;

        const keys = this.keys as GrippenetKeys;

        const reminder_keys = keys.reminders;

        this.rules.entry.push(
            se.participantActions.updateFlag(reminder_weekly.key, reminder_weekly.values.yes)
        );

        const reminder_weekly_rg = singleChoicePrefix

        const updateReminder = se.ifThen(
            se.checkSurveyResponseKey(reminder_keys.survey),
            se.do(
                se.participantActions.updateFlag(reminder_weekly.key, se.getResponseValueAsStr(reminder_keys.reminder_weekly, reminder_weekly_rg))
            )
        );

        this.rules.submit.push(updateReminder);
        
    }
}
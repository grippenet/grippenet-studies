import { StudyEngine as se } from "case-editor-tools/expression-utils/studyEngineExpressions";
import { Expression } from "survey-engine/data_types";
import { GrippenetFlags } from "../flags";
import { RuleSet } from "./base"

const create = (): Expression[]=> {

    /*
    const out: Expression[] = [];

    const flag_reminder = GrippenetFlags.reminder_weekly;

    out.push(se.participantActions.updateFlag(flag_reminder.key, flag_reminder.values.yes) );

    return out;
    */
   return [];
};

export const ruleset: RuleSet = {
    name : 'update_reminder_weekly',
    rules: create
}

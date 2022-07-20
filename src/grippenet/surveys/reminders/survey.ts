import { SurveyDefinition } from "case-editor-tools/surveys/types";
import { english, add_meta, as_option} from "../utils";
import {  SurveyItem, SurveySingleItem } from "survey-engine/data_types";
import { OptionDef } from "case-editor-tools/surveys/types";
import { SurveyItems } from 'case-editor-tools/surveys';
import { ItemQuestion } from "../../../../common/studies/common/questionPools";


export class ReminderSurvey extends SurveyDefinition {

    weeklyReminder: SurveyItem

    constructor(meta:Map<string,string>) {
        super({
            surveyKey: 'reminders',
            name:add_meta( english("reminders study"), meta),
            description: english("Private survey holding reminders preference"),
            durationText: english("Not relevant")
        });

        const weeklyReminder = SurveyItems.singleChoice({
            parentKey: this.key,
            itemKey: 'weekly',
            questionText: english("Receive weekly reminder"),
            responseOptions: [
                as_option("1", english("yes")),
                as_option("0", english("no"))
            ]
        });
        this.weeklyReminder = weeklyReminder;
    }

    buildSurvey(): void {
        this.addItem(this.weeklyReminder);
    }

    getWeeklyReminderKey(): string {
        if(!this.weeklyReminder) {
            throw new Error("weeklyReminder is undefined");
        }
        return this.weeklyReminder.key;
    }

}
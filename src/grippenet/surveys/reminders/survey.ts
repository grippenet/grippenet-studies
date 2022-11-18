import {  SurveyItem } from "survey-engine/data_types";
import { SurveyItems } from 'case-editor-tools/surveys';
import { SurveyBuilder, as_option } from "../../../common";


const english = (text:string) => {
    return new Map([ ['en', text]]);
}

export class ReminderSurvey extends SurveyBuilder {

    weeklyReminder: SurveyItem

    constructor(meta:Map<string,string>) {
        super({
            surveyKey: 'reminders',
            name:english("reminders study"),
            description: english("Private survey holding reminders preference"),
            durationText: english("Not relevant"),
            metadata: meta,
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
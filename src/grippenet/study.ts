import { IntakeDef } from "./surveys/intake/survey";
import { WeeklyDef } from "./surveys/weekly/survey";
import { VaccinationDef } from "./surveys/vaccination/vaccination";
import { StudyBuilder, StudyRulesBuilder, SurveyKeys } from "../common";
import { GrippenetRulesBuilder } from "./rules";
import { ReminderSurvey } from "./surveys/reminders/survey";
import { GrippenetKeys } from "./keys";

export class GrippenetStudyBuilder extends StudyBuilder {

    constructor() {
        super('grippenet');
    }

    build() {

        const meta = new Map<string, string>();

        meta.set('timestamp', Date.now().toString(36));

        const intake = new IntakeDef(meta);
        const weekly = new WeeklyDef(meta);
        const vacc = new VaccinationDef(meta);
        const reminders = new ReminderSurvey(meta);

        this.surveys = [
            intake,
            weekly,
            vacc,
            reminders
        ];

        // Keys inform the rules builder of the key of all dependent questions
        const keys: GrippenetKeys = {
            intakeKey: intake.key,
            intakeBirthDateKey: intake.getBirthDateKey(),
            weeklyKey: weekly.key,
            weeklySameIllnessKey: weekly.getSameIllnessKey(),
            vacKey: vacc.key,
            reminders: {
                survey: reminders.key,
                reminder_weekly: reminders.getWeeklyReminderKey()
            }
        };

        const builder = new GrippenetRulesBuilder(keys);

        this.studyRules = builder.build();

    }

}

import { IntakeDef } from "./surveys/intake/survey";
import { WeeklyDef } from "./surveys/weekly/survey";
import { VaccinationDef } from "./surveys/vaccination/vaccination";
import { StudyBuilder, StudyRulesBuilder, SurveyKeys } from "../common";

export class GrippenetStudyBuilder extends StudyBuilder {

    constructor() {
        super('grippenet');
    }

    build() {

        const intake = new IntakeDef();
        const weekly = new WeeklyDef();
        const vacc = new VaccinationDef();

        this.surveys = [
            intake,
            weekly,
            vacc
        ];

        // Keys inform the rules builder of the key of all dependent questions
        const keys: SurveyKeys = {
            intakeKey: intake.key,
            intakeBirthDateKey: intake.getBirthDateKey(),
            weeklyKey: weekly.key,
            weeklySameIllnessKey: weekly.getSameIllnessKey(),
            vacKey: vacc.key,
        };

        const builder = new StudyRulesBuilder(keys);

        this.studyRules = builder.build();

    }

}

import { IntakeDef } from "./surveys/intake/survey";
import { WeeklyDef } from "./surveys/weekly/survey";
import { VaccinationDef } from "./surveys/vaccination/vaccination";
import { StudyBuilder, StudyRulesBuilder, SurveyKeys } from "../common";
import { MeansOfTransport } from "../../common/studies/common/questionPools/intakeQuestions";

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

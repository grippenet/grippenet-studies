import { IntakeDef } from "./surveys/intake/survey";
import { WeeklyDef } from "./surveys/weekly/survey";
import { VaccinationDef } from "./surveys/vaccination/vaccination";
import { StudyBuilder } from "../common";
import { GrippenetRulesBuilder } from "./rules/builder";
import { GrippenetKeys } from "./keys";
import { GrippenetRulesOffSeasonBuilder } from "./rules/builder_offseason";
import { GrippenetRulesTestBuilder } from "./rules/builder_test";
import { StudyConfig } from "./config";

export class GrippenetStudyBuilder extends StudyBuilder {

    constructor() {
        super('grippenet');
    }

    build() {

        const studyConfig = new StudyConfig(2024, '2024-11-25', '2023-11-10');

        const meta = new Map<string, string>();

        meta.set('timestamp', Date.now().toString(36));
        meta.set('season', ''+ studyConfig.season);

        const intake = new IntakeDef(meta);
        const weekly = new WeeklyDef(meta);
        const vacc = new VaccinationDef(meta);
 
        this.surveys = [
            intake,
            weekly,
            vacc,
        ];

        // Keys inform the rules builder of the key of all dependent questions
        const keys: GrippenetKeys = {
            intake: intake,
            weekly: weekly,
            vaccination: vacc,
        };

        const builder = new GrippenetRulesBuilder(keys, studyConfig);
        this.studyRules = builder.build();
        
        const offseasonBuilder = new GrippenetRulesOffSeasonBuilder(keys);
        const offseasonRules = offseasonBuilder.build().get();

        this.addCustomStudyRules('offseason', offseasonRules);

        const testBuilder = new GrippenetRulesTestBuilder(keys);
        this.addCustomStudyRules('testRules', testBuilder.build().get());
    }

}

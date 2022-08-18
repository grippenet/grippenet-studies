import { StudyBuilder, StudyRulesBuilder, SurveyKeys } from "./common";
import { TestDef } from "./test/test";
import { study_exporter } from "../common/tools/exporter";

export class TestStudyBuilder extends StudyBuilder {

    constructor() {
        super('test');
    }

    build() {
        
        const test = new TestDef();
        
        this.surveys = [
            test,
        ];
    }

}

const builder = new TestStudyBuilder();

builder.build();

const study = builder.getStudy();

study_exporter([study], true);
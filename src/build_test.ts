import { StudyBuilder } from "./common";
import { study_exporter } from "../common/tools/exporter";
import "../common/studies/common/languages/fr";
import "./grippenet/languages";
import { TestComponentSurvey } from "./grippenet/surveys/test/survey";

class TestStudy extends StudyBuilder {
    constructor() {
        super('test');
    }

    build() {

        const meta = new Map<string, string>();

        meta.set('timestamp', Date.now().toString(36));

        const main = new TestComponentSurvey(meta);
        
        this.surveys = [
            main,
        ];
    }
}

const builder = new TestStudy();

builder.build();

const study = builder.getStudy();

study_exporter([study]);


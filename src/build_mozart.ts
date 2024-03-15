import { StudyBuilder } from "./common";
import { MozartSurvey } from "./mozart/survey";
import { study_exporter } from "../common/tools/exporter";
import "../common/studies/common/languages/fr";
import "./grippenet/languages";

class MozartStudy extends StudyBuilder {
    constructor() {
        super('mozart');
    }

    build() {

        const meta = new Map<string, string>();

        meta.set('timestamp', Date.now().toString(36));

        const main = new MozartSurvey(meta);
        
        this.surveys = [
            main,
        ];
    }
}

const builder = new MozartStudy();

builder.build();

const study = builder.getStudy();

study_exporter([study], {'check': true, 'missing': true, 'classNames': true, 'document': true, languages: ['fr']});


import { StudyBuilder } from "./common";
import { PuliSurvey } from "./puli/survey";
import { study_exporter } from "../common/tools/exporter";
import "../common/studies/common/languages/fr";
import "./grippenet/languages";

class PuliStudy extends StudyBuilder {
    constructor() {
        super('puli');
    }

    build() {

        const meta = new Map<string, string>();

        meta.set('timestamp', Date.now().toString(36));

        const main = new PuliSurvey(meta);
        
        this.surveys = [
            main,
        ];
    }
}

const builder = new PuliStudy();

builder.build();

const study = builder.getStudy();

study_exporter([study], {'check': true, 'missing': true, 'classNames': true, languages: ['fr']});


import { StudyBuilder, LanguageHelpers } from "./common";
import * as fs from "fs";
import { join } from "path";
import { HeatwaveBackgroundSurvey, HeatwaveSymptomsSurvey } from "../common/studies/heatwave/surveys";
import { study_exporter } from "../common/tools/exporter";
import { DocumentExporterPlugin } from "../common/tools/exporter/documents";

class HeatwaveStudy extends StudyBuilder {
    constructor() {
        super('heatwave');
    }

    build() {

        const meta = new Map<string, string>();

        meta.set('timestamp', Date.now().toString(36));

        const background = new HeatwaveBackgroundSurvey(meta);

        const symptoms = new HeatwaveSymptomsSurvey(meta);

        this.surveys = [
            background,
            symptoms,
        ];
    }
}

LanguageHelpers.verboseMissing = false;

const languages = ['fr'];

languages.forEach(code => {
    const p = join('common/studies/heatwave/languages/' + code + '.json');
    if(fs.existsSync(p)) {
        console.log("Importing language "+ code);
        const d = fs.readFileSync(p, 'utf8');
        const trans = JSON.parse(d);
        LanguageHelpers.addLanguage(code, trans);
    } else {
        LanguageHelpers.addLanguage(code, {});
    }
});

console.log(languages);

const builder = new HeatwaveStudy();

builder.build();

const study = builder.getStudy();

const docPlugin = new DocumentExporterPlugin();

study_exporter([study], {'check': true, 'missing': true, languages: languages, plugins: [docPlugin]});


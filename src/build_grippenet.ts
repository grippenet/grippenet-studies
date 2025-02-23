import { CommonStudyBuilder } from "../common/studies/common";
import { buildMissing, json_export, study_exporter } from "../common/tools/exporter";

import "../common/studies/common/languages/fr";
import "./grippenet/languages";

import { GrippenetStudyBuilder } from "./grippenet/study";
import { extra_texts } from "./utils";
import { DocumentExporterPlugin } from "../common/tools/exporter/documents";

const builder = new GrippenetStudyBuilder();

builder.build();

const study = builder.getStudy();

const mappingFile = 'output/grippenet/surveys_mapping.json';

const docPlugin = new DocumentExporterPlugin();
docPlugin.loadMappingFromJson(mappingFile);

const opts = {
    'check': true, 
    'missing': true, 
    'classNames': true, 
    languages: ['fr'], 
    plugins: [ docPlugin ],
}
study_exporter([study], opts );

const extra = Object.fromEntries(Array.from(extra_texts.entries()).map((v) => {
    return [v[0], Object.fromEntries(v[1].entries())];
}));

json_export('output/grippenet/extra_trans.json', extra);
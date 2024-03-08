import { CommonStudyBuilder } from "../common/studies/common";
import { buildMissing, json_export, study_exporter } from "../common/tools/exporter";

import "../common/studies/common/languages/fr";
import "./grippenet/languages";

import { GrippenetStudyBuilder } from "./grippenet/study";
import { extra_texts } from "./utils";

const builder = new GrippenetStudyBuilder();

builder.build();

const study = builder.getStudy();

study_exporter([study], {'check': true, 'missing': true, 'classNames': true, 'document': true, languages: ['fr']});

const extra = Object.fromEntries(Array.from(extra_texts.entries()).map((v) => {
    return [v[0], Object.fromEntries(v[1].entries())];
}));

json_export('output/grippenet/extra_trans.json', extra);
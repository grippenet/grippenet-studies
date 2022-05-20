import { CommonStudyBuilder } from "../common/studies/common";
import { study_exporter } from "../common/tools/exporter";
import "../common/studies/common/languages/fr";
import { GrippenetStudyBuilder } from "./grippenet/study";

const builder = new GrippenetStudyBuilder();

builder.build();

const study = builder.getStudy();

study_exporter([study]);

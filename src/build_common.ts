import { CommonStudyBuilder } from "../common/studies/common";
import { study_exporter } from "../common/tools/exporter";

const builder = new CommonStudyBuilder();

builder.build();

const study = builder.getStudy();

study_exporter([study]);
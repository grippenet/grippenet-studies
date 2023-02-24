
import { SurveyKeys } from "../common";
import { Item, SurveyDefinition } from "case-editor-tools/surveys/types";
import { IntakeSurveyDefinition } from "../../common/studies/common/keys";

interface GrippenetIntakeDefinition extends IntakeSurveyDefinition {
    getPostalCodeItem(): Item
}

export interface GrippenetKeys extends SurveyKeys {
    intake: GrippenetIntakeDefinition
    mozart?: SurveyDefinition
}
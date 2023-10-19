
import { SurveyKeys } from "../common";
import { Item, SurveyDefinition } from "case-editor-tools/surveys/types";
import { IntakeSurveyDefinition, WeeklySurveyDefinition } from "../../common/studies/common/keys";

interface GrippenetIntakeDefinition extends IntakeSurveyDefinition {
    getPostalCodeItem(): Item
}

interface GrippenetWeeklyDefinition extends WeeklySurveyDefinition {
    getAnsmDeliveryFailureItem(): Item
}


export interface GrippenetKeys extends SurveyKeys {
    intake: GrippenetIntakeDefinition
    weekly: GrippenetWeeklyDefinition
    mozart?: SurveyDefinition
}
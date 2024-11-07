
import { SurveyKeys } from "../common";
import { Item, SurveyDefinition } from "case-editor-tools/surveys/types";
import { IntakeSurveyDefinition, WeeklySurveyDefinition } from "../../common/studies/common/keys";
import { ResponseRef } from "./types";

interface GrippenetIntakeDefinition extends IntakeSurveyDefinition {
    getPostalCodeItem(): Item
    getSmoking(): Item;
}

interface GrippenetWeeklyDefinition extends WeeklySurveyDefinition {
   // getAnsmDeliveryFailureItem(): Item
   getHasMoreQuestion(): Item
}

interface GrippenetVaccinationDefinition extends SurveyDefinition {
    getInfluenzaPreventionResponses(): ResponseRef[]
}

export interface GrippenetKeys extends SurveyKeys {
    intake: GrippenetIntakeDefinition
    weekly: GrippenetWeeklyDefinition
    vaccination: GrippenetVaccinationDefinition
    mozart?: SurveyDefinition
}
import { AbstractStudyRulesBuilder, responses } from "../../common";
import { GrippenetKeys } from "../keys";
import { responseGroupKey } from "case-editor-tools/constants/key-definitions";
import { ServerExpression as se } from "../../common";
import { Expression } from "survey-engine/data_types";
import WeeklyResponses from "../surveys/weekly/responses";
import { GrippenetFlags as flags } from "../flags";
import { Duration,  } from "case-editor-tools/types/duration";
import { PuliSurvey } from "../../puli/survey";
import { ExtraStudyRulesBuilder } from "./extra_study";

export function response_item_key(name:string) {
    return responseGroupKey + '.' + name;
}

const IntakeResponses = responses.intake;

export class GrippenetRulesOffSeasonBuilder extends AbstractStudyRulesBuilder {

    constructor(keys: GrippenetKeys) {
        super();
    }

    create(): void {
       
        const submitRules: Expression[] = [
        ];

        const extra = new ExtraStudyRulesBuilder();

        submitRules.push(...extra.getSubmitRules());
        
        //this.rules.entry = entryRules;
        this.rules.submit = submitRules;

    }
}
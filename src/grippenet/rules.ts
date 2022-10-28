import { StudyRulesBuilder } from "../common";
import { ServerExpression as se } from "../common";
import { GrippenetFlags } from "./flags";
import { GrippenetKeys } from "./keys";
import { responseGroupKey } from "case-editor-tools/constants/key-definitions";
import { singleChoicePrefix } from "../../common/studies/common/questionPools";


export function response_item_key(name:string) {
    return responseGroupKey + '.' + name;
}


export class GrippenetRulesBuilder extends StudyRulesBuilder {

    constructor(keys: GrippenetKeys) {
        super(keys);
    }

    extraRules(): void {
 
        const keys = this.keys as GrippenetKeys;        
    }
}
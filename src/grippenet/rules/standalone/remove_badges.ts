import { StudyEngine as se } from "case-editor-tools/expression-utils/studyEngineExpressions";
import { Expression } from "survey-engine/data_types";
import { RuleSet } from "./base"
import { BadgeDefinitions } from "../../../badge/definition";

const create = (): Expression[]=> {

    const removeFlag = se.participantActions.removeFlag;

    const badges = BadgeDefinitions;

    const out: Expression[] = [];

    const to_remove : string[] = [];
    
    Object.entries(BadgeDefinitions).forEach((e)=> {
        const [name, def] = e;
        if(def.seasonal) {
            to_remove.push(def.flag);
        }
    })

    const remove_actions = to_remove.map(n => removeFlag(n))

    const exp = se.do(
        ...remove_actions       
    );
    out.push(exp);
   
    return out;
};

export const ruleset: RuleSet = {
    name : 'remove_badges',
    rules: create
}

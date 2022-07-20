import { export_json, ExpressionGenerator } from "./grippenet/rules/base";
import { ruleset } from "./grippenet/rules/update_reminder_weekly";
import { Expression } from 'survey-engine/data_types';

function as_exp(exp: ExpressionGenerator): Expression[] {
    if(typeof(exp) == "function") {
        return exp();
    }
    return exp as Expression[];
}

export_json(as_exp(ruleset.rules), "output/grippenet/rules/" + ruleset.name);

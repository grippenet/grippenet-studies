import { export_json, ExpressionGenerator } from "./grippenet/rules/base";
import { Expression } from 'survey-engine/data_types';

function as_exp(exp: ExpressionGenerator): Expression[] {
    if(typeof(exp) == "function") {
        return exp();
    }
    return exp as Expression[];
}

const modules: string[] = [
    "./grippenet/rules/assign_mozart",
    "./grippenet/rules/assign_mozart_main",
    "./grippenet/rules/location_catchup"
];


for(const name of modules) {    
    import(name).then((m)=> {
        console.log('Building ' + m.ruleset.name);
        export_json(as_exp(m.ruleset.rules), "output/grippenet/rules/" + m.ruleset.name + ".json");
    });
}






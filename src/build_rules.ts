import { export_json, ExpressionGenerator } from "./grippenet/rules/standalone/base";
import { Expression } from 'survey-engine/data_types';

function as_exp(exp: ExpressionGenerator): Expression[] {
    if(typeof(exp) == "function") {
        return exp();
    }
    return exp as Expression[];
}

const modules: string[] = [
    "./grippenet/rules/standalone/assign_mozart",
    "./grippenet/rules/standalone/assign_mozart_main",
    "./grippenet/rules/standalone/remove_mozart",
    //"./grippenet/rules/standalone/location_catchup",
    "./grippenet/rules/standalone/assign_surveys_all",
    "./grippenet/rules/standalone/assign_surveys_tester",
];




modules.forEach(name => {    
    import(name).then((m)=> {
        console.log('Building ' + m.ruleset.name);
        export_json(as_exp(m.ruleset.rules), "output/grippenet/rules/" + m.ruleset.name + ".json");
    });
});






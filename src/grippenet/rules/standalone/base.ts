import fs from 'fs';
import { Logger } from "case-editor-tools/logger";
import { Expression } from 'survey-engine/data_types';

export function export_json(object: any, fileName:string, pretty?:boolean) {
    try {
        fs.writeFileSync(fileName, JSON.stringify(object, undefined, pretty ? 2 : undefined));
    } catch (err) {
        Logger.error(err);
        return;
    }
}

export type ExpressionGenerator = Expression[]|(()=>Expression[]);

export interface RuleSet {
    name: string;
    rules: Expression[]|(()=>Expression[])
}
import {  SurveyItem } from "survey-engine/data_types";
import { SurveyItems } from 'case-editor-tools/surveys';
import { SurveyBuilder, as_option } from "../../../common";
import { PostalCode } from "../intake/questions";
import { french } from "../../../utils";
import { Item } from "case-editor-tools/surveys/types";
import { BMIQuestion } from "../../questions/bmi";

const fr = (text:string, id: string) =>{
    return french(text, id, id);
}

export class TestComponentSurvey extends SurveyBuilder {

    bmi: Item

    constructor(meta:Map<string,string>) {
        const rootKey = 'test';

        super({
            surveyKey: rootKey,
            name: fr("Test", "location.title"),
            description: fr("Test", "location.description"),
            durationText: fr("Quelques minutes (une seule question)", "location.duration"),
            metadata: meta,
        });

        const bmi = new BMIQuestion({
            parentKey: rootKey,
            questionText: fr("Quel est votre Indice de Masse Corporel", "test.bmi"),
            itemKey: 'q1',
            responseKey: 'bmi'
        });
        this.bmi = bmi;
    }

    buildSurvey(): void {
        this.addItem(this.bmi.get());
    }

    getBMIKey(): string {
        return this.bmi.key;
    }

}
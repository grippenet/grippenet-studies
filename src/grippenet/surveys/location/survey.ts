import {  SurveyItem } from "survey-engine/data_types";
import { SurveyItems } from 'case-editor-tools/surveys';
import { SurveyBuilder, as_option } from "../../../common";
import { PostalCode } from "../intake/questions";
import { french } from "../../../utils";
import { Item } from "case-editor-tools/surveys/types";

const fr = (text:string, id: string) =>{
    return french(text, id, id);
}

export class LocationSurvey extends SurveyBuilder {

    postalCode: Item

    constructor(meta:Map<string,string>) {
        const rootKey = 'location';

        super({
            surveyKey: rootKey,
            name: fr("Rattrapage localisation", "location.title"),
            description: fr("La question de la localisation du participant n'a pas eu de réponse dans le questionnaire préliminaire et cette information est nécessaire pour pouvoir ", "location.description"),
            durationText: fr("Quelques minutes (une seule question)", "location.duration"),
            metadata: meta,
        });

        const postalCode = new PostalCode({'isRequired': true, parentKey: rootKey });
        this.postalCode = postalCode;
    }

    buildSurvey(): void {
        this.addItem(this.postalCode.get());
    }

    getPostalCodeKey(): string {
        return this.postalCode.key;
    }

}
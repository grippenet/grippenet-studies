import {  ItemBuilder, _T, questionPools, ItemQuestion, ItemProps } from "../common"
import { SurveyDefinition } from "case-editor-tools/surveys/types";
import { SurveySingleItem } from "survey-engine/data_types";
import { french } from "../grippenet/surveys/utils";
import { postalCode } from "../grippenet/questions";

class PostalLookupQuestion extends ItemQuestion {

    buildItem(): SurveySingleItem {
        return postalCode({
           itemKey: this.itemKey,
           parentKey: this.parentKey,
           isRequired: this.isRequired,
           condition: this.getCondition(),
           helpGroupContent: this.getHelpGroupContent(),
           responseKey: 'lookup',
           questionText: french("Test")
        
        });
    }

    getHelpGroupContent() {
        return undefined;
    }
}

export class TestDef extends SurveyDefinition {

    items: ItemBuilder[];

   
    constructor() {
        super({
            surveyKey: 'test',
            name:  _T( "weekly.name.0", "Weekly questionnaire"),
            description:_T("weekly.description.0", "Please also report if you had no complaints."),
            durationText: _T( "weekly.typicalDuration.0", "Duration 1-5 minutes")
        });
        
        this.items = [];

        const rootKey = this.key

        const Q1 = new PostalLookupQuestion({parentKey:rootKey}, 'Q1');
        
        this.items.push(Q1);

    }

    buildSurvey() {
        for (const item of this.items) {
            this.addItem(item.get());
        }
    }
}

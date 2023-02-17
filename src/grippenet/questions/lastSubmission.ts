import { SurveyEngine as client, SurveyItems } from 'case-editor-tools/surveys';
import {  SurveyItem, SurveySingleItem } from "survey-engine/data_types";
import {  generateDateDisplayComp, generateLocStrings, generateTitleComponent } from "case-editor-tools/surveys/utils/simple-generators";
import { ItemQuestion, ItemProps, _T, textComponent } from '../../common';
import { ComponentEditor } from 'case-editor-tools/surveys/survey-editor/component-editor';

interface lastSubmissionItemProps {
    parentKey: string;
    itemKey: string;
    flagKey: string;
    trans: string;
}

export const lastSubmissionItem = (props: lastSubmissionItemProps): SurveyItem => {
     
    const ge = new ComponentEditor(undefined, {isGroup: true, role:'text'});
    
    ge.addItemComponent(textComponent({
        'content':_T(props.trans + '.text', "last submission at ", "common.lastsubmission.text")
    }));

    ge.addItemComponent(generateDateDisplayComp('date',{
        date: client.participantFlags.getAsNum(props.flagKey),
        dateFormat:'dd/MM/yyyy hh:mm',
        languageCodes: ['fr']
    }));

    return SurveyItems.display({
        content: [
            ge.getComponent(),
        ],
        condition: client.participantFlags.hasKey(props.flagKey),
        ...props
    });
}

interface lastSubmissionQuestionProps extends ItemProps {
    itemKey: string
    flagKey: string;
    trans: string;
}

export class lastSubmissionQuestion extends ItemQuestion {
    
    flagKey: string;
    transId: string;

    constructor(props: lastSubmissionQuestionProps) {
        super(props, props.itemKey);
        this.flagKey = props.flagKey;
        this.transId = props.trans;
    }

    buildItem(): SurveySingleItem {
        return lastSubmissionItem({
            parentKey: this.parentKey,
            itemKey: this.itemKey,
            flagKey: this.flagKey,
            trans: this.transId,
        });
    }
}

import { SurveyItems } from 'case-editor-tools/surveys';
import { GenericQuestionProps } from "case-editor-tools/surveys/types";
import { ItemComponent, SurveyItem } from "survey-engine/data_types";
import { generateLocStrings } from "case-editor-tools/surveys/utils/simple-generators";
import { ItemQuestion, ItemProps, _T, textComponent } from '../../common';

interface bmiProps extends GenericQuestionProps {
    responseKey: string;
}

type MapToRoleType = 'singleChoiceGroup' | 'multipleChoiceGroup' | 'input';

export const bmiItem = (props: bmiProps): SurveyItem => {

   const text = (id: string, ref: string) => {
      return generateLocStrings(_T(id, ref));
   }

    const items : ItemComponent[] = [
      {
        "role": "weightLabel",
        "content": text("common.bmi.weightLabel", "Weight")
      },
      {
        "role": "weightUnit",
        "content":text("common.bmi.weightUnit", "kg")
      },
      {
        "role": "heightLabel",
        "content": text("common.bmi.heightLabel", "Height")
      },
      {
        "role": "heightUnit",
        "content": text("common.bmi.heightUnit", "Height")
      },
      {
        "role": "bmiLabel",
        "content": text("common.bmi.bmiLabel", "Your Body Mass Index is")
      },
      {
        "role": "extremeValues",
        "content": text("common.bmi.extremeValues", 'Those values are extreme and very rare, please check your body values')
      },
      {
        "role": "alreadyProvided",
        "content": text("common.bmi.alreadyProvided", 'A value has already been provided from you last response')
      },
      {
        "role": "modifyButton",
        "content": text("common.bmi.modifyButton", 'Modify my response')
      },
      {
        "role": "previousValue",
        "content": text("common.bmi.previousValue", 'Your previous value was')
      },
    ];

    const mapToRole: MapToRoleType = 'input';
    const rg = {
        mapToRole: mapToRole,
        key: props.responseKey,
        role: "bmi",
        items: items,
        "content": text("common.bmi.label", "Enter you weight and height to compute Body Mass Index")
    }

    const customProps = {
        responseItemDefs: [ rg ] , 
        ...props
    };

    return SurveyItems.customQuestion(customProps);

};

interface BMIQuestionProps extends ItemProps {
    itemKey: string
    responseKey: string;
    questionText: Map<string, string> 
}

export class BMIQuestion extends ItemQuestion {
    
    responseKey: string;

    questionText: Map<string, string> 
   
    constructor(props: BMIQuestionProps) {
        super(props, props.itemKey);
        this.responseKey = props.responseKey;
        this.questionText = props.questionText;
    }

    buildItem(): SurveyItem {
        return bmiItem({
            parentKey: this.parentKey,
            itemKey: this.itemKey,
            responseKey: this.responseKey,
            questionText: this.questionText,
            topDisplayCompoments: [
                textComponent({key:'nts', content: _T('common.bmi.text.not_stored', "Weight and height value will not be stored")})
            ]
        });
    }
}
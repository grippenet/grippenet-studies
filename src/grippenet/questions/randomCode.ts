
import { SurveyItems } from 'case-editor-tools/surveys';
import { GenericQuestionProps } from "case-editor-tools/surveys/types";
import { ItemComponent, LocalizedString, SurveyItem } from "survey-engine/data_types";
import { generateLocStrings } from "case-editor-tools/surveys/utils/simple-generators";
import { ItemQuestion, ItemProps, _T, textComponent, HelpGroupContentType } from '../../common';

interface randomCodeProps {
    responseKey: string;
    codeLabel: Map<string, string>
    linkLabel?: Map<string, string>
    codeAlphabet?: string
    codeSize?: number
    codeLink?: string
}

type MapToRoleType = 'singleChoiceGroup' | 'multipleChoiceGroup' | 'input';

export const randomCodeItem = (props: GenericQuestionProps, config: randomCodeProps): SurveyItem => {

   const alphabet = config.codeAlphabet ?? '0123456789';
   const size = config.codeSize ?? 5;

    const items : ItemComponent[] = [
      {
        "role": "label",
        "content": generateLocStrings(config.codeLabel)
      },
      {
        "role": "config",
        "style": [
          {
            "key": "alphabet", "value":alphabet,
          },
          {
            "key":"size", "value": ''+ size,
          }
        ]
      }
    ];

    if(config.linkLabel || config.codeLink) {
      const styles = [];
      if(config.codeLink) {
        styles.push({"key": "link", "value": config.codeLink});
      }
      items.push({
        "role": "link", 
        style: styles,
        content: config.linkLabel ? generateLocStrings(config.linkLabel) : undefined
      })
    }

    const mapToRole: MapToRoleType = 'input';
    const rg = {
        mapToRole: mapToRole,
        key: config.responseKey,
        role: "randomCode",
        items: items,
    }

    const customProps = {
        responseItemDefs: [ rg ] , 
        ...props
    };

    return SurveyItems.customQuestion(customProps);

};

interface RandomCodeQuestionProps extends ItemProps {
  questionText: Map<string,string>
  codeConfig: randomCodeProps
}

export class RandomCodeQuestion extends ItemQuestion {

    config: randomCodeProps

    questionText: Map<string, string>

    constructor(props: RandomCodeQuestionProps, defaultKey: string) {
      super(props, defaultKey);
      this.config = props.codeConfig;
      this.questionText = props.questionText;
     }

    buildItem(): SurveyItem {
        return randomCodeItem({
            isRequired: this.isRequired,
            parentKey: this.parentKey,
            itemKey: this.itemKey,
            questionText: this.questionText,
            helpGroupContent: this.getHelpGroupContent(),
            condition: this.getCondition()
        }, this.config);
    }
}
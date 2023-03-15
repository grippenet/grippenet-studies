
import { SurveyItems } from 'case-editor-tools/surveys';
//import { CustomResponseItem } from 'case-editor-tools/surveys/survey-items';
import { GenericQuestionProps } from "case-editor-tools/surveys/types";
import { ItemComponent, SurveyItem } from "survey-engine/data_types";
import { generateLocStrings } from "case-editor-tools/surveys/utils/simple-generators";
import { _T } from '../../common';

interface postalCodeProps extends GenericQuestionProps {
    responseKey: string;
}

type MapToRoleType = 'singleChoiceGroup' | 'multipleChoiceGroup' | 'input';

export const postalCode = (props: postalCodeProps): SurveyItem => {

   const text = (id: string, ref: string) => {
      return generateLocStrings(_T(id, ref));
   }

    const items : ItemComponent[] = [
      { "key": "postalcodes", "role":"lookupName"},
      {
        "role": "searchButton",
        "content": text("common.postalcodes.search", "Search" )
      },
      {
        "role": "updateButton",
        "content": text("common.postalcodes.modify_response", "Modify your response")
      },
      {
        "role": "selectEntry",
        "content": text("common.postalcodes.select_label", "Select you municipality in the following list")
      },
      {
        "role": "loadingError",
        "content": text("common.postalcodes.loading_error", "An error occured during search")
      },
      {
        "role": "responseLabel",
        "content": text("common.postalcodes.current_response", "Your current response")
      },
      {
        "role": "minLengthError",
        "content": text("common.postalcodes.min_length_error", "Enter the 5 letters of your postal code")
      }
    ];

    const mapToRole: MapToRoleType = 'input';
    const rg = {
        mapToRole: mapToRole,
        key: props.responseKey,
        role: "postalCodeLookup",
        items: items,
        "style": [
            {"key": "maxLength", "value": "5"},
            {"key": "minLength", "value": "5"}
        ],
        "content": text("common.postalcodes.label", "Enter the 5 letters of your postal code")
    }

    const customProps = {
        responseItemDefs: [ rg ] , 
        ...props
    };

    return SurveyItems.customQuestion(customProps);

};
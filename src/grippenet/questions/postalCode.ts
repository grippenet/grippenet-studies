
import { SurveyItems } from 'case-editor-tools/surveys';
import { GenericQuestionProps } from "case-editor-tools/surveys/types";
import { ItemComponent, SurveyItem } from "survey-engine/data_types";
import { french } from "../surveys/utils";
import { generateLocStrings } from "case-editor-tools/surveys/utils/simple-generators";

interface postalCodeProps extends GenericQuestionProps {
    responseKey: string;
}

export const postalCode = (props: postalCodeProps): SurveyItem => {

    const text = (label: string) => generateLocStrings(french(label));

    const items : ItemComponent[] = [
      { "key": "postalcodes", "role":"lookupName"},
      {
        "role": "buttonLabel",
        "content": text("Recherchez")
      },
      {
        "role": "updateButton",
        "content": text("Modifier votre réponse")
      },
      {
        "role": "selectLabel",
        "content": text("Sélectionnez votre commune dans la liste ci-dessous")
      },
      {
        "role": "loadingError",
        "content": text("Une erreur est survenue durant le chargement des données")
      },
      {
        "role": "responseLabel",
        "content": text("Votre réponse actuelle")
      },
      {
        "role": "minLengthError",
        "content": text("Entrez les 5 caractères de votre code postal")
      }
    ];

    const rg = {
        key: props.responseKey,
        role: "postalCodeLookup",
        items: items,
        "style": [
            {"key": "maxLength", "value": "5"},
            {"key": "minLength", "value": "5"}
        ],
        "content": [
            { "code": "fr", "parts": [ { "str": "Indiquez votre code postal" } ] }
        ],
    }

    const customProps = {
        responseItemDefs: [ rg ], 
        ...props
    };

    return SurveyItems.customQuestion(customProps);

};
import { OptionDef } from "case-editor-tools/surveys/types";
import { _T, BaseChoiceQuestion, ItemProps, option_def, option_input_other } from "../../../common";
import { text_how_answer, text_why_asking } from "../../../../common/studies/common/questionPools";
import { createDefaultHelpGroup } from "../../../utils/questions";

export class IRAPrevWorkingDomain extends BaseChoiceQuestion {

    constructor(props: ItemProps) {
        super(props, 'Q4i', 'single');
    }

    getResponses(): OptionDef[] {
       return [
            option_def('1', _T('intake.Q4i.options.1', 'Health and Social worker')),
            option_def('2', _T('intake.Q4i.options.2', 'early child workers')),
            option_def('3', _T('intake.Q4i.options.3', 'Restaurant workers')),
            option_def('4', _T('intake.Q4i.options.4', 'Food selling')),
            option_input_other('5', _T('intake.Q4i.options.5', 'Other'), '')
       ]
    }
    
    getHelpGroupContent() {
        return createDefaultHelpGroup('intake.Q4')
    }

}
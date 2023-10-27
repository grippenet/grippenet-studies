import {
    questionPools, _T,  ItemProps,  BaseChoiceQuestion,
    GroupQuestion, GroupProps, ClientExpression as client,  as_option,
   option_def, option_input_other
} from "../../../common"
import { OptionDef } from "case-editor-tools/surveys/types";
import { text_select_all_apply } from "../../../../common/studies/common/questionPools";

export class MaskGroup extends GroupQuestion {

    constructor(props: GroupProps) {
        super(props, 'mask');
    }

    buildGroup(): void {
    }

}

export class MaskWearingContext extends BaseChoiceQuestion {

    constructor(props: ItemProps) {
        super(props, 'Qm1', 'multiple');
        this.setOptions({
            questionText: _T("weekly.QFRmask1.text", "Under what circumstances did you wear a mask"),
            topDisplayCompoments: [
                text_select_all_apply("weekly.Qmask1.select_all_apply"),
            ]
        });
    }

    getResponses(): OptionDef[] {
        const exclusiveCondition = client.multipleChoice.any(this.key, "99");
        const exclusiveIDontKnow = client.multipleChoice.none(this.key, "99");
        const opts = { disabled: exclusiveCondition };
        return [
            option_def("1", _T("weekly.QFRmask1.option.fear_transmit", "By fear of transmitting to household"), opts),
            option_def("2", _T("weekly.QFRmask1.option.oustide", "Oustide home"), opts),
            option_def("3", _T("weekly.QFRmask1.option.at_work", "At work"), opts),
            option_def("4", _T("weekly.QFRmask1.option.contact_elder", "Close to elder people"), opts),
            option_def("5", _T("weekly.QFRmask1.option.contact_at_risk", "Close to people with chronic disease"), opts),
            option_def("6", _T("weekly.QFRmask1.option.hospital", "By visiting people at hospital"), opts),
            option_def("7", _T("weekly.QFRmask1.option.young_children", "Close to young people"), opts),
            option_input_other("8", _T("weekly.QFRmask1.option.other", "Other"), "weekly.QFRmask1.option.other.desc", opts),
            option_def("99", _T("weekly.QFRmask1.option.dnk", "I dont know"), { disabled: exclusiveIDontKnow }),
        ]
    }
}

export class MaskWearingAlways extends BaseChoiceQuestion {

    constructor(props: ItemProps) {
        super(props, 'Qm2', 'single');
        this.setOptions({
            questionText: _T("weekly.QFRmask2.text", "In this context, did you always wear a mask"),
        });
    }

    getResponses(): OptionDef[] {
        return [
            as_option("1", _T("weekly.QFRmask2.option.yes", "Yes")),
            as_option("0", _T("weekly.QFRmask2.option.no", "No")),
            as_option("2", _T("weekly.QFRmask2.option.dnk", "I dont know")),
        ]
    }

    createConditionNoUnknown() {
        return client.singleChoice.any(this.key, '0', '2');
    }

    createConditionYes() {
        return client.singleChoice.any(this.key, '1');
    }

}

export class MaskNotWearingReason extends BaseChoiceQuestion {

    constructor(props: ItemProps) {
        super(props, 'Qm3', 'multiple');
        this.setOptions({
            questionText: _T("weekly.QFRmaskE.text", "Why did you not always wear a mask in this context"),
            topDisplayCompoments: [
                text_select_all_apply("weekly.Qmask3.select_all_apply"),
            ],
        });
    }

    getResponses(): OptionDef[] {

        const exclusiveCondition = client.multipleChoice.any(this.key, "6");
        const exclusiveDontKnow = client.multipleChoice.none(this.key, "6");

        return [
            option_def("1", _T("weekly.QFRmask3.option.not_enough", "Dont have enough mask"), { disabled: exclusiveCondition }),
            option_def("2", _T("weekly.QFRmask3.option.incommode", "Mask incommode me for breathing"), { disabled: exclusiveCondition }),
            option_def("3", _T("weekly.QFRmask3.option.constraint", "Too constraining"), { disabled: exclusiveCondition }),
            option_def("4", _T("weekly.QFRmask3.option.other_look", "Because of other people's opinion when seeing me"), { disabled: exclusiveCondition }),
            option_input_other("5", _T("weekly.QFRmask3.option.other", "Other reason"), "weekly.QFRmask3.option.other.desc", { disabled: exclusiveCondition }),
            option_def("6", _T("weekly.QFRmask3.option.dnk", "I dont know"), { disabled: exclusiveDontKnow }),
        ]
    }

}

export class MaskProvidedFrom extends BaseChoiceQuestion {

    constructor(props: ItemProps) {
        super(props, 'Qm4', 'multiple');
        this.setOptions({
            questionText: _T("weekly.QFRmask4.text", "Where did you get this mask from?"),
            topDisplayCompoments: [
                text_select_all_apply("weekly.Qmask4.select_all_apply"),
            ]
        });
    }

    getResponses(): OptionDef[] {

        const exclusiveCondition = client.multipleChoice.any(this.key, "6");
        const exclusiveDontKnow = client.multipleChoice.none(this.key, "6");

        return [
            option_def("1", _T("weekly.QFRmask4.option.pharmacy", "At the pharmacy"), { disabled: exclusiveCondition }),
            option_def("2", _T("weekly.QFRmask4.option.internet", "On internet"), { disabled: exclusiveCondition }),
            option_def("3", _T("weekly.QFRmask4.option.work", "At work"), { disabled: exclusiveCondition }),
            option_def("4", _T("weekly.QFRmask4.option.doctor", "From my doctor"), { disabled: exclusiveCondition }),
            option_input_other("5", _T("weekly.QFRmask4.option.other", "Other"), "weekly.QFRmask4.option.other.desc", { disabled: exclusiveCondition }),
            option_def("6", _T("weekly.QFRmask4.option.dnk", "I dont know"), { disabled: exclusiveDontKnow }),
        ];
    }

}


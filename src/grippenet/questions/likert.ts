import { ResponsiveSingleChoiceArrayProps, StyledTextComponentProp } from "case-editor-tools/surveys/types";
import { ItemProps, ItemQuestion, ClientExpression as client, trans_item } from "../../common";
import { SurveyItems } from "case-editor-tools/surveys";
import { responsiveSingleChoiceArrayKey } from "case-editor-tools/constants/key-definitions";

export interface ScaleOption {
    key: string;
    className?: string;
    content: Map<string, string> | Array<StyledTextComponentProp>;
}

export type LikertRow = ResponsiveSingleChoiceArrayProps['rows'][0];

export abstract class LikertQuestion extends ItemQuestion {
    
    constructor(itemProps: ItemProps, key: string) {
        super(itemProps, key);
    }

    required(b: boolean) {
        this.isRequired = b;
        return this;
    }

    abstract getScaleOptions(): ScaleOption[];

    abstract getRows(): LikertRow[];

    buildItem() {
        if(!this.options?.questionText) {
            throw new Error("Question text is not defined");
        }
        return SurveyItems.responsiveSingleChoiceArray({
            parentKey: this.parentKey,
            itemKey: this.itemKey,
            isRequired: this.isRequired,
            scaleOptions: this.getScaleOptions(),
            questionText: this.options?.questionText,
            rows: this.getRows(),
            defaultMode: "horizontal",
            topDisplayCompoments: this.options?.topDisplayCompoments,
            bottomDisplayCompoments: this.options?.bottomDisplayCompoments,
            helpGroupContent: this.getHelpGroupContent(),
        })
    }

    getResponsePrefix(): string {
        return "rg." + responsiveSingleChoiceArrayKey;
    }

    getRowItemKey(rowKey: string) {
        return this.getResponsePrefix() + "." + rowKey;
    }

    scaleItem(code: string, trans: string):ScaleOption {
        return {key: code, content: this.trans('scale.' + code + '.label', trans)};
    }
}


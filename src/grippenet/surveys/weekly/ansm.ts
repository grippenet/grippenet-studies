import {   _T, ItemProps, ItemQuestion, BaseChoiceQuestion,
     GroupProps, ClientExpression as client,  as_input_option,
    markdownComponent,
     option_def, HelpGroupContentType, SimpleGroupQuestion,  make_exclusive_options }  from "../../../common"
import {  Expression,  SurveySingleItem } from "survey-engine/data_types";
import {  OptionDef } from "case-editor-tools/surveys/types";
import { SurveyItems } from 'case-editor-tools/surveys';
import { createDefaultHelpGroup } from "../../../utils/questions";

// Alias namespace
import { GrippenetFlags } from "../../flags";


export class Q1ANSM extends BaseChoiceQuestion {
    
    constructor(props: ItemProps) {
        super(props, 'Q1ansm', 'single');
        this.setOptions({
            questionText: _T("weekly.Q1ansm.text", "Q1ansm")
        });
    }

    getResponses(): OptionDef[] {
        
        return [
            option_def("0", _T("weekly.Q1ansm.option.no", "No")),
            option_def("1", _T("weekly.Q1ansm.option.yes", "Yes")),
            option_def("99", _T("weekly.Q1ansm.option.dnk", "I dont know")),
        ];
    }

    getYesCondition(): Expression {
        return client.singleChoice.any(this.key, '1');
    }

}
export class Q2ANSM extends BaseChoiceQuestion {
    
    constructor(props: ItemProps) {
        super(props, 'Q2ansm', 'single');
        this.setOptions({
            questionText: _T("weekly.Q2ansm.text", "Q2ansm")
        });
    }

    getResponses(): OptionDef[] { 
        return [
            option_def("0", _T("weekly.Q2ansm.option.no", "No")),
            option_def("1", _T("weekly.Q2ansm.option.yes", "Yes")),
        ];
    }

    getYesCondition(): Expression {
        return client.singleChoice.any(this.key, '1');
    }

    getHelpGroupContent(): HelpGroupContentType | undefined {
        return createDefaultHelpGroup("weekly.Q2ansm");
    }
}

/*
Q3 ANSM (si 1 à la Q2 ANSM)
Qu’est-ce qui ne vous a pas été délivré ?
o	Médicament contre la douleur ou la fièvre (par exemple paracétamol,  ibuprofène, aspirine, etc.) (Préciser  Champ libre)  1
o	Médicament contre la toux  (préciser)  Champ libre 2
o	Antiviral contre la grippe (Tamiflu) (préciser) Champ libre 3
o	Antiviral contre la Covid-19 (Paxlovid) (préciser)Champ libre 7
o	Antibiotique (préciser) Champ libre 4
o	Dispositif médical (chambre d’inhalation, dispositif d’oxygénothérapie, etc.)  (préciser) Champ libre 8
o	Vaccin (préciser) Champ libre 9
o	Autre (préciser) Champ libre 5
*/

export class QAnsmNotDelivered extends BaseChoiceQuestion {
    
    useIdontKnow: boolean;

    constructor(props: ItemProps, defaultKey: string, useIdontKnow: boolean) {
        super(props, defaultKey, 'multiple');
        this.setOptions({
            questionText: _T("weekly." + defaultKey + ".text", "Q3ansm", "weekly.QAnsmNotDelivered.text")
        });
        this.useIdontKnow = useIdontKnow;
    }

    getResponses(): OptionDef[] { 

        const desc = _T("weekly.QAnsmNotDelivered.option.input_desc","Name it if possible");

        const oo = [
            as_input_option('1', _T('weekly.QAnsmNotDelivered.option.text.painkiller','Pain killer'), _T("weekly.QAnsmNotDelivered.option.desc.painkiller", "tylenol, ...")),
            as_input_option('2', _T('weekly.QAnsmNotDelivered.option.text.cough','Cough medication'), desc),
            as_input_option('3', _T('weekly.QAnsmNotDelivered.option.text.flu', 'Influenza antiviral'), desc),
            as_input_option('4', _T('weekly.QAnsmNotDelivered.option.text.covid19', 'Covid19 antiviral'), desc),
            as_input_option('5', _T('weekly.QAnsmNotDelivered.option.text.antibiotic.', 'Antibiotic'), desc),
            as_input_option('6', _T('weekly.QAnsmNotDelivered.option.text.device', 'Medical device'), _T("weekly.QAnsmNotDelivered.option.desc.device", "inhalation chamber, ...")),
            as_input_option('7', _T('weekly.QAnsmNotDelivered.option.text.vaccine', 'Vaccine'), desc),
            as_input_option('9', _T('weekly.QAnsmNotDelivered.option.text.other', 'Other'), desc),
        ];

        if(this.useIdontKnow) {
            oo.push(option_def('99', _T('weekly.QAnsmNotDelivered.option.text.dnk', 'I dont know')));
            make_exclusive_options(this.key, oo, ['99']);
        }
       
        return oo;
    }
}

export class QAnsmDelivedyReplaced extends BaseChoiceQuestion {
    
    constructor(props: ItemProps, defaultKey: string) {
        super(props, defaultKey, 'single');
        this.setOptions({
            questionText: _T("weekly." + defaultKey + ".text", "QAnsmDelivedyReplaced", "weekly.QAnsmDelivedyReplaced.text")
        });
    }

    getResponses(): OptionDef[] { 
        return [
            option_def("0", _T("weekly.QAnsmDelivedyReplaced.option.no", "No")),
            option_def("1", _T("weekly.QAnsmDelivedyReplaced.option.yes", "Yes")),
            option_def("99", _T("weekly.QAnsmDelivedyReplaced.option.dnk", "I dont know")),
        ];
    }

    getYesCondition(): Expression {
        return client.singleChoice.any(this.key, '1');
    }

}

export class QAnsmProposedAlternative extends BaseChoiceQuestion {
    
    constructor(props: ItemProps, defautlKey:string) {
        super(props, defautlKey, 'multiple');
        this.setOptions({
            questionText: _T("weekly." + defautlKey + ".text", "QAnsmProposedAlternative", "weekly.QAnsmProposedAlternative.text")
        });
    }

    getResponses(): OptionDef[] { 

        //const ExcludeDontKnow = client.multipleChoice.any(this.key, '99');
    
        const desc = _T("weekly.QAnsmProposedAlternative.option.input_desc", "Name it if possible");

        const oo = [
            option_def("1", _T("weekly.QAnsmProposedAlternative.option.dose", "Other dose")),
            option_def("2", _T("weekly.QAnsmProposedAlternative.option.medication", "Other medication"), {role:'input', description:desc}),
            option_def("3", _T("weekly.QAnsmProposedAlternative.option.preparation", "Magistral preparation")),
            option_def("4", _T("weekly.QAnsmProposedAlternative.option.generic", "Generic"), {role:'input', description:desc}),
            option_def('5', _T('weekly.QAnsmProposedAlternative.option.text.other', 'Other'), {role:'input', description:desc}),
            option_def("99", _T("weekly.QAnsmProposedAlternative.option.dnk", "I dont know")),
        ];

        make_exclusive_options(this.key, oo, ['99']);

        return oo;
    }
}



interface AsnmDeliveryProps extends GroupProps {
    NotDeliveredKey: string;
    NotDeliveredIdontKnow: boolean;
    DelivedyReplaced: string;
    ProposedAlternative: string;

}

export class AnsmDeliveryGroup extends SimpleGroupQuestion {
    
    constructor(props: AsnmDeliveryProps) {
        super(props, 'AnsmG');
        
        const QNotDelivered = new QAnsmNotDelivered({parentKey: this.key}, props.NotDeliveredKey, props.NotDeliveredIdontKnow);
        this.add(QNotDelivered);
        
        const QDelivedyReplaced = new QAnsmDelivedyReplaced({parentKey: this.key}, props.DelivedyReplaced);
        this.add(QDelivedyReplaced);

        const QAlternative = new QAnsmProposedAlternative({parentKey: this.key}, props.ProposedAlternative);
        QAlternative.setCondition(QDelivedyReplaced.getYesCondition());
        this.add(QAlternative);
    }

}

export class AnsmEndGroup extends SimpleGroupQuestion {
    
    QDeliveryFailure: ItemQuestion;

    constructor(props: GroupProps) {
        super(props, 'AnsmEnd');
        this.add(new QansmPrelude({parentKey: this.key}));

        const ansmFlag = GrippenetFlags.ansmNoChild;

        const IsNotConcerned = client.participantFlags.hasKeyAndValue(ansmFlag.key, ansmFlag.values.yes);

        const Q6ansm = new Q6ANSM({parentKey: this.key});
        this.add(Q6ansm);
    
        const Q7ansm = new Q7ANSM({parentKey: this.key});
    
        Q7ansm.setCondition(client.logic.not(IsNotConcerned));
        this.QDeliveryFailure = Q7ansm;

        this.add(Q7ansm);

        const deliveryGroup = new AnsmDeliveryGroup({
            parentKey: this.key, 
            NotDeliveredKey: 'Q8ansm',
            NotDeliveredIdontKnow: true,
            DelivedyReplaced: 'Q9ansm',
            ProposedAlternative: 'Q10ansm'
        });

        deliveryGroup.setCondition(Q7ansm.getYesCondition());
        this.add(deliveryGroup);
    }

    getDeliveryFailureItem() {
        return this.QDeliveryFailure;
    }

}

export class QansmPrelude extends ItemQuestion {
    
    constructor(props: ItemProps) {
        super(props, 'Qansm0');
    }

    buildItem(): SurveySingleItem {
        return SurveyItems.display({
            parentKey: this.parentKey,
            itemKey: this.itemKey,
            content: [
                markdownComponent({
                    key: 'prelude',
                    content: _T("weekly.Qansm.prelude", "ANSM ancillary study")
                })
            ]
        });
    }
}

export class Q7ANSM extends BaseChoiceQuestion {
    
    constructor(props: ItemProps) {
        super(props, 'Q7ansm', 'single');
        this.setOptions({
            questionText: _T("weekly.Q7ansm.text", "Q7ansm")
        });
    }

    getResponses(): OptionDef[] { 
        return [
            option_def("0", _T("weekly.Q7ansm.option.no", "No")),
            option_def("1", _T("weekly.Q7ansm.option.yes", "Yes")),
            option_def("2", _T("weekly.Q7ansm.option.not_concerned", "Not concerned")),
            option_def("99", _T("weekly.Q7ansm.option.dnk", "I dont know")),
        ];
    }

    getHelpGroupContent(): HelpGroupContentType | undefined {
        return createDefaultHelpGroup("weekly.Q7ansm");
    }

    getYesCondition(): Expression {
        return client.singleChoice.any(this.key, '1');
    }

}

export class Q6ANSM extends BaseChoiceQuestion {
    
    constructor(props: ItemProps) {
        super(props, 'Q6ansm', 'single');
        this.setOptions({
            questionText: _T("weekly.Q6ansm.text", "Q6ansm")
        });
    }

    getResponses(): OptionDef[] { 
        return [
            option_def("0", _T("weekly.Q6ansm.option.no", "No")),
            as_input_option("1", _T("weekly.Q6ansm.option.yes", "Yes"), _T('weekly.Q6ansm.option.text.other_desc', "If possible describe it")),
        ];
    }

    getHelpGroupContent(): HelpGroupContentType | undefined {
        return createDefaultHelpGroup("weekly.Q6ansm");
    }

}
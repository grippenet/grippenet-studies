import { OptionDef } from "case-editor-tools/surveys/types";
import { _T, BaseChoiceQuestion, ItemProps, option_def, trans_item, transTextComponent } from "../../../common";
import { createDefaultHelpGroup } from "../../../utils/questions";
import { LikertQuestion, LikertRow } from "../../questions";

const text = trans_item;

export class IRAPrev1 extends BaseChoiceQuestion {

    constructor(props: ItemProps) {
        props.transKey = 'weekly.QIRA1';
        super(props, 'QIRA1', 'single');
        this.setOptions({
            questionText: text(this, 'title', 'did you have this symptoms for 3 days or more?')
        })
    }

    getResponses(): OptionDef[] {
        return [
            option_def('1', _T('weekly.QIRA1.options.yes', 'Yes')),
            option_def('0', _T('weekly.QIRA1.options.no',  'No')),
            option_def('2', _T('weekly.QIRA1.options.dkn',  'I dont know')),
        ]
    }

    getHelpGroupContent() {
        return createDefaultHelpGroup(this.getTransKey());
    }    
}

/**
 Q_IRA2 Durant cet épisode, votre usage des mesures barrières suivantes a-t-il évolué ? (si au moins 1 symptômes Q1)
Indiquez « Davantage » si vous appliquez cette mesure de manière plus importante qu’avant d’avoir les symptômes déclarés, « Pareil » si vous appliquiez cette mesure à la même fréquence qu’avant d'avoir les symptômes déclarés, « Non » si vous n'appliquez pas cette mesure, et « Non applicable » si vous n'êtes pas concerné par cette mesure.
Se laver les mains 1
Aérer la pièce où vous vous trouvez 23
 
Q_IRA3 Durant cet épisode, à quelle fréquence avez-vous porté un masque dans les situations suivantes ? (si au moins 1 symptômes Q1)
Pour chacune des mesures suivantes, Indiquez « Pas du tout » / « Parfois » / « Souvent » / « Systématiquement » / « Pas concerné »
Dans les transports en commun 19
Dans les lieux très fréquentés (ex : supermarché, salles de spectacle, compétitions sportives, etc.) 20
En présence de nourrissons 21
En présence de personnes âgées ou fragiles (personnes avec maladie chronique, femmes enceintes) 22
A domicile en présence d’autres personnes 17

Q_IRA4 Durant cet épisode, avez-vous adopté les comportements suivants ? (si au moins 1 symptômes Q1)
Pour chacune des mesures suivantes, Indiquez « Oui », « Non » ou « Pas concerné »
Limiter l’usage des transports en commun 6
Éviter les lieux très fréquentés (sortie au théâtre, au cinéma, au stade, au supermarché …) 7
Réduire les contacts avec son entourage familial, amical ou professionnel 14
Réduire les contacts avec les personnes âgées ou les personnes fragiles 15
Réduire les contacts avec les nourrissons 16
 */

export class QIRAPrev2 extends LikertQuestion {
    
    constructor(props: ItemProps) {
        props.transKey = 'weekly.QIRA2';
        super(props, 'QIRA2');
        this.setOptions(
            {
                questionText: text(this, 'title', 'During this episode, do your usage of barriere measure changed'),
                topDisplayCompoments: [
                    transTextComponent("weekly.QIRA2.top.1", "question help notice", {"className":"mb-1"})
                ]
            }
        );
    }

    getScaleOptions() {
        return [
            {key: '1', content: text(this, 'scale.1', 'More than usual')},
            {key: '2', content: text(this, 'scale.2', 'Same')},
            {key: '3', content: text(this, 'scale.3', 'No')},
            {key: '4', content: text(this, 'scale.4', 'Not applicable')},
        ]
    }

    getRows() {
        return [
            {key: "1", content: text(this, "rows.1", "Washing hands") },
            {key: "23", content: text(this, "rows.23", "ventilate the room") },
        ]
    }

    getHelpGroupContent() {
        return createDefaultHelpGroup(this.getTransKey(), {WhyAsking: true});
    }
}

export class QIRAPrev3 extends LikertQuestion {
    
    constructor(props: ItemProps) {
        props.transKey = 'weekly.QIRA3';
        super(props, 'QIRA3');
        this.setOptions({
            questionText: text(this, 'title', 'During this episode, how often did you wear a mask in the following situations'),
        })
    }

    getScaleOptions() {
        return [
            {key: '1', content: text(this, 'scale.1', 'Not at all')},
            {key: '2', content: text(this, 'scale.2', 'Sometimes')},
            {key: '3', content: text(this, 'scale.3', 'Often')},
            {key: '4', content: text(this, 'scale.4', 'All the time')},
            {key: '5', content: text(this, 'scale.5', 'Not concerned')},
        ]
    }

    getRows() {

        const rows = [
            {key: "19", label: "Public transports"},
            {label: "Crowdy locations", key: "20"},
            {label:"In preseence of newborn or very young child", key: "21"},
            {label: "In presence of fragile people", key: "22"},
            {label: "At home, in presence of other people", key: '17'}
        ]


        return rows.map(r=> {
            return {key: r.key, content: text(this, 'row.' + r.key, r.label)}
        })
    }

    getHelpGroupContent() {
        return createDefaultHelpGroup(this.getTransKey(), {WhyAsking: true});
    }
}

export class QIRAPrev4 extends LikertQuestion {
    
    constructor(props: ItemProps) {
        props.transKey = 'weekly.QIRA4';
        super(props, 'QIRA4');
        this.setOptions({
            questionText: text(this, 'title', 'During this episode, Did you use this measures?'),
        })
    }

    getScaleOptions() {
        return [
            {'key': '1', content: text(this, 'scale.1', 'Yes')},
            {'key': '0', content: text(this, 'scale.0', 'No')},
            {'key': '2', content: text(this, 'scale.2', 'Not applicable')},
        ]
    }

    getRows() {

        const rows = [
            {label: "Limit usage of public transport", key: '6' }, 
            {label: "Avoid busy places and gatherings (supermarket, cinema, stadium)", key: '7'},
            {label: "Avoid seeing friends and family", key: "14"},
            {label: "Avoid being in contact with people over 65 years old or with a chronic disease", key:"15"},
            {label: "Avoid being in contact with young children (less 2 yo)", key: "16"},
        ];

        return rows.map(r=> {
            return {key: r.key, content: text(this, 'row.' + r.key, r.label)}
        })
    }

    getHelpGroupContent() {
        return createDefaultHelpGroup(this.getTransKey(), {WhyAsking: true});
    }
}

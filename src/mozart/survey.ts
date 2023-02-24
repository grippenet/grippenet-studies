import { Expression, ExpressionName, SurveyItem } from "survey-engine/data_types";
import { Group, Item, SurveyDefinition } from "case-editor-tools/surveys/types";
import {  SimpleGroupQuestion, ClientExpression as client,   as_input_option, as_option, option_def} from "../../common";
import { SurveyItems } from "case-editor-tools/surveys";
import { ComponentGenerators } from "case-editor-tools/surveys/utils/componentGenerators";
import { _T, options_french, ObservationPeriod, createPeriod } from "./helpers";
import { common_other, PiqureGroup, YesNo } from "./question";
import responses from "./responses";
import { optionRoles, textComponent } from "../common";
import { postalCode } from "../grippenet/questions";

export class MozartSurvey extends SurveyDefinition {

    period: ObservationPeriod

    constructor(meta?:Map<string,string>) {
        
        super({
            surveyKey: 'mozart',
            name:_T("name.0", "Questionnaire Mozart"),
            description: _T("description.0", ""),
            durationText: _T("typicalDuration.0", "5 à 10 minutes"),
        });

        if(meta) {
            const m = Object.fromEntries(meta.entries());
            this.editor.setMetadata(m);
        }

        this.period = createPeriod("2022-11-01", "2023-02-28", "Novembre 2022 à Février 2023");
    }

    buildSurvey(): void {
        const rootKey = this.key;
        /*
        const Q0 = this.Q0(rootKey);
        this.addItem(Q0);
        */

        const hasRespondedBackground = client.logic.not(client.participantFlags.hasKeyAndValue('mozartS0', '1'));
        
        //client.singleChoice.any(Q0.key, responses.Q0.dnk, responses.Q0.no);

        const Q14 = postalCode({parentKey: rootKey, itemKey: 'Q14', isRequired: true, responseKey: '1', questionText: _T("Q14.text", "Quelle est votre commune de résidence")});
        this.addItem(Q14);

        const Q1 = this.Q1(rootKey, hasRespondedBackground);
        this.addItem(Q1);

        /*
        const Q2 = this.Q2(rootKey, hasRespondedBackground);
        this.addItem(Q2);

        const Q2b = this.Q2b(rootKey, client.singleChoice.any(Q2.key, responses.Q2.yes));
        this.addItem(Q2b);
        */

        const Q3 = this.Q3(rootKey, hasRespondedBackground);
        this.addItem(Q3);

        const Q4 = this.Q4(rootKey, hasRespondedBackground);
        this.addItem(Q4);

        const bitenLifetime = client.singleChoice.any(Q4.key, responses.yes_no.yes);
        
        const Q5 = this.Q5(rootKey, bitenLifetime);
        this.addItem(Q5);

        const hasBite = client.singleChoice.any(Q5.key, responses.yes_no.yes);

        const Q6 = this.Q6(rootKey, hasBite);
        this.addItem(Q6);

        this.addPageBreak();

        const AtLeastThreeCondition = client.singleChoice.any(Q6.key, responses.Q6.trois, responses.Q6.quatre_plus);
        const AtLeastTwoCondition =client.singleChoice.any(Q6.key, responses.Q6.deux, responses.Q6.trois, responses.Q6.quatre_plus);
        const AtLeastOneCondition =client.singleChoice.any(Q6.key, responses.Q6.un, responses.Q6.deux, responses.Q6.trois, responses.Q6.quatre_plus);
        const hasFourCondition =client.singleChoice.any(Q6.key, responses.Q6.quatre_plus);
        
        const Q6_1 = new PiqureGroup(rootKey, 'Q6_1', 1, AtLeastOneCondition, this.period);
        this.addItem(Q6_1.get());
        
        this.addPageBreak();

        const Q6_2 = new PiqureGroup(rootKey, 'Q6_2', 2, AtLeastTwoCondition, this.period);
        this.addItem(Q6_2.get());

        this.addPageBreak();

        const Q6_3 = new PiqureGroup(rootKey, 'Q6_3', 3, AtLeastThreeCondition, this.period);
        this.addItem(Q6_3.get());
        this.addPageBreak();

        const Q6_4 = new PiqureGroup(rootKey, 'Q6_4', 4, hasFourCondition, this.period);
        this.addItem(Q6_4.get());

        this.addPageBreak();

        const pS3 = this.preludeS3(rootKey, "preludeS3");
        this.addItem(pS3);
        
        const Q7 = YesNo(rootKey, 'Q7', _T('Q7.text', 'Avez-vous pratiqué une activité de plein air de ' + this.period.label + ' ? '));
        this.addItem(Q7);

        const hasOutsideOccupation = client.singleChoice.any(Q7.key, responses.yes_no.yes);

        const s3 = new Section3(rootKey, 's3', this.period, hasOutsideOccupation);

        this.addItem(s3.get());

        const surveyEnd  = SurveyItems.surveyEnd(
           rootKey,
            _T("surveyEnd", "Nous vous remercions vivement pour votre participation à cette enquête. Il est possible vous soyez sollicités au début de l’été pour répondre à un questionnaire similaire sur la période mars-juin. Comme d’habitude, nous vous tiendrons bien sûr informés des résultats.")
        );
    }

    Q0(parent:string): SurveyItem {
        return YesNo(parent, 'Q0', _T("Q0.text", "Avez-vous ces derniers mois déjà rempli un questionnaire GrippeNet.fr concernant l’exposition aux piqûres de tiques ?"));
    }
    
    Q1 = (parent: string, condition?: Expression) => {
        const  codes = responses.Q1;
        return SurveyItems.singleChoice({
            parentKey: parent,
            itemKey: 'Q1',
            condition: condition,
            questionText: _T("Q1.text", "Avez-vous déjà entendu parler des tiques ou des maladies transmises par les tiques ((exemples : borréliose de Lyme, encéphalite à tiques, babésiose, anaplasmose)) ?"),
            responseOptions: [
                as_option(codes.yes, _T('Q1.option.yes', 'Oui')),
                as_option(codes.no, _T('Q1.option.no', 'Non')),
              //  as_option(codes.dnk, _T('Q0.option.dnk', 'Je ne sais pas/ne m’en souviens pas')),   
            ],
            isRequired: true
        });
    }
   
    /*
    Q2 = (parent: string, condition?: Expression)=> {
        return YesNo(parent, 'Q2', _T("Q2.text", "Avez-vous déjà eu une maladie transmise par une tique dans votre vie ?"), condition);
    }
    
    Q2b = (parent: string, condition?: Expression)=> {
        const codes = responses.Q2b;
        return SurveyItems.singleChoice({
            parentKey: parent,
            condition: condition,
            itemKey: 'Q2b',
            questionText: _T("Q2b.text", "De quelle maladie s’agissait-il ? Si plusieurs, indiquez la plus récente"),
            responseOptions: [
                as_option(codes.lyme, _T('Q2b.option.lyme', 'Borréliose de Lyme')),
                as_option(codes.encephalitis, _T('Q2b.option.encephalitis', 'Encéphalite à tique')),
                as_input_option(codes.other, _T('Q2b.option.other', 'Autre, Précisez')),   
            ]
        });
    }
    */

    Q3(parent: string, condition?: Expression) {
        const codes = responses.Q3;     

        const itemKey = 'Q3';

        const noneCondition = client.multipleChoice.any(this.key + '.' + itemKey, codes.no );

        return SurveyItems.multipleChoice({
            parentKey: parent,
            condition: condition,
            itemKey: itemKey,
            isRequired: true,
            questionText: _T("Q3.text", "Votre lieu de résidence a-t-il"),
            responseOptions: [
                    option_def(codes.jardin, _T('Q3.option.1','Un jardin'), {'disabled': noneCondition}),
                    option_def(codes.terrain, _T('Q3.option.2',"Un champ/un terrain"), {'disabled': noneCondition}),
                    option_def(codes.terrasse, _T('Q3.option.3',"Une terrasse/un balcon/une cour"), {'disabled': noneCondition}),
                    as_option(codes.no, _T('Q3.option.4',"Pas d’extérieur")),
            ]
        });
    }
    
    Q4(parent: string, condition?: Expression) {
        return YesNo(parent, 'Q4', _T('Q4.text', 'Vous êtes-vous déjà fait piquer par une tique (ou plusieurs tiques) au cours de votre vie ?'), condition, {isRequired: true});
    }

    Q5(parent: string, condition?: Expression) {
        return YesNo(parent, 'Q5', _T('Q5.text', 'Vous êtes-vous fait piquer par une tique (ou plusieurs tiques) sur la période de '+  this.period.label +' ?'), condition, {isRequired: true});
    }

    Q6(parent:string, condition?: Expression) {

        const codes = responses.Q6;

        const note = "Note importante: Si vous vous êtes fait piquer par plusieurs tiques au cours de la même sortie, ne comptez cet épisode de piqûres que comme une seule fois";


        return SurveyItems.singleChoice({
            parentKey: parent,
            condition: condition,
            itemKey: 'Q6',
            questionText: _T("Q6.text", "Combien de fois vous êtes-vous fait piquer par une tique (ou plusieurs tiques) sur la période de "+ this.period.label+" ?"),
            topDisplayCompoments: [
                textComponent({
                    'className':'mb-1',
                    key: 'note',
                    content: _T("Q6.note", note)
                })
            ],
            responseOptions: [
                as_option(codes.un, _T('Q6.option.un', 'Une fois')),
                as_option(codes.deux, _T('Q6.option.deux', 'Deux fois')),
                as_option(codes.trois, _T('Q6.option.trois', 'Trois fois')),
                option_def(codes.quatre_plus, _T('Q4.option.quatre', 'Quatre fois ou plus'), {
                    role: optionRoles.number,
                    description: _T('Q4.option.how_many_times', 'Précisez combien de fois'),
                    optionProps: {
                        min: 4
                    }
                }),
                as_option(codes.dnk, _T('Q6.option.nsp', "Je ne sais pas/Je ne m'en souviens pas")),
            ],
            isRequired: true
        });
    }

    prelude(parentKey: string, itemKey: string) {
        return SurveyItems.display({
            parentKey: parentKey,
            itemKey: itemKey,
            content: [
                ComponentGenerators.markdown({
                    content: _T( "prelude", "Dans ce questionnaire, le genre masculin est utilisé comme générique, dans le seul but de ne pas alourdir le texte.") 
                })
            ]
        });
    }

    preludeS3(parentKey: string, itemKey: string) {

        const texts : string[] = [
            "## A propos de vos activités de plein air sur la période de " + this.period.label,
            "",
            "Une activité de plein air est définie ici comme l’ensemble des activités professionnelles, de sports et de loisirs pratiquées en extérieur, dans un milieu naturel ou dans un espace vert.",
            "",    
"Exemples d’activités de plein air : jardinage, promenade en forêt, course à pied en milieu naturel ou parc, course d’orientation, promenade dans un parc municipal ou jardin public, pique-nique en extérieur, sports et jeux dans un jardin ou sur pelouse, etc."
        ];

        return SurveyItems.display({
            parentKey: parentKey,
            itemKey: itemKey,
            content: [
                ComponentGenerators.markdown({
                    content: _T( "prelude.S3", texts.join("\n")) 
                })
            ]
        });
    }

}
    

class Section3 extends Group {
    observationPeriod : ObservationPeriod

    constructor(parentKey:string, groupKey: string, period: ObservationPeriod, condition?:Expression) {
        super(parentKey, groupKey);
        this.groupEditor.setCondition(condition);
        this.observationPeriod = period;
    }

    buildGroup(): void {
    
        const Q8 = this.Q8(this.key);

        this.addItem(Q8);

        const Q9 = this.Q9(this.key);
        this.addItem(Q9);

        const Q10 = this.Q10(this.key);
        this.addItem(Q10);

        const Q11 = YesNo(this.key, 'Q11', _T('Q11.text', "Lors de ces activités de plein air, avez-vous mis en place des mesures de prévention contre les piqûres d'insectes ou de tiques (par ex., pantalons longs, t-shirt manches longues, utilisation d’insecticides…) ") )
        this.addItem(Q11);

        const YesOnQ11 = client.singleChoice.any(Q11.key, responses.yes_no.yes);
        const Q12 = this.Q12(this.key, YesOnQ11);
        this.addItem(Q12);

    }
        
    periodLabel() {
        return "sur la période de " + this.observationPeriod.label;
    }

    Q8(parent:string, condition?: Expression):SurveyItem {
        const oo =  options_french([
            ['1', "Activité professionnelle"],
            ['2', "Chasse, pêche"],
            ['3', "Activité scolaire"],
            ['4', "Sport (course à pied en milieu naturel ou jeu collectif sur gazon)"],
            ['5', "Loisir (randonnée, promenade, pique-nique, jardinage, etc.)"],
        ], 'Q8.option.');

       // oo.push(as_input_option("6", _T("Q8.option.autre", "Autre"), common_other))

        return SurveyItems.multipleChoice({
            parentKey: parent,
            itemKey: 'Q8',
            questionText: _T("Q8.text", "Quel type d'activité de plein air avez-vous pratiqué " + this.periodLabel() + " (toute confondues)"),
            responseOptions: oo,
            condition: condition,
            isRequired: true
        });
    }
    
    Q9(parent:string, condition?: Expression) {
        const oo =  options_french([
            ['1',"Forêt (Lisière de forêt, bois, bosquet…)"],
            ['2',"Prairie (herbes hautes, champs, …)"],
            ['3',"Jardin privé"],
            ['4',"Zone agricole cultivée"],
            ['5',"Parc public/municipal"],
            ['6',"Zones montagneuses"],
        ], 'Q9.option.');

        //oo.push(as_input_option("7", _T("Q9.option.autre", "Autre"), common_other))

        return SurveyItems.multipleChoice({
            parentKey: parent,
            itemKey: 'Q9',
            questionText: _T("Q9.text", "Dans quel(s) environnement(s) avez-vous pratiqué cette ou ces activités de plein air " + this.periodLabel() +" ?"),
            responseOptions: oo,
            condition: condition,
            isRequired: true
        });
    }

    Q10(parent:string, condition?: Expression) {
        const oo =  options_french([
            ["1", "Tous les jours"],
            ["2", "Deux à trois fois par semaine"],
            ["3", "Une fois par semaine"],
            ["4", "Une ou deux fois par mois"],
            ["5", "Moins d’une fois par mois"],
            ["6", "Je ne sais pas/je ne me souviens pas"],          
        ], 'Q10.option.');
       
        return SurveyItems.singleChoice({
            parentKey: parent,
            itemKey: 'Q10',
            questionText: _T("Q10.text", "A quelle fréquence avez-vous pratiqué cette ou ces activités de plein air "+ this.periodLabel() +" ?"),
            responseOptions: oo,
            condition: condition,
            isRequired: true
        });
    }

    Q12(parent:string, condition?: Expression) {

        const oo = options_french([
        ['0', "Rarement"],
        ['1',"Parfois"],
        ['2',"Souvent"],
        ['3',"Toujours"],
        ], 'Q12.option.');

        return SurveyItems.singleChoice({
            parentKey: parent,
            itemKey: 'Q12',
            questionText: _T("Q12.text", "A quelle fréquence avez-vous mis en place des mesures de prévention contre les piqûres d'insectes ou de tiques (exemples: pantalons longs, t-shirt manches longues, utilisation d’insecticides…) "),
            responseOptions: oo,
            condition: condition,
            isRequired: true
        });
    }
}
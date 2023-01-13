import { Expression, ExpressionName, SurveyItem } from "survey-engine/data_types";
import { Group, Item, SurveyDefinition } from "case-editor-tools/surveys/types";
import {  SimpleGroupQuestion, ClientExpression as client,   as_input_option, as_option, option_def} from "../../common";
import { SurveyItems } from "case-editor-tools/surveys";
import { ComponentGenerators } from "case-editor-tools/surveys/utils/componentGenerators";
import { _T, options_french } from "./helpers";
import { common_other, PiqureGroup, YesNo } from "./question";
import responses from "./responses";
import { optionRoles, textComponent } from "../common";

export class MozartSurvey extends SurveyDefinition {

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
    }

    buildSurvey(): void {
        const rootKey = this.key;
        /*
        const Q0 = this.Q0(rootKey);
        this.addItem(Q0);
        */

        const hasRespondedBackground = client.logic.not(client.participantFlags.hasKeyAndValue('mozartS0', '1'));
        
        //client.singleChoice.any(Q0.key, responses.Q0.dnk, responses.Q0.no);

        const Q1 = this.Q1(rootKey, hasRespondedBackground);
        this.addItem(Q1);

        const Q2 = this.Q2(rootKey, hasRespondedBackground);
        this.addItem(Q2);

        const Q2b = this.Q2b(rootKey, client.singleChoice.any(Q2.key, responses.Q2.yes));
        this.addItem(Q2b);

        const Q3 = this.Q3(rootKey, hasRespondedBackground);
        this.addItem(Q3);

        const Q4 = this.Q4(rootKey, hasRespondedBackground);
        this.addItem(Q4);

        //const bitenLifetime = client.singleChoice.any(Q4.key, responses.yes_no.yes);
        
        const Q5 = this.Q5(rootKey);
        this.addItem(Q5);

        const hasBite = client.singleChoice.any(Q5.key, responses.yes_no.yes);

        const Q6 = this.Q6(rootKey, hasBite);
        this.addItem(Q6);

        this.addPageBreak();

        const AtLeastThreeCondition = client.singleChoice.any(Q6.key, responses.Q6.trois, responses.Q6.quatre_plus);
        const AtLeastTwoCondition =client.singleChoice.any(Q6.key, responses.Q6.deux, responses.Q6.trois, responses.Q6.quatre_plus);
        const AtLeastOneCondition =client.singleChoice.any(Q6.key, responses.Q6.un, responses.Q6.deux, responses.Q6.trois, responses.Q6.quatre_plus);
        const hasFourCondition =client.singleChoice.any(Q6.key, responses.Q6.quatre_plus);
        
        const Q6_1 = new PiqureGroup(rootKey, 'Q6_1', '[Première piqûre]', 1, AtLeastOneCondition);
        this.addItem(Q6_1.get());
        
        this.addPageBreak();

        const Q6_2 = new PiqureGroup(rootKey, 'Q6_2', '[Deuxième piqûre]', 2, AtLeastTwoCondition);
        this.addItem(Q6_2.get());

        this.addPageBreak();

        const Q6_3 = new PiqureGroup(rootKey, 'Q6_3', '[Troisième piqûre]', 3, AtLeastThreeCondition);
        this.addItem(Q6_3.get());
        this.addPageBreak();

        const Q6_4 = new PiqureGroup(rootKey, 'Q6_4', '[Quatrième piqûre]', 4, hasFourCondition);
        this.addItem(Q6_4.get());

        this.addPageBreak();

        const pS3 = this.preludeS3(rootKey, "preludeS3");
        this.addItem(pS3);
        
        const Q7 = YesNo(rootKey, 'Q7', _T('Q7.text', 'Avez-vous pratiqué une activité de plein air au cours des 4 derniers mois ? '));
        this.addItem(Q7);

        const hasOutsideOccupation = client.singleChoice.any(Q7.key, responses.yes_no.yes);

        const s3 = new Section3(rootKey, 's3', hasOutsideOccupation);

        this.addItem(s3.get());

        this.addPageBreak();

        const Q13 = this.Q13(rootKey);

        this.addItem(Q13);

    }

    Q13(parent: string): SurveyItem {
        return SurveyItems.textInput({
            parentKey: parent,
            itemKey: 'Q13',
            questionText: _T("Q13.text", "Avez vous des remarques ou commentaires à partager ?")
        });
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
            questionText: _T("Q1.text", "Avez-vous déjà entendu parler des tiques ou des maladies transmises par les tiques (exemple : la borréliose de Lyme, l'encéphalite à tiques) ?"),
            responseOptions: [
                as_option(codes.yes, _T('Q1.option.yes', 'Oui')),
                as_option(codes.no, _T('Q1.option.no', 'Non')),
              //  as_option(codes.dnk, _T('Q0.option.dnk', 'Je ne sais pas/ne m’en souviens pas')),   
            ]
        });
    }
    
    Q2 = (parent: string, condition?: Expression)=> {
        return YesNo(parent, 'Q2', _T("Q2.text", "Avez-vous déjà été eu une maladie transmise par une tique dans votre vie ?"), condition);
    }
    
    Q2b = (parent: string, condition?: Expression)=> {
        const codes = responses.Q2b;
        return SurveyItems.singleChoice({
            parentKey: parent,
            condition: condition,
            itemKey: 'Q2b',
            questionText: _T("Q2b.text", "De quelle(s) maladie(s) s’agissait-il ? Si plusieurs, indiquez la plus récente"),
            responseOptions: [
                as_option(codes.lyme, _T('Q2b.option.lyme', 'Borréliose de Lyme')),
                as_option(codes.encephalitis, _T('Q2b.option.encephalitis', 'Encéphalite à tique')),
                as_input_option(codes.other, _T('Q2b.option.other', 'Autre, préciser (champ libre)')),   
            ]
        });
    }

    Q3(parent: string, condition?: Expression) {
        const codes = responses.Q3;     

        return SurveyItems.multipleChoice({
            parentKey: parent,
            condition: condition,
            itemKey: 'Q3',
            questionText: _T("Q3.text", "Votre lieu de résidence a-t-il ?"),
            responseOptions: [
                    as_option(codes.jardin, _T('Q3.option.1','Un jardin')),
                    as_option(codes.terrain, _T('Q3.option.2',"Un champs/un terrain")),
                    as_option(codes.terrasse, _T('Q3.option.3',"Une terrasse/un balcon/une cour")),
                    as_option(codes.no, _T('Q3.option.4',"Pas d’extérieur")),
                ]
        });
    }
    
    Q4(parent: string, condition?: Expression) {
        return YesNo(parent, 'Q4', _T('Q4.text', 'Vous êtes-vous déjà fait piquer par une tique au cours de votre vie ?'), condition);
    }

    Q5(parent: string, condition?: Expression) {
        return YesNo(parent, 'Q5', _T('Q5.text', 'Vous êtes-vous fait piquer par au moins une tique au cours des 4 derniers mois '), condition);
    }

    Q6(parent:string, condition?: Expression) {

        const codes = responses.Q6;

        const note = "Note importante: Si vous vous êtes fait piquer par plusieurs tiques au cours de la même sortie, ne comptez cet épisode de piqûres que comme une seule fois";


        return SurveyItems.singleChoice({
            parentKey: parent,
            condition: condition,
            itemKey: 'Q6',
            questionText: _T("Q6.text", "Combien de fois vous êtes-vous fait piquer par une tique (ou plusieurs tiques) au cours des 4 derniers mois ?"),
            topDisplayCompoments: [
                textComponent({
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
                as_option(codes.dnk, _T('Q6.option.nsp', 'Je ne sais pas')),
            ]
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

    constructor(parentKey:string, groupKey: string, condition?:Expression) {
        super(parentKey, groupKey);
        this.groupEditor.setCondition(condition);
    }

    buildGroup(): void {
    
        const Q8 = this.Q8(this.key);

        this.addItem(Q8);

        const Q9 = this.Q9(this.key);
        this.addItem(Q9);

        const Q10 = this.Q10(this.key);
        this.addItem(Q10);

        const Q11 = YesNo(this.key, 'Q11', _T('Q11.text', "Lors de ces activités de plein air, avez-vous mis en place des mesures de prévention contre les piqûres d'insectes ou de tiques (e.g., pantalons longs, t-shirt manches longues, utilisation d’insecticides…) ") )
        this.addItem(Q11);

        const YesOnQ11 = client.singleChoice.any(Q11.key, responses.yes_no.yes);
        const Q12 = this.Q12(this.key, YesOnQ11);
        this.addItem(Q12);

    }
        
    Q8(parent:string, condition?: Expression):SurveyItem {
        const oo =  options_french([
            ['1', "Activité professionnelle"],
            ['2', "Chasse, pêche"],
            ['3', "Activité scolaire"],
            ['4', "Sport (course à pied en milieu naturel ou jeu collectif sur gazon)"],
            ['5', "Loisir (randonnée, promenade, pique-nique, jardinage, etc.)"],
        ], 'Q8.option.');

        oo.push(as_input_option("6", _T("Q8.option.autre", "Autre"), common_other))

        return SurveyItems.multipleChoice({
            parentKey: parent,
            itemKey: 'Q8',
            questionText: _T("Q8.text", "Quel type d'activité de plein air avez-vous pratiqué au cours des 4 derniers mois (toute confondues)"),
            responseOptions: oo,
            condition: condition
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

        oo.push(as_input_option("7", _T("Q9.option.autre", "Autre"), common_other))

        return SurveyItems.multipleChoice({
            parentKey: parent,
            itemKey: 'Q9',
            questionText: _T("Q9.text", "Dans quel(s) environnement(s) avez-vous pratiqué cette ou ces activités de plein air, au cours des 4 derniers mois ?"),
            responseOptions: oo,
            condition: condition
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
            questionText: _T("Q10.text", "A quelle fréquence avez-vous pratiqué cette ou ces activités de plein air, au cours des 4 derniers mois ?"),
            responseOptions: oo,
            condition: condition
        });
    }

    Q12(parent:string, condition?: Expression) {

        const oo = options_french([
        ['0', "Très rarement"],
        ['1',"Parfois"],
        ['2',"Souvent"],
        ['3',"Toujours"],
        ], 'Q12.option.');

        return SurveyItems.singleChoice({
            parentKey: parent,
            itemKey: 'Q12',
            questionText: _T("Q12.text", "A quelle fréquence avez-vous mis en place des mesures de prévention contre les piqûres d'insectes ou de tiques (e.g., pantalons longs, t-shirt manches longues, utilisation d’insecticides…) "),
            responseOptions: oo,
            condition: condition
        });
    }
}

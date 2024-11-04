
import { Group, Item, OptionDef, SurveyDefinition } from "case-editor-tools/surveys/types";
import { _T, K } from "./helpers";
import { surveyInfo } from "./data";
import { ChoiceQuestion, LikertQuestion, MonthDateQuestion, NumberDontKnowQuestion, NumericQuestion, SurveyEnd, TitleQuestion,RandomCodeQuestion, MarkdownQuestion } from "./question";
import { GroupQuestion, SimpleGroupQuestion, SurveyBuilder, ClientExpression as client, make_exclusive_options } from "../common";
import { SurveyItems,  } from "case-editor-tools/surveys";
export class PuliSurvey extends SurveyBuilder {

    constructor(meta?:Map<string,string>) {
        super({
            surveyKey: 'puli',
            name:_T("name.0", "Questionnaire punaise de lit"),
            description: new Map<string,string>(),
            durationText: _T("typicalDuration.0", "5 à 10 minutes"),
        });
        this.create();
    }

    create(): void {

        const prelude = new MarkdownQuestion(this.key, 'prelude');

        this.push(prelude);

        

        const q1 = new ChoiceQuestion(this.key, 'q1', 'single', {'required': true});   
        
        this.push(q1);

        const g = this.buildMainGroup();
        this.push(g, q1.createConditionFrom(["1" ]));

        const end = new SurveyEnd(this.key, "Merci pour votre réponse ! Nous n'avons pas de questions supplémentaires à vous poser. A bientôt !");
        this.push(end);
    }

    buildMainGroup(): Group {
        const main = new SimpleGroupQuestion({parentKey: this.key}, 'g0');
        const root = main.key;

        const t1 = new TitleQuestion(root,'t1', "Caractéristiques de l'infestation");
        main.add(t1);
        
        
        const qDom = new ChoiceQuestion(root, 'q2','single', {'required': true});
        main.add(qDom);
        const domCondition = qDom.createConditionFrom(['1']);
        const outsideCondition = qDom.createConditionFrom(["0"]);

        const groupInfestDom = this.buildInfestationDomicile(root);
        main.add(groupInfestDom, domCondition);
       
        const groupOutsideDom = this.buildInfestationOutside(root);
        main.add(groupOutsideDom, outsideCondition);

        this.buildSkinLesion(main);

        this.buildImpact(main);

        this.buildActivities(main);

        this.buildHealthSeeking(main);

        this.buildEradication(main);
        return main;
    }

    buildInfestationDomicile(rootKey: string): Group {
        const g = new SimpleGroupQuestion({parentKey: rootKey}, 'g1');
        const groupKey = g.key;

        const startDate = new MonthDateQuestion(groupKey, 'q3');
        startDate.required(true);
        g.add(startDate);

        const still = new ChoiceQuestion(groupKey, 'q4', 'single');
        g.add(still);

        const endDate = new MonthDateQuestion(groupKey, 'q5');
        endDate.addLesssOneMonth = "Cette infestation a duré moins d’un mois";
          
        const endDateAfterStart = client.compare.gte(
            endDate.getDateValue(),
            startDate.getDateValue(),
        );

        //endDate.setValication({"condition": endDateAfterStart, "message": "La date de fin doit être postérieure à la date de début"});

        g.add(endDate, still.createConditionFrom(['0']));
        
        // EndDate > StartDate && StartDate + 3 month > EndDate
        const lessThan3month = client.logic.and(
            endDateAfterStart,
            client.logic.or(
                client.responseHasKeysAny(endDate.key, 'rg.scg', '2'),
                client.compare.gt(
                    client.timestampWithOffset({months: 3}, client.getResponseValueAsNum(startDate.key, MonthDateQuestion.DateComponent)),
                    client.getResponseValueAsNum(endDate.key, MonthDateQuestion.DateComponent)
                )
            )
            
        )

        const delay = new NumericQuestion(groupKey, 'q6', {min: 0});
        g.add(delay, lessThan3month);

        // Q7 : "Les punaises de lit ont-elles été vues dans votre logement
        const q7 = new ChoiceQuestion(groupKey, 'q7', 'single', {'required': true});
        g.add(q7);
        const inHouseCondition = q7.createConditionFrom(["1"]);

        const q8 = new ChoiceQuestion(groupKey, 'q8', 'single');
        g.add(q8, inHouseCondition);

        const qCode = new RandomCodeQuestion(groupKey, 'q8b', 'code', _T('code', 'Merci de nous envoyer la/les photo(s) par e-mail à punaisedelit@iplesp.upmc.fr avec en objet le code affiché ci-dessous'));
        g.add(qCode, q8.createConditionFrom(["1"]));

        // TODO: Exclusive option 
        const q9 = new ChoiceQuestion(groupKey, 'q9', 'multiple', {'otherOptions': ["7"], exclusive: ['3']});
        g.add(q9, inHouseCondition);

        // Professionnal seen
        const qProf = new ChoiceQuestion(groupKey, "q11", "single", {"required": true});
        g.add(qProf);
        const profCond = qProf.createConditionFrom(['1','2']);

        const qProfQuels = new ChoiceQuestion(groupKey, "q12", "multiple", {'otherOptions': ["7"], exclusive: ['3'], "required": true})
        g.add(qProfQuels, profCond);

        const qProvenance = new ChoiceQuestion(groupKey, "q14", "multiple",  {'otherOptions': ["7"], exclusive: ['3']});
        g.add(qProvenance);

        const qLieu = new ChoiceQuestion(groupKey, "q16", "single");
        g.add(qLieu);

        const qDelayExpo = new NumericQuestion(groupKey, "q17", {'min': 0});
        g.add(qDelayExpo);

        const qFirstTime = new ChoiceQuestion(groupKey, 'q18', "single");
        g.add(qFirstTime);
        const notFirstTime = qFirstTime.createConditionFrom(["0"]);

        const qCountTimes = new NumericQuestion(groupKey, "q19", {'min': 0});
        g.add(qCountTimes, notFirstTime);

        const qTypeLogement = new ChoiceQuestion(groupKey, "q20", "single", {"otherOptions": ["7"]});
        g.add(qTypeLogement);

        return g;
    }

    buildInfestationOutside(rootKey:string): Group {
        const g = new SimpleGroupQuestion({parentKey: rootKey}, 'g2');
        const groupKey = g.key;

        const qWhereFrom = new ChoiceQuestion(groupKey, "q22", "multiple", {"otherOptions": ["7"], exclusive: ["3"]})
        g.add(qWhereFrom);

        const qFrance = new ChoiceQuestion(groupKey, "q24", "single");
        g.add(qFrance);

        const qDate = new MonthDateQuestion(groupKey, "q25");
        g.add(qDate);
        return g;
    }

    buildSkinLesion(g: SimpleGroupQuestion) {
        const root = g.key;
        const t1 = new TitleQuestion(root,'t2', "Lésions cutanées");
        g.add(t1);

        const q26 = new ChoiceQuestion(root, "q26", "single", {"required": true});
        g.add(q26);
        const yesCond = q26.createConditionFrom(["1"]);

        const q27 = new ChoiceQuestion(root, "q27", "multiple", {"exclusive": ["3"]});
        g.add(q27, yesCond);
        
        const q28 = new ChoiceQuestion(root, "q28", "multiple", {"exclusive": ['3']});
        g.add(q28, yesCond);

        const q29 = new ChoiceQuestion(root, "q29", "single");
        g.add(q29, yesCond);

        const q30 = new ChoiceQuestion(root, "q30", "single");
        g.add(q30, yesCond);
    } 

    buildImpact(g: SimpleGroupQuestion) {
        
        const root = g.key;

        const title = new TitleQuestion(root, "t3", "Impact psychologique");
        g.add(title);
        
        const q31 = new ChoiceQuestion(root, "q31", "single", {"required": true});
        g.add(q31);
        const hasImpactCond = q31.createConditionFrom(["4","5","6"]);

        const q32 = new ChoiceQuestion(root, "q32", "single", {"required": true});
        g.add(q32);

        const q33 = new ChoiceQuestion(root, "q33", "single");
        g.add(q33, q32.createConditionFrom(['4','5','6']));

        const qx = new LikertQuestion(root, "q34");
        g.add(qx);

        const qx1 = new ChoiceQuestion(root, 'q35', 'single');
        g.add(qx1);
        const condQx1 = qx1.createConditionFrom(['4','5','6']);

        const qx2 = new ChoiceQuestion(root, 'q36', 'multiple', {"otherOptions": ["7"]});
        g.add(qx2, condQx1);
    }

    buildActivities(g: SimpleGroupQuestion) {
        const root = g.key;
        const title = new TitleQuestion(root, 't4', "Impact sur les activités");

        g.add(title);

        const qx4 = new LikertQuestion(root, 'q38');
        g.add(qx4);
    }

    buildHealthSeeking(g: SimpleGroupQuestion) {
        const root = g.key;
        const title = new TitleQuestion(root, 't5', "Recours aux soins");
        g.add(title);

        const qx5 = new ChoiceQuestion(root, 'q39', 'single', {"required": true});
        g.add(qx5);
        const qx5Yes = qx5.createConditionFrom(["1"]);
        
        const qx6 = new ChoiceQuestion(root, "q40", "single");
        g.add(qx6, qx5Yes);

        const qx7 = new ChoiceQuestion(root, "q41", "single");
        g.add(qx7, qx5Yes);

        const qx8 =  new ChoiceQuestion(root, "q42", "single");
        g.add(qx8);
        const qx8Yes = qx8.createConditionFrom(["1"]);

        const qx9 = new ChoiceQuestion(root, "q43", "multiple", {"otherOptions":[ "7" ]});
        g.add(qx9, qx8Yes );

        const qx11 = new ChoiceQuestion(root, "q45", "single");
        g.add(qx11);

        const qx12 = new ChoiceQuestion(root, "q46", "multiple", {"otherOptions": ["7"]});
        g.add(qx12, qx11.createConditionFrom(["1"]));

        if(!qx5Yes || !qx8Yes) {
            throw new Error("Unable to create condtion qx8Yes or qx5Yes");
        }

        const visitCond = client.logic.or(
            qx5Yes, qx8Yes
        );

        const qx14 = new ChoiceQuestion(root, "q48","single");
        g.add(qx14, visitCond);

        const qx15 = new ChoiceQuestion(root, "q49", "multiple", {"otherOptions": ["7"], "exclusive": ["3"]});
        g.add(qx15, qx14.createConditionFrom(["1"]));

        const qx16 = new ChoiceQuestion(root, "q50", "single");
        g.add(qx16, visitCond);

        const qx17 = new NumberDontKnowQuestion(root, "q51", {"inputLabel": "Nombre de jours"});
        g.add(qx17, qx16.createConditionFrom(["1","2"]));
    }

    buildEradication(g: SimpleGroupQuestion) {
        const root = g.key;
        const title = new TitleQuestion(root, 't6', "Eradication");
        g.add(title);

        const qx18 = new ChoiceQuestion(root, "q52", "multiple", {"otherOptions": ["7"]});
        g.add(qx18);

        const qx19 = new ChoiceQuestion(root, "q54", "single");
        g.add(qx19);
    }

}

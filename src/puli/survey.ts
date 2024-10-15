
import { Group, Item, OptionDef, SurveyDefinition } from "case-editor-tools/surveys/types";
import { _T, K } from "./helpers";
import { surveyInfo } from "./data";
import { ChoiceQuestion, MonthDateQuestion, NumericQuestion, SurveyEnd, TitleQuestion } from "./question";
import { GroupQuestion, SimpleGroupQuestion, SurveyBuilder, ClientExpression as client, make_exclusive_options } from "../common";
import { SurveyItems,  } from "case-editor-tools/surveys";
import { sign } from "crypto";

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
        const q1 = new ChoiceQuestion(this.key, 'q1', 'single');   
        this.push(q1);

        const g = this.buildMainGroup();
        this.push(g, q1.createConditionFrom(["1" ]));

        const end = new SurveyEnd(this.key, "C'est fini");
        this.push(end);
    }

    buildMainGroup(): Group {
        const main = new SimpleGroupQuestion({parentKey: this.key}, 'g0');
        const root = main.key;

        const t1 = new TitleQuestion(root,'t1', "Caractéristiques de l'infestation");
        
        main.add(t1);
        
        const qDom = new ChoiceQuestion(root, 'q2o1','single');
        main.add(qDom);
        const domCondition = qDom.createConditionFrom(['1']);


        const groupInfestDom = this.buildInfestationDomicile(root);
        main.add(groupInfestDom, domCondition);
       
        return main;
    }

    buildInfestationDomicile(rootKey: string): Group {
        const g = new SimpleGroupQuestion({parentKey: rootKey}, 'g1');
        const groupKey = g.key;

        const startDate = new MonthDateQuestion(groupKey, 'q3o2');
        g.add(startDate);

        const still = new ChoiceQuestion(groupKey, 'q4o2', 'single');
        g.add(still);

        const endDate = new MonthDateQuestion(groupKey, 'q5n4');
        g.add(endDate, still.createConditionFrom(['0']));
        
        const lessThan3month = client.compare.lt(
            client.timestampWithOffset({months: 3}, client.getResponseValueAsNum(startDate.key, MonthDateQuestion.DateComponent)),
            client.getResponseValueAsNum(endDate.key, MonthDateQuestion.DateComponent)
        );

        const delay = new ChoiceQuestion(groupKey, 'q6o2', 'single');
        g.add(delay, lessThan3month);

        const q1 = new ChoiceQuestion(groupKey, 'q7o2', 'single');
        g.add(q1);
        const inHouseCondition = q1.createConditionFrom(["1"]);

        // TODO: Question avec code
        const q8 = new ChoiceQuestion(groupKey, 'q8o7', 'single');
        g.add(q8, inHouseCondition);


        // TODO: Exclusive option 
        const q9 = new ChoiceQuestion(groupKey, 'q9o7', 'multiple', {'otherOptions': ["7"]});
        g.add(q9);

        // Professionnal seen
        const qProf = new ChoiceQuestion(groupKey, "q11o2", "single");
        g.add(qProf);
        const profCond = qProf.createConditionFrom(['1','2']);

        const qProfQuels = new ChoiceQuestion(groupKey, "q12o11", "multiple", {'otherOptions': ["7"]})
        g.add(qProfQuels, profCond);


        const qProvenance = new ChoiceQuestion(groupKey, "q14o2", "multiple",  {'otherOptions': ["7"]});
        g.add(qProvenance);

        const qLieu = new ChoiceQuestion(groupKey, "q16o2", "single");
        g.add(qLieu);

        const qDelayExpo = new NumericQuestion(groupKey, "q17o2");
        g.add(qDelayExpo);

        return g;
    }
}

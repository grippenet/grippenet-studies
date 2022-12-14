import { SurveyItems } from "case-editor-tools/surveys"
import { Group } from "case-editor-tools/surveys/types";
import { Expression, SurveySingleItem } from "survey-engine/data_types";
import { ItemQuestion, exp_as_arg, ClientExpression as client, as_option, as_input_option, option_def, textComponent } from "../common";
import { _T, options_french } from "./helpers";
import responses from "./responses";

interface QProps {
    condition?: Expression
}

export class Q10a extends ItemQuestion {

    label: string;

  constructor(parent: string, itemKey:string, label:string ) {
    super({parentKey: parent }, itemKey);
    this.label = label;
  } 
  
  buildItem(): SurveySingleItem {
        return SurveyItems.singleChoice({
        parentKey: this.parentKey,
        itemKey: this.itemKey,
        isRequired: this.isRequired,
        condition: this.condition,
        questionText: new Map<string,string>([ ['fr', this.label]] ),
        responseOptions: [
            {
                key: '1', role: 'dateInput',
                optionProps: {
                    dateInputMode: { str: 'YM' },
                    min: exp_as_arg( client.timestampWithOffset({'years': -1})),
                    max: exp_as_arg( client.timestampWithOffset({'minutes': 1}) )
                },
                content: _T("Q10a.option.date", "Choose date"),
                description: _T("Q10a.option.date.desc","desc")
            },
            as_option('0', _T("Q10a.option.0.text", "No")),
            as_option('2', _T("Q10a.option.2.text", "I don't know (anymore)"))
        ]
    });
  }
}


export const YesNo = (parent: string, key: string, text: Map<string, string>, condition?:Expression)=> {
  const codes = responses.yes_no;
  return SurveyItems.singleChoice({
      parentKey: parent,
      itemKey: key,
      condition: condition,
      questionText: text,
      responseOptions: [
          as_option(codes.yes, _T('common.yes_no.yes', 'Oui')),
          as_option(codes.no, _T('common.yes_no.no', 'Non')),
          as_option(codes.dnk, _T('common.yes_no.dnk', 'Je ne sais pas/ne m’en souviens pas')),   
      ]
  });
}

interface OrderLabels {
  [key: string]: {
    masc: string;
    fem?: string;
  }
}

const orders: OrderLabels = {
  '1': { masc: 'premier', fem:'première'},
  '2': { masc:'deuxième'},
  '3': { masc:'troisième' },
  '4': { masc:'quatrième'}
};

export const common_other = _T("common.other", "Précisez");

export class PiqureGroup extends Group {

    labelPrefix: string;
    index : number;

    constructor(parent: string, key: string, labelPrefix: string, index: number, condition: Expression) {
       super(parent, key);
       this.labelPrefix = labelPrefix;
       this.index = index;
       this.groupEditor.setCondition(condition);
    }

    orderLabels() {
      const orderLabels = orders['' + this.index];

      const masc = orderLabels.masc
      const fem = orderLabels.fem ? orderLabels.fem : orderLabels.masc;

      return [masc, fem];
    }

    buildGroup() {
      
      const [orderMasc, orderFem] = this.orderLabels();
     
      const textPrelude = "Les questions suivantes permettront d’en savoir plus sur votre "+  orderMasc + " épisode de piqûre(s) de tiques au cours de ces 4 derniers mois. Répondez le plus précisément possible";

      const prelude = SurveyItems.display({
        parentKey: this.key,
        itemKey: 'prelude',
        content: [
          textComponent({
            content: _T(this.key + '.prelude', textPrelude)
          })
        ]
      });
      this.addItem(prelude);
      
      const t1 = this.key + '.1';
      const Q1 = SurveyItems.singleChoice({
        parentKey: this.key,
        itemKey: '1',
        questionText: _T(t1 + '.text', this.labelPrefix+ ' combien de tiques vous ont piqué lors de ce '+ orderMasc +' épisode de piqûre(s)'),
        responseOptions: [
          as_option('1', _T(t1 + '.option.1', 'Une tique')),
          option_def('2', _T(t1 + '.option.2', 'Deux tiques ou plus (i.e. piqûres multiples)'), {
            'role':'numberInput', 
            optionProps: { 'min': 2},
            'description': _T(t1, 'Precisez le nombre')
          })
        ]
      });

      this.addItem(Q1);

      const minDate = client.timestampWithOffset({'months': -4});

      const t2 = this.key + '.1';

      const date_input = (key:string,  label: string) => {
          return option_def(key, _T(this.key + '.option.' + key, label), {
            role: 'dateInput',
            optionProps: {
              min: exp_as_arg(minDate),
              max: exp_as_arg(client.timestampWithOffset({minutes:0}))
            }
          })
      }
      
      const Q2 = SurveyItems.singleChoice({
        parentKey: this.key,
        itemKey: '2',
        questionText: _T(t2 + '.text', this.labelPrefix+ "Quand a eu lieu ce "+ orderMasc +" épisode de piqûre(s)"),
        responseOptions: [
          date_input("1", "La date exacte"),
          date_input("2", "à 2- 3 jours près"),
          date_input("3", "à une semaine près"),
          date_input("4", "à un mois près"),
          as_option("99", _T(t2 + ".option.nsp", "Je ne sais pas/Je ne m'en souviens pas"))
        ]
      });

      this.addItem(Q2);

      const t3 = this.key + '.3';

      const Q3 = SurveyItems.singleChoice({
        parentKey: this.key,
        itemKey: '3',
        questionText: _T(t2 + '.text', this.labelPrefix+ " Quand a eu lieu ce "+ orderMasc +" épisode de piqûre(s)"),
        responseOptions: [
          as_input_option("1", _T(t3, "Code postal ou commune")),
          as_option("99", _T(t3 + ".option.nsp", "Je ne sais pas/Je ne m'en souviens pas"))
        ]
      });

      this.addItem(Q3);

      const hasLocation = client.singleChoice.any(Q3.key, '1');
      
      const Q5 = YesNo(this.key, '5', _T(this.key + '.5', this.labelPrefix + ' Le lieu de piqûre(s) se trouvait-il dans votre commune de résidence ?'), hasLocation);
      this.addItem(Q5);

      const Q6 = YesNo(this.key, '6', _T(this.key + '.6', this.labelPrefix + ' Le lieu de piqûre(s) se trouvait-il dans votre département de résidence ?'), hasLocation);
      this.addItem(Q6);

      const t7 = this.key + '.7';

      const oo = options_french([
        ['1', 'Forêt (lisière de forêt, bois, bosquet, …)'], 
        ['2', 'Prairie (herbes hautes, champs, …)'], 
        ['3', 'Jardin privé'], 
        ['4', 'Zone agricole cultivée'], 
        ['5', 'Parc public/municipal'], 
        ['6', 'Intérieur d’une habitation'], 
        ['7', 'Ferme d’élevage'], 
        ['8', 'Plan d’eau'], 
      ], t7 + '.option.');

      oo.push(as_input_option('9', _T(t7 + '.option.other','Autre'), common_other ));
      oo.push(option_def('99', _T(t7 + '.option.nsp', "Je ne sais pas/ne me souviens pas")))

      const Q7 = SurveyItems.multipleChoice({
        parentKey: this.key,
        itemKey: '7',
        questionText: _T(t7 + ".text", this.labelPrefix + " Dans quel(s) environnement(s) vous êtes-vous fait piquer ?"),
        responseOptions: oo
      });

      this.addItem(Q7);
      
      const t8 = this.key + '.8';

      const o8 = options_french([
        ['1', 'Activité professionnelle'],
        ['2', 'Chasse, pêche',],
        ['3', 'Activité scolaire: précisez',],
        ['4', 'Activité sportive: précisez',],
        ['5', 'Loisir (randonnée, promenade, pique-nique…)',],
      ], t8 + '.option.');

      o8.push(as_input_option('6', _T(t8 + '.option.other','Autre'), common_other));
      o8.push(option_def('99', _T(t8 + '.option.nsp', "Je ne sais pas/ne me souviens pas")))

      const Q8 = SurveyItems.singleChoice({
        parentKey: this.key,
        itemKey: '8',
        questionText: _T(t8 + ".text", this.labelPrefix +" A quelle occasion vous êtes-vous fait piquer?"),
        responseOptions: oo
      });
      
      this.addItem(Q8);

      const t9 = this.key + '.9';

      const o9 = options_french([
        ['1', "Le jour même (< 24h)"],
        ['2', "Le lendemain ou plus tard (> 24h)"],
        ['3', "Elle est tombée toute seule"],
        ['99', "Je ne sais pas/ ne me souviens pas"],
      ], t9 + '.option.');

      const Q9 = SurveyItems.multipleChoice({
        parentKey: this.key,
        itemKey: '9',
        questionText: _T(t9 + ".text", this.labelPrefix +" Lors de ce premier épisode de piqûre(s), avez-vous retiré la/les tique(s)"),
        responseOptions: o9
      });

      this.addItem(Q9);

      const t10 = this.key + '.10';

      const Q10 = SurveyItems.multipleChoice({
        parentKey: this.key,
        itemKey: '10',
        questionText: _T(t10 + ".text", this.labelPrefix + " Lors de ce premier épisode de piqûre(s), avez-vous retiré la/les tique(s)"),
        responseOptions: [
          option_def('1', _T(t10 + '.option.1', "Avec un tire-tique")),
          option_def('2', _T(t10 + '.option.2' , "Avec une pince à écharde")),
          as_input_option('3', _T(t10 + '.option.3', "Avec un autre outil"), common_other),
          option_def('4', _T(t10 + '.option.4', "Sans outil (à la main)"))
        ]
      });

      this.addItem(Q10);

      const t11 = this.key + '.11';

      const o11 = options_french([
        ["1","Vous-même"],
        ["2","Un de vos proches"],
        ["3","Un professionnel de santé"],
        ["99","Je ne sais pas/ ne me souviens pas"],    
      ], t11 + '.option.');

      const Q11 = SurveyItems.multipleChoice({
        parentKey: this.key,
        itemKey: '11',
        questionText: _T(t11 + ".text", this.labelPrefix +" Lors de ce premier épisode de piqûre(s), avez-vous retiré la/les tique(s)"),
        responseOptions: o11
      });

      this.addItem(Q11);

      const Q12 = YesNo(this.key, '12', _T(this.key + '.12', this.labelPrefix + " Êtes-vous allé consulter un médecin suite à cet épisode de piqûre ?"));
      this.addItem(Q12);

    }

}
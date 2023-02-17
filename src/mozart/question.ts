import { SurveyItems } from "case-editor-tools/surveys"
import { Group } from "case-editor-tools/surveys/types";
import { Expression, SurveySingleItem } from "survey-engine/data_types";
import { ItemQuestion, exp_as_arg, ClientExpression as client, as_option, as_input_option, option_def, textComponent, optionRoles } from "../common";
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

const several_answer = _T("common.multiple_choice", "Plusieurs réponses possibles");

export const common_other = _T("common.other", "Précisez");

const ucfirst = (s:string)=>{
  return  s.charAt(0).toUpperCase() + s.slice(1);
}

export class PiqureGroup extends Group {

    index : number;

    constructor(parent: string, key: string, index: number, condition: Expression) {
       super(parent, key);
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
     
      const titlePrelude = ucfirst(orderMasc) + " épisode de piqûre(s)";

      const textPrelude = "Les questions suivantes permettront d’en savoir plus sur votre "+  orderMasc + " épisode de piqûre(s) de tiques au cours de ces 4 derniers mois. Répondez le plus précisément possible";

      const prelude = SurveyItems.display({
        parentKey: this.key,
        itemKey: 'prelude',
        
        content: [
          textComponent({
            content: _T(this.key+ '.prelude.title', titlePrelude),
            variant: 'h1'
          }),
          textComponent({
            content: _T(this.key + '.prelude', textPrelude)
          })
        ]
      });
      this.addItem(prelude);

      const textPrefix = '[' + orderMasc + ' épisode]';
      
      const t1 = this.key + '.1';
      const Q1 = SurveyItems.singleChoice({
        parentKey: this.key,
        itemKey: '1',
        questionText: _T(t1 + '.text', textPrefix + ' combien de tiques vous ont piqué lors de ce '+ orderMasc +' épisode de piqûre(s) ?'),
        responseOptions: [
          as_option('1', _T(t1 + '.option.1', 'Une tique')),
          option_def('2', _T(t1 + '.option.2', 'Deux tiques ou plus (i.e. piqûres multiples)'), {
            'role':'numberInput', 
            optionProps: { 'min': 2},
            'description': _T(t1, 'Précisez le nombre')
          })
        ]
      });

      this.addItem(Q1);

      const minDate = client.timestampWithOffset({'months': -4});

      const t2 = this.key + '.1';

      const date_input = (key:string,  label: string, mode?: 'YMD' | 'YM') => {
          
          return option_def(key, _T(this.key + '.option.' + key, label), {
            role: optionRoles.date,
            description: _T(this.key + '.option.' + key, label),
            optionProps: {
              min: exp_as_arg(minDate),
              max: exp_as_arg(client.timestampWithOffset({minutes:0})),
              dateInputMode: mode
            }
          })
      }
      
      const Q2 = SurveyItems.singleChoice({
        parentKey: this.key,
        itemKey: '2',
        questionText: _T(t2 + '.text', textPrefix + " Quand a eu lieu ce " + orderMasc + " épisode de piqûre(s)"),
        questionSubText: _T(t2 + ".subtext", "Répondez dans le champs date qui correspond le mieux à la précision dont vous vous souvenez pour cette épisode"),
        responseOptions: [
          date_input("1", "La date exacte"),
          date_input("2", "à 2- 3 jours près"),
          date_input("3", "à une semaine près"),
          date_input("4", "à un mois près", 'YM'),
          as_option("99", _T(t2 + ".option.nsp", "Je ne sais pas/ne m'en souviens pas"))
        ]
      });

      this.addItem(Q2);

      const t3 = this.key + '.3';

      const Q3 = SurveyItems.singleChoice({
        parentKey: this.key,
        itemKey: '3',
        questionText: _T(t3 + '.text', textPrefix + " Où étiez-vous au moment de ce(s) piqûre(s)"),
        responseOptions: [
          as_input_option("1", _T(t3, "Code postal ou commune")),
          as_option("99", _T(t3 + ".option.nsp", "Je ne sais pas/ne m'en souviens pas"))
        ]
      });

      this.addItem(Q3);

      const Q4 = YesNo(this.key, '4', _T(this.key + '.4', textPrefix + ' Le lieu de piqûre(s) se trouvait-il dans votre commune de résidence ?'));
      this.addItem(Q4);

      const notInCommune = client.singleChoice.any(Q4.key, responses.yes_no.no, responses.yes_no.dnk)

      const Q5 = YesNo(this.key, '5', _T(this.key + '.5', textPrefix + ' Le lieu de piqûre(s) se trouvait-il dans votre département de résidence ?'), notInCommune);
      
      this.addItem(Q5);

      const t6 = this.key + '.6';

      const oo = options_french([
        ['1', 'Forêt (lisière de forêt, bois, bosquet, …)'], 
        ['2', 'Prairie (herbes hautes, champs, …)'], 
        ['3', 'Jardin privé'], 
        ['4', 'Zone agricole cultivée'], 
        ['5', 'Parc public/municipal'], 
        ['6', 'Intérieur d’une habitation'], 
        ['7', 'Ferme d’élevage'], 
        ['8', 'Plan d’eau'], 
      ], t6 + '.option.');

      oo.push(as_input_option('9', _T(t6 + '.option.other','Autre'), common_other ));

      const Q6_key = '6';
      const Q6_unknown = '99';
      const Q6_exclusive = client.multipleChoice.any(this.key + '.' + Q6_key, Q6_unknown)
      oo.forEach(o=>{
        o.disabled = Q6_exclusive;
      });

      oo.push(option_def(Q6_unknown, _T(t6 + '.option.nsp', "Je ne sais pas/ne me souviens pas")))

      const Q6 = SurveyItems.multipleChoice({
        parentKey: this.key,
        itemKey: Q6_key,
        questionText: _T(t6 + ".text", textPrefix + " Dans quel(s) environnement(s) vous êtes-vous fait piquer ?"),
        questionSubText: several_answer,
        responseOptions: oo
      });

      this.addItem(Q6);
      
      const t7 = this.key + '.7';

      const o7 = options_french([
        ['1', 'Activité professionnelle'],
        ['2', 'Chasse, pêche',],
        ['3', 'Activité scolaire: précisez',],
        ['4', 'Activité sportive: précisez',],
        ['5', 'Loisir (randonnée, promenade, pique-nique…)',],
      ], t7 + '.option.');

      o7.push(as_input_option('6', _T(t7 + '.option.other','Autre'), common_other));
      o7.push(option_def('99', _T(t7 + '.option.nsp', "Je ne sais pas/ne me souviens pas")))

      const Q7 = SurveyItems.singleChoice({
        parentKey: this.key,
        itemKey: '7',
        questionText: _T(t7 + ".text", textPrefix +" A quelle occasion vous êtes-vous fait piquer?"),
        responseOptions: o7
      });
      
      this.addItem(Q7);

      const t8 = this.key + '.8';

      const Q8_key = '8';
      const Q8_unknown = '99';
      const Q8_fallenAlone = '3';
      const o8 = options_french([
        ['1', "Le jour même (< 24h)"],
        ['2', "Le lendemain ou plus tard (> 24h)"],
        [Q8_fallenAlone, "Elle est tombée toute seule"],
      ], t8 + '.option.');

      const Q8_exclusive = client.multipleChoice.any(this.key + '.' + Q8_key, Q8_unknown);

      o8.forEach(o=>{
        o.disabled = Q8_exclusive;
      })

      o8.push(option_def(Q8_unknown, _T(t8 + '.option.nsp', "Je ne sais pas/ne me souviens pas")))

      const Q8 = SurveyItems.multipleChoice({
        parentKey: this.key,
        itemKey: Q8_key,
        questionText: _T(t8 + ".text", textPrefix +" Lors de ce " + orderMasc+ " épisode de piqûre(s), quand avez-vous retiré la/les tique(s)"),
        questionSubText: several_answer,
        responseOptions: o8
      });

      this.addItem(Q8);

      const removedCondition = client.multipleChoice.none(Q8.key, Q8_fallenAlone);

      const t9 = this.key + '.9';

      const Q9 = SurveyItems.multipleChoice({
        parentKey: this.key,
        itemKey: '9',
        questionText: _T(t9 + ".text", textPrefix + " Comment la/les tique(s) ont-elles été retirées ?"),
        questionSubText: several_answer,
        condition: removedCondition,
        responseOptions: [
          option_def('1', _T(t9 + '.option.1', "Avec un tire-tique")),
          option_def('2', _T(t9 + '.option.2' , "Avec une pince à écharde/pince à épiler")),
          as_input_option('3', _T(t9 + '.option.3', "Avec un autre outil"), common_other),
          option_def('4', _T(t9 + '.option.4', "Sans outil (à la main)"))
        ]
      });

      this.addItem(Q9);

      const t10 = this.key + '.11';

      const o10 = options_french([
        ["1","Vous-même"],
        ["2","Un de vos proches"],
        ["3","Un professionnel de santé"],
        ["99","Je ne sais pas/ne me souviens pas"],    
      ], t10 + '.option.');

      const Q10 = SurveyItems.multipleChoice({
        parentKey: this.key,
        questionSubText: several_answer,
        itemKey: '10',
        condition: removedCondition,
        questionText: _T(t10 + ".text", textPrefix + " Par qui la/les tique(s) ont-elles été retirées ?"),
        responseOptions: o10
      });

      this.addItem(Q10);

      const Q11 = YesNo(this.key, '11', _T(this.key + '.11',textPrefix + " Êtes-vous allé consulter un médecin suite à cet épisode de piqûre(s) ?"));
      this.addItem(Q11);

    }

}
import { responseGroupKey } from "case-editor-tools/constants/key-definitions";
import { SingleChoiceOptionTypes, SurveyItems } from "case-editor-tools/surveys"
import { Group, OptionDef } from "case-editor-tools/surveys/types";
import { addMonths, format, fromUnixTime } from "date-fns";
import { fr } from "date-fns/locale";
import { Expression, SurveySingleItem } from "survey-engine/data_types";
import { singleChoicePrefix } from "../../common/studies/common/questionPools";
import { ItemQuestion, exp_as_arg, ClientExpression as client, as_option, as_input_option, option_def, textComponent, optionRoles, surveyItemKey, num_as_arg } from "../common";
import { french } from "../utils";
import { _T, options_french, ObservationPeriod } from "./helpers";
import responses from "./responses";

export const DontKnowLabel = "Je ne sais pas / ne me souviens pas";

export const several_answers = _T("common.multiple_choice", "Plusieurs réponses possibles");

export const common_other = _T("common.other", "Précisez");

export const create_period_label = (p: ObservationPeriod) => {
  return "au cours de la période de " + p.label;
}

interface QProps {
    condition?: Expression
}

const dropDown = (props: { key: string, placeholder?: Map<string, string>, displayCondition?: Expression, options: Array<OptionDef> }): OptionDef => {
  return {
    key: props.key,
    role: 'dropDownGroup',
    displayCondition: props.displayCondition,
    description: props.placeholder,
    items: props.options,
  }
}

interface monthOptionsProps {
  start: Date
  end: Date
  key: string
  displayCondition?: Expression
}

const createMonthOptions = (props: monthOptionsProps): OptionDef[] => {
  const oo: OptionDef[] = [];
  var d : Date = props.start;
  if(props.end < props.start) {
    throw new Error("Starting date is after ending date");
  }
  while(d <= props.end) {
    const m = format(d, 'yyyy-MM');
    const label = format(d, 'MMMM yyyy', {locale: fr});
    const o = option_def(m, _T(m, label));
    oo.push(o);
    d = addMonths(d, 1);
  }
  return oo;
}

const monthDropdonwOptions = (props: monthOptionsProps): OptionDef => {
  const oo = createMonthOptions(props);
  return dropDown({
    key: props.key,
    displayCondition: props.displayCondition,
    placeholder: _T('month_selector', 'Sélectionnez un mois'),
    options: oo
  });
};

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

interface YesNoOptions {
  isRequired?: boolean;
}


export const YesNo = (parent: string, key: string, text: Map<string, string>, condition?:Expression, opts?: YesNoOptions)=> {
  const codes = responses.yes_no;
  return SurveyItems.singleChoice({
      parentKey: parent,
      itemKey: key,
      condition: condition,
      questionText: text,
      responseOptions: [
          as_option(codes.yes, _T('common.yes_no.yes', 'Oui')),
          as_option(codes.no, _T('common.yes_no.no', 'Non')),
          as_option(codes.dnk, _T('common.yes_no.dnk', DontKnowLabel)),   
      ],
      ...opts
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


const ucfirst = (s:string)=>{
  return  s.charAt(0).toUpperCase() + s.slice(1);
}

export class PiqureGroup extends Group {

    index : number;
    observationPeriod: ObservationPeriod;

    constructor(parent: string, key: string, index: number, condition: Expression, period:ObservationPeriod) {
       super(parent, key);
       this.index = index;
       this.observationPeriod = period;
       this.groupEditor.setCondition(condition);
    }

    orderLabels() {
      const orderLabels = orders['' + this.index];

      const masc = orderLabels.masc
      const fem = orderLabels.fem ? orderLabels.fem : orderLabels.masc;

      return [masc, fem];
    }

    buildGroup() {

      const periodLabel = create_period_label(this.observationPeriod);

      
      const [orderMasc, orderFem] = this.orderLabels();
     
      const titlePrelude = ucfirst(orderMasc) + " épisode de piqûre(s)";

      const textPrelude = "Les questions suivantes permettront d’en savoir plus sur votre "+  orderMasc + " épisode de piqûre(s) de tiques "+ periodLabel +". Répondez le plus précisément possible";

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
        questionText: _T(t1 + '.text', textPrefix + ' Combien de tiques vous ont piqué lors de ce '+ orderMasc +' épisode de piqûre(s) '+ periodLabel +' ?'),
        //questionSubText: _T(t1 + '.subtext', "Note importante: Si vous vous êtes fait piquer par plusieurs tiques au cours de la même sortie, ne comptez cet épisode de piqûres que comme une seule fois."),
        responseOptions: [
          as_option('1', _T(t1 + '.option.1', 'Une tique')),
          option_def('2', _T(t1 + '.option.2', "Deux tiques ou plus (c'est-à-dire des piqûres multiples)"), {
            'role':'numberInput', 
            optionProps: { 'min': num_as_arg(2)},
            'description': _T(t1, 'Précisez le nombre')
          }),
          as_option('99', _T(t1 + '.option.nsp', DontKnowLabel))
        ]
      });

      this.addItem(Q1);

      const t2 = this.key + '.1';

      const date_input = (key:string,  label: string, mode?: 'YMD' | 'YM') => {
         /* 
          return SingleChoiceOptionTypes.dateInput({
            key: key,
            inputLabelText: _T(this.key + '.option.' + key, label),
            dateInputMode: mode ?? 'YMD',
            minRelativeDate: {delta: {'seconds': 0}, reference: this.observationPeriod.start},
            maxRelativeDate: {delta: {'seconds': 0}, reference: this.observationPeriod.end},
          });

        */
          return option_def(key, _T(this.key + '.option.' + key, label), {
            role: optionRoles.date,
            description: _T(this.key + '.option.' + key, label),
            optionProps: {
              min: num_as_arg(this.observationPeriod.start),
              max: num_as_arg(this.observationPeriod.end),
              dateInputMode: {'str': mode ?? 'YMD'}
            }
          });
      }

      const start_date = fromUnixTime(this.observationPeriod.start);
      const end_date = fromUnixTime(this.observationPeriod.end);

      const monthOptions: monthOptionsProps = {
        key: "month", 
        start: start_date,
        end: end_date,
      };
      
      const oo2 = createMonthOptions(monthOptions);

      const Q2 = SurveyItems.singleChoice({
        parentKey: this.key,
        itemKey: '2b',
        questionText: _T(t2 + '.text', textPrefix + " Quand a eu lieu ce " + orderMasc + " épisode de piqûre(s) ?"),
        questionSubText: _T(t2 + ".subtext", "Donnez la date approximative de votre épisode de piqûre au mois près"),
        responseOptions: [
          ...oo2,
          as_option("99", _T(t2 + ".option.nsp", DontKnowLabel))
        ]
      });

      this.addItem(Q2);
      
      
      const t3 = this.key + '.3';

      const Q3_itemKey = '3';
      const Q3_key = surveyItemKey(this.key , Q3_itemKey);

      const Q3_reponses = {
        'postalcode': '1',
        'dnk': '99',
      } as const;

      const Q3 = SurveyItems.singleChoice({
        parentKey: this.key,
        itemKey: Q3_itemKey,
        questionText: _T(t3 + '.text', textPrefix + " Où étiez-vous au moment de ce(s) piqûre(s) ?"),
        questionSubText: _T(t3 + '.subtext', "Indiquez le code postal correspondant à la localité la plus proche"),
        responseOptions: [
          option_def(Q3_reponses.postalcode, _T(t3, "Code postal"), {
            role: optionRoles.input,
            description: _T(t3 + ".option.1.desc", "Entrez un code postal")
          }),
          as_option(Q3_reponses.dnk, _T(t3 + ".option.nsp", DontKnowLabel))
        ],
        customValidations: [
            {
                'key': 'pc1',
                'type':'hard',
                rule: client.logic.or(
                  client.logic.not(client.hasResponse(Q3_key, responseGroupKey)),
                  client.checkResponseValueWithRegex(Q3_key, singleChoicePrefix + '.' + Q3_reponses.postalcode, '^[0-9]{5}$'),
                  client.singleChoice.any(Q3_key, Q3_reponses.dnk)
                ) 
            },
        ],
        bottomDisplayCompoments: [
          textComponent({
            displayCondition: client.logic.not(client.getSurveyItemValidation(Q3_key, 'pc1')),
            content: _T(t3 + ".postalCodeError", "Entrez les 5 chiffres du code postal"),
            className: "text-danger",
          })
        ]
      });
      

      this.addItem(Q3);

      const postalUnknown = client.singleChoice.any(Q3.key, Q3_reponses.dnk)

      /*
      const oo5 = departements.map(p => {
        return as_option(p.code, _T('depfr.' + p.code, p.code + ' - ' + p.label));
      });
      */
      
      const Q5_itemKey = '5';
      const t5= this.key + '.' + Q5_itemKey;
      const Q5_key = surveyItemKey(this.key , Q5_itemKey);

      const Q5_responses = {
        postalCode: '1',
        dnk: '99'
      } as const;

      const Q5 = SurveyItems.singleChoice({
        parentKey: this.key,
        itemKey: Q5_itemKey,
        condition: postalUnknown,
        questionText: _T(t5, textPrefix + ' Si vous ne souvenez pas du code postal, pouvez-vous vous rappeler dans quel département vous vous êtes fait piquer'),
        responseOptions: [
          option_def(Q5_responses.postalCode, _T(t5 + '.option.1', ""), {
            role:optionRoles.input,
            description: _T(t5 + ".option.1.desc", "Entrez un numéro de département")
          }),
          as_option(Q5_responses.dnk, _T(t5 + ".option.nsp", DontKnowLabel))
        ],
        customValidations: [
            {
              'key': 'pc1',
              'type':'hard',
              rule: client.logic.or(
                client.logic.not(client.hasResponse(Q5_key, responseGroupKey)),
                client.checkResponseValueWithRegex(Q5_key, singleChoicePrefix + '.' + Q5_responses.postalCode, '^(([0-9]{2})|(2[ABab])|(97[12346]))$'),
                client.singleChoice.any(Q5_key, Q5_responses.dnk)
              ) 
            },
        ],
        bottomDisplayCompoments: [
            textComponent({
              displayCondition: client.logic.not(client.getSurveyItemValidation(Q5_key, 'pc1')),
              className: "text-danger mt-1",
              content: _T(t5 + ".postalCodeError", "Entrez un numéro de département valide (pour la corse les codes 2A/2B sont acceptés)")
            })
        ]
      });
       
      this.addItem(Q5);

      const t6 = this.key + '.6';
      const Q6_itemKey = '6';
      const Q6_key = surveyItemKey(this.key, Q6_itemKey);
      const Q6_unknown = '99';
     
      const oo = options_french([
        ['1', 'Forêt (lisière de forêt, bois, bosquet…)'], 
        ['2', 'Prairie (herbes hautes, champs…)'], 
        ['3', 'Jardin privé'], 
        ['4', 'Zone agricole cultivée'], 
        ['5', 'Parc public/municipal'], 
        ['6', 'Intérieur d’une habitation'], 
        ['7', 'Ferme d’élevage'], 
        ['8', 'Plan d’eau'], 
      ], t6 + '.option.');

      //oo.push(as_input_option('9', _T(t6 + '.option.other','Autre'), common_other ));

       const Q6_exclusive = client.multipleChoice.any(Q6_key, Q6_unknown)
      oo.forEach(o=>{
        o.disabled = Q6_exclusive;
      });

      oo.push(option_def(Q6_unknown, _T(t6 + '.option.nsp', DontKnowLabel)))

      const Q6 = SurveyItems.multipleChoice({
        parentKey: this.key,
        itemKey: Q6_itemKey,
        questionText: _T(t6 + ".text", textPrefix + " Dans quel(s) environnement(s) vous êtes-vous fait piquer ?"),
        questionSubText: several_answers,
        responseOptions: oo
      });

      this.addItem(Q6);
      
      const t7 = this.key + '.7';

      const o7 = options_french([
        ['1', 'Activité professionnelle'],
        ['2', 'Chasse, pêche'],
        ['3', 'Sport (course à pied en milieu naturel, jeu collectif sur gazon… )'],
        ['4', 'Loisir (promenade, pique-nique, jardinage…)'],
        ['5', 'Autre'],
      ], t7 + '.option.');

      //o7.push(as_input_option('6', _T(t7 + '.option.other','Autre'), common_other));
     // o7.push(option_def('99', _T(t7 + '.option.nsp', DontKnowLabel)))

      const Q7 = SurveyItems.singleChoice({
        parentKey: this.key,
        itemKey: '7',
        questionText: _T(t7 + ".text", textPrefix +" A quelle occasion vous êtes-vous fait piquer ?"),
        responseOptions: o7
      });
      
      this.addItem(Q7);

      const t8 = this.key + '.8';

      const Q8_itemKey = '8';
      const Q8_responses = responses.Q6_8;
      const o8 = options_french([
        [Q8_responses.sameday, "Le jour même (< 24h)"],
        [Q8_responses.nextday, "Le lendemain ou plus tard (> 24h)"],
        [Q8_responses.fallenAlone, "Elle est tombée toute seule"],
      ], t8 + '.option.');

      const Q8_key = surveyItemKey(this.key, Q8_itemKey);
      const Q8_exclusive = client.multipleChoice.any(Q8_key, Q8_responses.dnk);

      o8.forEach(o=>{
        o.disabled = Q8_exclusive;
      });

      o8.push(option_def(Q8_responses.dnk, _T(t8 + '.option.nsp', DontKnowLabel)))

      const Q8 = SurveyItems.multipleChoice({
        parentKey: this.key,
        itemKey: Q8_itemKey,
        questionText: _T(t8 + ".text", textPrefix +" Lors de ce " + orderMasc+ " épisode de piqûre(s), quand avez-vous retiré la/les tique(s) ?"),
        questionSubText: several_answers,
        responseOptions: o8
      });

      this.addItem(Q8);

      const removedCondition = client.multipleChoice.any(Q8.key, Q8_responses.nextday, Q8_responses.sameday);

      const t9 = this.key + '.9';

      const Q9_resp = {
        tiretique: '1',
        tool: '2',
        hand: '3',
        dnk: '99'
      } as const;

      const Q9_itemKey = '9';
      const Q9_key = surveyItemKey(this.key,  Q9_itemKey);
      const Q9_exclusive = client.multipleChoice.any(Q9_key, Q9_resp.dnk);

      const Q9 = SurveyItems.multipleChoice({
        parentKey: this.key,
        itemKey: Q9_itemKey,
        questionText: _T(t9 + ".text", textPrefix + " Comment la/les tique(s) ont-elles été retirées ?"),
        questionSubText: several_answers,
        condition: removedCondition,
        responseOptions: [
          option_def('1', _T(t9 + '.option.1', "Avec un tire-tique"), {disabled: Q9_exclusive}),
          option_def('2', _T(t9 + '.option.2' , "Avec un outil (ex : pince à écharde ou à épiler)"), {disabled: Q9_exclusive}),
          option_def('3', _T(t9 + '.option.3', "Sans outil (à la main)"), {disabled: Q9_exclusive}),
          option_def('99', _T(t9 + '.option.nsp', DontKnowLabel), {disabled: client.multipleChoice.any(Q9_key, Q9_resp.tiretique, Q9_resp.tool, Q9_resp.hand)})
        ]
      });

      this.addItem(Q9);

      const t10 = this.key + '.11';

      const Q10_dnk ='99';
      const Q10_itemKey = '10';
      const Q10_key = surveyItemKey(this.key , Q10_itemKey);
      const o10 = options_french([
        ["1","Vous-même"],
        ["2","Un de vos proches"],
        ["3","Un professionnel de santé"],
        [Q10_dnk, DontKnowLabel],    
      ], t10 + '.option.');

      o10.forEach(o => {
        if(o.key != Q10_dnk) {
          o.disabled = client.multipleChoice.any(Q10_key, Q10_dnk)
        } else {
          o.disabled = client.multipleChoice.none(Q10_key, Q10_dnk);
        } 
      });

      const Q10 = SurveyItems.multipleChoice({
        parentKey: this.key,
        questionSubText: several_answers,
        itemKey: Q10_itemKey,
        condition: removedCondition,
        questionText: _T(t10 + ".text", textPrefix + " Par qui la/les tique(s) ont-elles été retirées ?"),
        responseOptions: o10
      });

      this.addItem(Q10);

      const Q11 = YesNo(this.key, '11', _T(this.key + '.11', textPrefix + " Avez-vous consulté un médecin suite à cet épisode de piqûre(s) ?"));
      this.addItem(Q11);

    }

}
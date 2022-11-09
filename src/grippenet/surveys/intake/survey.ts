import {  _T } from "../../../common"
import { ExpressionName } from "survey-engine/data_types";
import { Item } from "case-editor-tools/surveys/types";
import { questionPools, SurveyBuilder, SimpleGroupQuestion, ClientExpression as ce } from "../../../common";
import * as intake from "./questions";

const pool = questionPools.intake;

export class IntakeDef extends SurveyBuilder {

    Q_birthdate?: Item;

    constructor(meta:Map<string,string>) {

        super({
            surveyKey: 'intake',
            name:_T("intake.name.0", "Intake questionnaire"),
            description: _T("intake.description.0", "The purpose of the background questionnaire is to find out a little more about each user."),
            durationText: _T("intake.typicalDuration.0", "Duration 5-10 minutes"),
            metadata: meta,
        });

        const rootKey = this.key;

        const prelude = new intake.SurveyPrelude({parentKey: rootKey})
        this.push(prelude);

        const QForWhom = new intake.FillingForWhom({parentKey: rootKey, isRequired: true});
        this.push(QForWhom);

        const QFillingforReprensetative = new intake.FillingForWhomLegalRepresentative({parentKey: rootKey, isRequired: true});
        
        this.push(QFillingforReprensetative, QForWhom.createConditionLegalRepresentative());

        const QFillingforHoushold = new intake.FillingForWhomHousold({parentKey: rootKey, isRequired: true});
        
        this.push(QFillingforHoushold, QForWhom.createConditionHousehold());

        const mainGroup = new SimpleGroupQuestion({parentKey: rootKey}, 'main');
        mainGroup.add(this.buildMainGroup(mainGroup.key));

        mainGroup.setCondition(
            ce.logic.or(
                QForWhom.createConditionMyself(),
                QFillingforReprensetative.createYesCondition(),
                QFillingforHoushold.createYesCondition()
            )
        );

        const QSurveyEnd = new intake.NotPossibleToContinue({parentKey: rootKey});
        this.push(QSurveyEnd, ce.logic.or(
          QForWhom.createConditionSomeoneElse(),
          QFillingforReprensetative.createNoCondition(),
          QFillingforHoushold.createNoCondition() 
        ));

        this.push(mainGroup);

    }

    buildMainGroup(rootKey: string): Item[] {    
        
        const items: Item[] = [];
        
        const Q_gender = new pool.Gender({parentKey: rootKey, isRequired:true, useOther:false});

        items.push(Q_gender);

        const Q_birthdate = new pool.DateOfBirth({parentKey:rootKey, isRequired:true});
        this.Q_birthdate = Q_birthdate;
        items.push(Q_birthdate);

        const Q_Height = new intake.BodyHeight({parentKey: rootKey, isRequired: true});
        items.push(Q_Height);

        const Q_Weight = new intake.BodyWeight({parentKey: rootKey, isRequired: true});
        items.push(Q_Weight);

        const Q_pregnancy = new pool.Pregnancy({parentKey:rootKey, keyQGender:Q_gender.key, keyQBirthday:Q_birthdate.key, isRequired:true});
        items.push(Q_pregnancy);

        const Q_postal = new intake.PostalCode({parentKey:rootKey, isRequired:true});
        items.push(Q_postal);

        const Q_main_activity = new pool.MainActivity({parentKey:rootKey, isRequired:true});
        items.push(Q_main_activity);

        const working_condition = intake.working_mainactivity_condition(Q_main_activity);

        /*
        const Q_healthProf = new intake.HealthProfessional({parentKey:rootKey, isRequired:true});
        items.push(Q_healthProf, working_condition);

        const HumanHealthProf = Q_healthProf.isHumanHealthProfessionalCondition();

        const Q_healthProfType = new intake.HealthProfessionalType({parentKey:rootKey, isRequired:true});
        items.push(Q_healthProfType, HumanHealthProf);

        const Q_healthProfPractice = new intake.HealthProfessionalPractice({parentKey:rootKey, isRequired:true});
        items.push(Q_healthProfPractice, HumanHealthProf);
        */
        const Q_postal_work = new intake.PostalCodeWork({parentKey:rootKey, isRequired:true});
        Q_postal_work.setCondition(working_condition)
        items.push(Q_postal_work);

        const Q_postal_work_location = new intake.PostalCodeWorkLocation({parentKey: rootKey, isRequired: true}, Q_postal_work);
        items.push(Q_postal_work_location);

        const Q_work_type = new pool.WorkTypeEurostat({parentKey:rootKey, keyMainActivity:Q_main_activity.key, isRequired:true});
        items.push(Q_work_type);

        const Q_highest_education = new pool.HighestEducation({parentKey:rootKey, keyQBirthday:Q_birthdate.key, isRequired:true});
        items.push(Q_highest_education);

        const Q_people_met = new intake.PeopleMet({parentKey:rootKey, isRequired:true});
        items.push(Q_people_met);

        const Q_age_groups = new pool.AgeGroups({parentKey:rootKey, isRequired:true, useAlone: true});
        items.push(Q_age_groups);

        const Q_people_at_risk = new pool.PeopleAtRisk({parentKey:rootKey, keyOfAgeGroups:Q_age_groups.key, isRequired:true});
        items.push(Q_people_at_risk);

        const Q_children_in_school = new pool.ChildrenInSchool({parentKey:rootKey, keyOfAgeGroups:Q_age_groups.key, isRequired:true});
        items.push(Q_children_in_school);

        const Q_means_of_transport = new pool.MeansOfTransport({parentKey:rootKey, isRequired:true});
        items.push(Q_means_of_transport);

        const Q_common_cold_frequ = new pool.CommonColdFrequency({parentKey:rootKey, isRequired:true});
        items.push(Q_common_cold_frequ);

        const Q_gastro_freq = new intake.GastroEnteritisFrequency({parentKey:rootKey, isRequired:true});
        items.push(Q_gastro_freq);

        const Q_regular_medication = new pool.RegularMedication({parentKey:rootKey, isRequired:true, useRatherNotAnswer: false});
        items.push(Q_regular_medication);

        //const Q_pregnancy_trimester = new pool.PregnancyTrimester({parentKey:rootKey, keyQGender:Q_gender.key, keyQBirthday:Q_birthdate.key, keyQPregnancy:Q_pregnancy.key, isRequired:true});
        //items.push(Q_pregnancy_trimester);

        const Q_smoking = new intake.Smoking({parentKey:rootKey, isRequired:true});
        items.push(Q_smoking);

        const Q_allergies = new pool.Allergies({parentKey:rootKey, isRequired:true});
        items.push(Q_allergies);

        const Q_special_diet = new pool.SpecialDiet({parentKey:rootKey, isRequired:true});
        items.push(Q_special_diet);

        // Q26 in standard, but Q24 in French implementation
        const Q_homeopathic_meds = new pool.HomeophaticMedicine({parentKey:rootKey, isRequired:true, keyOverride:'Q24'});
        items.push(Q_homeopathic_meds);

        const Q_find_platform = new intake.FindOutAboutPlatform({parentKey:rootKey, isRequired:true});
        items.push(Q_find_platform);

        const surveyEndText = new pool.FinalText({parentKey: rootKey});
        items.push(surveyEndText);

        return items;
    }

    getBirthDateKey():string {
        if(!this.Q_birthdate) {
            throw new Error("Birthday not initialized");
        }
        return this.Q_birthdate.key;
    }

    buildSurvey() {
        const prefillRules = []

        for (const item of this.items) {

            const surveyItem = item.get();

            this.addItem(surveyItem);

            prefillRules.push(
                {
                    name: <ExpressionName>"GET_LAST_SURVEY_ITEM",
                    data: [
                        { str: "intake" },
                        { str: surveyItem.key }
                    ]
                }
            );
        }

        this.editor.setPrefillRules(prefillRules);
    }
}


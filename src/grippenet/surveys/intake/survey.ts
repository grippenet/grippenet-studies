import {  _T } from "../../../common"
import { SurveyItem, SurveyGroupItem, ExpressionName } from "survey-engine/data_types";
import { Item, SurveyDefinition } from "case-editor-tools/surveys/types";
import { questionPools } from "../../../common";
import * as intake from "./questions";
import { add_meta } from "../utils";

const pool = questionPools.intake;

export class IntakeDef extends SurveyDefinition {

    items: Item[];

    Q_birthdate: Item;

    constructor(meta:Map<string,string>) {

        super({
            surveyKey: 'intake',
            name:add_meta( _T("intake.name.0", "Intake questionnaire"), meta),
            description: _T("intake.description.0", "The purpose of the background questionnaire is to find out a little more about each user."),
            durationText: _T( "intake.typicalDuration.0", "Duration 5-10 minutes")
        });

        this.items = [];

        const rootKey = this.key;

        const Q_gender = new pool.Gender({parentKey: rootKey, isRequired:true, useOther:false});

        this.items.push(Q_gender);

        const Q_birthdate = new pool.DateOfBirth({parentKey:rootKey, isRequired:true});
        this.Q_birthdate = Q_birthdate;

        this.items.push(Q_birthdate);

        const Q_postal = new pool.PostalCode({parentKey:rootKey, isRequired:true});
        this.items.push(Q_postal);

        const Q_main_activity = new pool.MainActivity({parentKey:rootKey, isRequired:true});
        this.items.push(Q_main_activity);

        const Q_postal_work = new pool.PostalCodeWork({parentKey:rootKey, keyMainActivity:Q_main_activity.key, isRequired:true});
        this.items.push(Q_postal_work);

        const Q_work_type = new pool.WorkTypeEurostat({parentKey:rootKey, keyMainActivity:Q_main_activity.key, isRequired:true});
        this.items.push(Q_work_type);

        const Q_highest_education = new pool.HighestEducation({parentKey:rootKey, keyQBirthday:Q_birthdate.key, isRequired:true});
        this.items.push(Q_highest_education);

        const Q_people_met = new pool.PeopleMet({parentKey:rootKey, isRequired:true});
        this.items.push(Q_people_met);

        const Q_age_groups = new pool.AgeGroups({parentKey:rootKey, isRequired:true});
        this.items.push(Q_age_groups);

        const Q_people_at_risk = new pool.PeopleAtRisk({parentKey:rootKey, keyOfAgeGroups:Q_age_groups.key, isRequired:true});
        this.items.push(Q_people_at_risk);

        const Q_children_in_school = new pool.ChildrenInSchool({parentKey:rootKey, keyOfAgeGroups:Q_age_groups.key, isRequired:true});
        this.items.push(Q_children_in_school);

        const Q_means_of_transport = new pool.MeansOfTransport({parentKey:rootKey, isRequired:true});
        this.items.push(Q_means_of_transport);

        const Q_common_cold_frequ = new pool.CommonColdFrequency({parentKey:rootKey, isRequired:true});
        this.items.push(Q_common_cold_frequ);

        const Q_regular_medication = new pool.RegularMedication({parentKey:rootKey, isRequired:true});
        this.items.push(Q_regular_medication);

        const Q_pregnancy = new pool.Pregnancy({parentKey:rootKey, keyQGender:Q_gender.key, keyQBirthday:Q_birthdate.key, isRequired:true});
        this.items.push(Q_pregnancy);

        const Q_pregnancy_trimester = new pool.PregnancyTrimester({parentKey:rootKey, keyQGender:Q_gender.key, keyQBirthday:Q_birthdate.key, keyQPregnancy:Q_pregnancy.key, isRequired:true});
        this.items.push(Q_pregnancy_trimester);

        const Q_smoking = new pool.Smoking({parentKey:rootKey, isRequired:true});
        this.items.push(Q_smoking);

        const Q_allergies = new pool.Allergies({parentKey:rootKey, isRequired:true});
        this.items.push(Q_allergies);

        const Q_special_diet = new pool.SpecialDiet({parentKey:rootKey, isRequired:true});
        this.items.push(Q_special_diet);

        // Q26 in standard, but Q24 in French implementation
        const Q_homeopathic_meds = new pool.HomeophaticMedicine({parentKey:rootKey, isRequired:true, keyOverride:'Q24'});
        this.items.push(Q_homeopathic_meds);

        const Q_find_platform = new intake.FindOutAboutPlatform({parentKey:rootKey, isRequired:true});
        this.items.push(Q_find_platform);

        const surveyEndText = new pool.FinalText({parentKey: rootKey});
        this.items.push(surveyEndText);
    }

    getBirthDateKey():string {
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


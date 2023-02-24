import {  _T } from "../../../common"
import { Item } from "case-editor-tools/surveys/types";
import { questionPools, SurveyBuilder, SimpleGroupQuestion, ClientExpression as ce } from "../../../common";
import * as intake from "./questions";
import { GrippenetFlags } from "../../flags";
import pool = questionPools.intake;
export class IntakeDef extends SurveyBuilder {

    Q_birthdate?: pool.DateOfBirth;

    Q_postal?: intake.PostalCode;

    constructor(meta:Map<string,string>) {

        super({
            surveyKey: 'intake',
            name:_T("intake.name.0", "Intake questionnaire"),
            description: _T("intake.description.0", "The purpose of the background questionnaire is to find out a little more about each user."),
            durationText: _T("intake.typicalDuration.0", "Duration 5-10 minutes"),
            metadata: meta,
        });

        const rootKey = this.key;

        const needLocationFlag = GrippenetFlags.needLocation;

        const hasNeedLocation = ce.participantFlags.hasKeyAndValue(needLocationFlag.key, needLocationFlag.values.yes);
        
        const warningLocation = new intake.SurveyLocationWarning({parentKey: rootKey});
        this.push(warningLocation, hasNeedLocation);
        
        const prelude = new intake.SurveyPrelude({parentKey: rootKey})
        this.push(prelude);

        const QForWhom = new intake.FillingForWhom({parentKey: rootKey, isRequired: true});
        this.prefillWithLastResponse(QForWhom);
        this.push(QForWhom);

        const QFillingforReprensetative = new intake.FillingForWhomLegalRepresentative({parentKey: rootKey, isRequired: true});
        this.prefillWithLastResponse(QFillingforReprensetative);
        this.push(QFillingforReprensetative, QForWhom.createConditionLegalRepresentative());

        const QFillingforHoushold = new intake.FillingForWhomHousold({parentKey: rootKey, isRequired: true});
        this.prefillWithLastResponse(QFillingforHoushold);
        
        this.push(QFillingforHoushold, QForWhom.createConditionMajor());

        const impersonate = new intake.SurveyImpersonateResponse({parentKey: rootKey});
        
        this.push(impersonate, ce.logic.or(
            QFillingforReprensetative.createYesCondition(),
            QFillingforHoushold.createYesCondition(),
        ) );

        const mainGroup = new SimpleGroupQuestion({parentKey: rootKey}, 'main');
        mainGroup.add(this.buildMainGroup(mainGroup.key));

        mainGroup.setCondition(
            ce.logic.or(
                QForWhom.createConditionMyself(),
                QFillingforReprensetative.createYesCondition(),
                QFillingforHoushold.createYesCondition(),
            )
        );
       
        const QBirthDate = this.getBirthDateItem();

        const QUnsuperviserWarning = new intake.UnsupervisedMinorWarning({parentKey: rootKey, isRequired: true});
        
        QUnsuperviserWarning.setCondition(
            ce.logic.and(
                ce.compare.lt(QBirthDate.getAgeExpression('years'), 18),
                ce.logic.or(
                    QForWhom.createConditionMyself(),
                    QFillingforHoushold.createYesCondition()
                )
            )
        );

        this.push(QUnsuperviserWarning);

        this.push(mainGroup);

        const QSurveyEnd = new intake.NotPossibleToContinue({parentKey: rootKey});
        this.push(QSurveyEnd, ce.logic.or(
          QFillingforReprensetative.createNoCondition(),
          QFillingforHoushold.createNoCondition() 
        ));
        
    }

    buildMainGroup(rootKey: string): Item[] {    
        
        const items: Item[] = [];
        
        const Q_gender = new pool.Gender({parentKey: rootKey, isRequired:true, useOther:false});

        items.push(Q_gender);
        this.prefillWithLastResponse(Q_gender);

        const Q_birthdate = new pool.DateOfBirth({parentKey:rootKey, isRequired:true});
        this.Q_birthdate = Q_birthdate;
        items.push(Q_birthdate);
        this.prefillWithLastResponse(Q_birthdate);


        const Q_Height = new intake.BodyHeight({parentKey: rootKey, isRequired: false});
        items.push(Q_Height);
        this.prefillWithLastResponse(Q_Height);

        const Q_Weight = new intake.BodyWeight({parentKey: rootKey, isRequired: false});
        items.push(Q_Weight);
        this.prefillWithLastResponse(Q_Weight, {'years': 1} );

        const Q_pregnancy = new pool.Pregnancy({parentKey:rootKey, keyQGender:Q_gender.key, keyQBirthday:Q_birthdate.key, isRequired:false});
        this.prefillWithLastResponse(Q_pregnancy, {months: 3} );
        items.push(Q_pregnancy);

        const Q_postal = new intake.PostalCode({parentKey:rootKey, isRequired:true});
        this.prefillWithLastResponse(Q_postal);
        items.push(Q_postal);
        this.Q_postal = Q_postal;

        const Q_main_activity = new pool.MainActivity({parentKey:rootKey, isRequired:true});
        items.push(Q_main_activity);
        this.prefillWithLastResponse(Q_main_activity);
        
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
        const Q_postal_work = new intake.PostalCodeWork({parentKey:rootKey, isRequired:false});
        Q_postal_work.setCondition(working_condition)
        this.prefillWithLastResponse(Q_postal_work);
        items.push(Q_postal_work);

        const Q_postal_work_location = new intake.PostalCodeWorkLocation({parentKey: rootKey, isRequired: false}, Q_postal_work);
        this.prefillWithLastResponse(Q_postal_work_location);
        items.push(Q_postal_work_location);

        const Q_work_type = new pool.WorkTypeEurostat({parentKey:rootKey, keyMainActivity:Q_main_activity.key, isRequired:false});
        this.prefillWithLastResponse(Q_work_type);
        items.push(Q_work_type);

        const Q_highest_education = new intake.HighestEducation({parentKey:rootKey,isRequired:false});
        Q_highest_education.setCondition(
            ce.compare.gte(Q_birthdate.getAgeExpression('years'), 16)
        );
        this.prefillWithLastResponse(Q_highest_education);
        items.push(Q_highest_education);

        const Q_people_met = new intake.PeopleMet({parentKey:rootKey, isRequired:true});
        this.prefillWithLastResponse(Q_people_met);
        items.push(Q_people_met);

        const Q_age_groups = new pool.AgeGroups({parentKey:rootKey, isRequired:false, useAlone: true, useAnswerTip: true});
        this.prefillWithLastResponse(Q_age_groups);
        items.push(Q_age_groups);

        const Q_people_at_risk = new intake.PeopleAtRisk({parentKey:rootKey, ageGroupQuestion: Q_age_groups, isRequired:false});
        items.push(Q_people_at_risk);

        const Q_children_in_school = new pool.ChildrenInSchool({parentKey:rootKey, ageGroupQuestion: Q_age_groups, isRequired:false});
        this.prefillWithLastResponse(Q_children_in_school, {'years': 1});
        items.push(Q_children_in_school);

        const Q_means_of_transport = new pool.MeansOfTransport({parentKey:rootKey, isRequired:true});
        this.prefillWithLastResponse(Q_means_of_transport);
        items.push(Q_means_of_transport);

        const Q_common_cold_frequ = new intake.CommonColdFrequency({parentKey:rootKey, isRequired:false});
        this.prefillWithLastResponse(Q_common_cold_frequ);
        items.push(Q_common_cold_frequ);

        const Q_gastro_freq = new intake.GastroEnteritisFrequency({parentKey:rootKey, isRequired:false});
        this.prefillWithLastResponse(Q_gastro_freq);
        items.push(Q_gastro_freq);

        const Q_regular_medication = new pool.RegularMedication({parentKey:rootKey, isRequired:true, useRatherNotAnswer: false});
        this.prefillWithLastResponse(Q_regular_medication);
        items.push(Q_regular_medication);

        //const Q_pregnancy_trimester = new pool.PregnancyTrimester({parentKey:rootKey, keyQGender:Q_gender.key, keyQBirthday:Q_birthdate.key, keyQPregnancy:Q_pregnancy.key, isRequired:true});
        //items.push(Q_pregnancy_trimester);

        const Q_smoking = new intake.Smoking({parentKey:rootKey, isRequired:true});
        this.prefillWithLastResponse(Q_smoking, {'years': 1});
        items.push(Q_smoking);

        const Q_allergies = new pool.Allergies({parentKey:rootKey, isRequired:true, useOtherInput: true});
        this.prefillWithLastResponse(Q_allergies);
        items.push(Q_allergies);

        //const Q_special_diet = new pool.SpecialDiet({parentKey:rootKey, isRequired:true});
        //items.push(Q_special_diet);

        // Q26 in standard, but Q24 in French implementation
        const Q_homeopathic_meds = new pool.HomeophaticMedicine({parentKey:rootKey, isRequired:false, keyOverride:'Q24', useHelpgroup: false});
        this.prefillWithLastResponse(Q_homeopathic_meds, {months: 9});
        items.push(Q_homeopathic_meds);

        const Q_find_platform = new intake.FindOutAboutPlatform({parentKey:rootKey, isRequired:false, useAnswerTip: false});
        this.prefillWithLastResponse(Q_find_platform);
        items.push(Q_find_platform);

        const surveyEndText = new pool.FinalText({parentKey: rootKey});
        items.push(surveyEndText);

        return items;
    }

    getBirthDateItem(): pool.DateOfBirth {
        if(!this.Q_birthdate) {
            throw new Error("Birthday not initialized");
        }
        return this.Q_birthdate;
    }

    getPostalCodeItem(): Item {
        if(!this.Q_postal) {
            throw new Error("Postal not initialized");
        }
        return this.Q_postal;
    }
}


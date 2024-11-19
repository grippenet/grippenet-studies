import {  _T, condition_builder, ConditionBuilder } from "../../../common"
import { Item } from "case-editor-tools/surveys/types";
import { questionPools, SurveyBuilder, SimpleGroupQuestion, ClientExpression as ce } from "../../../common";
import * as intake from "./questions";
import { GrippenetFlags } from "../../flags";
import pool = questionPools.intake;
import { intakeSurveyKey } from "../../constants";
import { IRAPrevWorkingDomain } from "./iraprev";
import ResponseEncoding from "./responses";
export class IntakeDef extends SurveyBuilder {

    Q_birthdate?: pool.DateOfBirth;

    Q_postal?: intake.PostalCode;

    Q_Tobacco?: intake.Smoking;

    constructor(meta:Map<string,string>) {

        super({
            surveyKey: intakeSurveyKey,
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

        // Q0
        const QForWhom = new intake.FillingForWhom({parentKey: rootKey, isRequired: true});
        this.prefillWithLastResponse(QForWhom);
        this.push(QForWhom);

        // Q23
        const QFillingforReprensetative = new intake.FillingForWhomLegalRepresentative({parentKey: rootKey, isRequired: true});
        this.prefillWithLastResponse(QFillingforReprensetative);
        this.push(QFillingforReprensetative, QForWhom.createConditionLegalRepresentative());

        // Q22
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
        
        // Q1
        const Q_gender = new pool.Gender({parentKey: rootKey, isRequired:true, useOther:false, useDontWantAnswer: true});

        items.push(Q_gender);
        this.prefillWithLastResponse(Q_gender);

        // Q2
        const Q_birthdate = new pool.DateOfBirth({parentKey:rootKey, isRequired:true});
        this.Q_birthdate = Q_birthdate;
        items.push(Q_birthdate);
        this.prefillWithLastResponse(Q_birthdate);

        // Q38fr
        const QBMI = new intake.IntakeBMIQuestion({parentKey: rootKey});
        items.push(QBMI);
        this.prefillWithLastResponse(QBMI);

        /*
        const Q_Height = new intake.BodyHeight({parentKey: rootKey, isRequired: false});
        items.push(Q_Height);
        this.prefillWithLastResponse(Q_Height);

        const Q_Weight = new intake.BodyWeight({parentKey: rootKey, isRequired: false});
        items.push(Q_Weight);
        this.prefillWithLastResponse(Q_Weight, {'years': 1} );
        */

        // Q12
        const Q_pregnancy = new pool.Pregnancy({parentKey:rootKey, keyQGender:Q_gender.key, keyQBirthday:Q_birthdate.key, isRequired:false});
        this.prefillWithLastResponse(Q_pregnancy, {months: 3} );
        items.push(Q_pregnancy);

        // Q3
        const Q_postal = new intake.PostalCode({parentKey:rootKey, isRequired:true});
        this.prefillWithLastResponse(Q_postal);
        items.push(Q_postal);
        this.Q_postal = Q_postal;

        // Q4
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

        // Q4h
        const Q_work_type = new pool.WorkTypeEurostat({parentKey:rootKey, keyMainActivity:Q_main_activity.key, isRequired:false});
        this.prefillWithLastResponse(Q_work_type);
        items.push(Q_work_type);

        /* Removed 2024
        const Q_postal_work = new intake.PostalCodeWork({parentKey:rootKey, isRequired:false});
        Q_postal_work.setCondition(working_condition)
        this.prefillWithLastResponse(Q_postal_work);
        items.push(Q_postal_work);

        
        const Q_postal_work_location = new intake.PostalCodeWorkLocation({parentKey: rootKey, isRequired: false}, Q_postal_work);
        this.prefillWithLastResponse(Q_postal_work_location);
        items.push(Q_postal_work_location);
        */

        // Q4i
        const Q_IraPrevWorkDomain = new IRAPrevWorkingDomain({parentKey: rootKey, isRequired: true});
        this.prefillWithLastResponse(Q_IraPrevWorkDomain);

        const workingTypeCondition= condition_builder(Q_work_type, "single");
        const workerTypes = ResponseEncoding.working_type;

        const workDomainCondition = workingTypeCondition.createConditionFrom(
            workerTypes.service_worker, 
            workerTypes.army_worker,
            workerTypes.manager,
            workerTypes.professional,
            workerTypes.technician,
            workerTypes.clerical,
            workerTypes.elementary,
        );
        Q_IraPrevWorkDomain.setCondition(workDomainCondition);
        items.push(Q_IraPrevWorkDomain);
        
        // Q4dfr
        const Q_highest_education = new intake.HighestEducation({parentKey:rootKey,isRequired:false});
        Q_highest_education.setCondition(
            ce.compare.gte(Q_birthdate.getAgeExpression('years'), 16)
        );
        this.prefillWithLastResponse(Q_highest_education);
        items.push(Q_highest_education);

        // Q5
        const Q_people_met = new intake.PeopleMet({parentKey:rootKey, isRequired:true});
        this.prefillWithLastResponse(Q_people_met);
        items.push(Q_people_met);

        // Q6
        const Q_age_groups = new intake.AgeGroups({parentKey:rootKey, isRequired:false, useAlone: true, useAnswerTip: true});
        this.prefillWithLastResponse(Q_age_groups);
        items.push(Q_age_groups);

        // Q6c
        const Q_people_at_risk = new intake.PeopleAtRisk({parentKey:rootKey, ageGroupQuestion: Q_age_groups, isRequired:false});
        items.push(Q_people_at_risk);

        /* Removed 2024
        // Q6b
        const Q_children_in_school = new pool.ChildrenInSchool({parentKey:rootKey, ageGroupQuestion: Q_age_groups, isRequired:false});
        this.prefillWithLastResponse(Q_children_in_school, {'years': 1});
        items.push(Q_children_in_school);
        */

        // Q7
        const Q_means_of_transport = new pool.MeansOfTransport({parentKey:rootKey, isRequired:true});
        this.prefillWithLastResponse(Q_means_of_transport);
        items.push(Q_means_of_transport);

        // Q8
        const Q_common_cold_frequ = new intake.CommonColdFrequency({parentKey:rootKey, isRequired:false});
        this.prefillWithLastResponse(Q_common_cold_frequ);
        items.push(Q_common_cold_frequ);

        // Q11
        const Q_regular_medication = new pool.RegularMedication({parentKey:rootKey, isRequired:true, useRatherNotAnswer: false});
        this.prefillWithLastResponse(Q_regular_medication);
        items.push(Q_regular_medication);

        // Q13
        const Q_smoking = new intake.Smoking({parentKey:rootKey, isRequired:true});
        this.prefillWithLastResponse(Q_smoking, {'years': 1});
        this.Q_Tobacco = Q_smoking;

        items.push(Q_smoking);

        // Q14
        const Q_allergies = new pool.Allergies({parentKey:rootKey, isRequired:true, useOtherInput: true});
        this.prefillWithLastResponse(Q_allergies);
        items.push(Q_allergies);

        // Q26 in standard, but Q24 in French implementation
        const Q_homeopathic_meds = new pool.HomeophaticMedicine({parentKey:rootKey, isRequired:false, keyOverride:'Q24', useHelpgroup: false});
        this.prefillWithLastResponse(Q_homeopathic_meds, {months: 9});
        items.push(Q_homeopathic_meds);

        // Q17
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

    getSmoking(): Item {
        if(!this.Q_Tobacco) {
            throw new Error("Postal not initialized");
        }
        return this.Q_Tobacco; 
    }
}


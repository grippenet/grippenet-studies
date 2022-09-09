import {  _T,questionPools, SurveyBuilder } from "../../../common"
import { Item } from "case-editor-tools/surveys/types";
import * as weekly from "./questions";
import {  add_meta } from "../utils";

const pool = questionPools.weekly;

export class WeeklyDef extends SurveyBuilder {

    Q_same_illnes: Item;

    constructor(meta:Map<string,string>) {
        super({
            surveyKey: 'weekly',
            name: add_meta( _T( "weekly.name.0", "Weekly questionnaire"), meta),
            description:_T("weekly.description.0", "Please also report if you had no complaints."),
            durationText: _T( "weekly.typicalDuration.0", "Duration 1-5 minutes")
        });
        
        const rootKey = this.key

        // Symptoms Q1
        const Q_symptoms = new pool.Symptoms({parentKey: rootKey, isRequired: true, useRash: false});
        this.items.push(Q_symptoms);

        // // -------> HAS SYMPTOMS GROUP
        const hasSymptomGroup = new pool.SymptomsGroup({parentKey: rootKey, keySymptomsQuestion: Q_symptoms.key});
        const hasSymptomGroupKey = hasSymptomGroup.key;

        const Q_Stool = new weekly.StoolCount({parentKey: rootKey, SymptomQuestion: Q_symptoms});
        this.items.push(Q_Stool);

        // // Q2 same illnes --------------------------------------
        const Q_same_illnes = new pool.SameIllness({parentKey: hasSymptomGroupKey, isRequired: true});
        hasSymptomGroup.addItem(Q_same_illnes.get());
        this.Q_same_illnes = Q_same_illnes;

        // // Qcov3 pcr tested contact COVID-19--------------------------------------
        const Q_covidPCRTestedContact = new pool.PcrTestedContact({parentKey: hasSymptomGroupKey, isRequired: true});
        hasSymptomGroup.addItem(Q_covidPCRTestedContact.get());

        // Qcov3b household pcr contacts COVID-19--------------------------
        const Q_pcrHouseholdContact = new pool.PcrHouseholdContact({parentKey: hasSymptomGroupKey, covid19ContactKey: Q_covidPCRTestedContact.key, isRequired: true});
        hasSymptomGroup.addItem(Q_pcrHouseholdContact.get());

        // // Q3 when first symptoms --------------------------------------
        const Q_symptomStart = new pool.SymptomsStart({parentKey: hasSymptomGroupKey, keySameIllness: Q_same_illnes.key, isRequired: true});
        hasSymptomGroup.addItem(Q_symptomStart.get());

        // // Q4 when symptoms end --------------------------------------
        const Q_symptomsEnd = new pool.SymptomsEnd({parentKey:hasSymptomGroupKey, keySymptomsStart: Q_symptomStart.key, isRequired:true});
        hasSymptomGroup.addItem(Q_symptomsEnd.get());

        // // Q5 symptoms developed suddenly --------------------------------------
        const Q_symptomsSuddenlyDeveloped = new pool.SymptomsSuddenlyDeveloped({parentKey:hasSymptomGroupKey, isRequired:true});
        hasSymptomGroup.addItem(Q_symptomsSuddenlyDeveloped.get());

        // Q6 fever start questions
        // Separated into individual questions and Key code overriden to prevent Q6.a and keep Q6
        const Q_feverStart = new pool.FeverStart({parentKey:hasSymptomGroupKey, keySymptomsQuestion:Q_symptoms.key, keySymptomStart: Q_symptomStart.key, isRequired:true, keyOverride:"Q6"});
        hasSymptomGroup.addItem(Q_feverStart.get());

        // Q6b fever developed suddenly
        const Q_feverDevelopedSuddenly = new pool.FeverDevelopedSuddenly({parentKey: hasSymptomGroupKey, keySymptomsQuestion:Q_symptoms.key, isRequired: true, keyOverride:"Q6b"});
        hasSymptomGroup.addItem(Q_feverDevelopedSuddenly.get());

        // Q6c temperature taken
        const Q_didUMeasureTemp = new pool.DidUMeasureTemperature({parentKey:hasSymptomGroupKey, keySymptomsQuestion: Q_symptoms.key, isRequired: true, keyOverride: "Q6c"});
        hasSymptomGroup.addItem(Q_didUMeasureTemp.get());

        // Q6d highest temperature taken
        const Q_highestTempMeasured = new pool.HighestTemprerature({parentKey:hasSymptomGroupKey, keySymptomsQuestion: Q_symptoms.key, keyDidYouMeasureTemperature: Q_didUMeasureTemp.key, isRequired: true, keyOverride: "Q6d"});
        hasSymptomGroup.addItem(Q_highestTempMeasured.get());

        // Q36 optional information
        const Q_wantsMore = new pool.ConsentForMore({parentKey: hasSymptomGroupKey, isRequired: true});
        hasSymptomGroup.addItem(Q_wantsMore.get());

        this.items.push(hasSymptomGroup);

        const hasMoreGroup = new pool.HasMoreGroup({parentKey: rootKey, consentForMoreKey: Q_wantsMore.key});
        const hasMoreGroupKey = hasMoreGroup.key;

        // // Q7 visited medical service --------------------------------------
        const Q_visitedMedicalService = new pool.VisitedMedicalService({parentKey: hasMoreGroupKey, isRequired: true});
        hasMoreGroup.addItem(Q_visitedMedicalService.get());

        // // Q7b how soon visited medical service --------------------------------------
        const Q_visitedMedicalServiceWhen = new pool.VisitedMedicalServiceWhen({parentKey: hasMoreGroupKey, keyVisitedMedicalServ: Q_visitedMedicalService.key, isRequired: true});
        hasMoreGroup.addItem(Q_visitedMedicalServiceWhen.get());

        // // Qcov18 reasons no medical services-----------------------------------------
        const Q_visitedNoMedicalService = new pool.WhyVisitedNoMedicalService({parentKey:hasMoreGroupKey, keyVisitedMedicalServ: Q_visitedMedicalService.key, isRequired: true});
        hasMoreGroup.addItem(Q_visitedNoMedicalService.get());

        // // Qcov16h test -----------------------------------------------------
        const Q_symptomImpliedCovidTest = new pool.SymptomImpliedCovidTest({parentKey: hasMoreGroupKey, isRequired: true});
        hasMoreGroup.addItem(Q_symptomImpliedCovidTest.get());

        // Qcov16i test type -----------------------------------------------------
        const Q_covidTestType = new pool.CovidTestType({parentKey: hasMoreGroupKey, keySymptomImpliedCovidTest: Q_symptomImpliedCovidTest.key, isRequired: true});
        hasMoreGroup.addItem(Q_covidTestType.get());

        // Qcov16b PCR test result
        const Q_resultPCRTest = new pool.ResultPCRTest({parentKey:hasMoreGroupKey, keyTestType: Q_covidTestType.key, isRequired: true})
        hasMoreGroup.addItem(Q_resultPCRTest.get());

        //Qcov16f Serological test result
        const Q_resultAntigenicTest = new pool.ResultAntigenicTest({parentKey:hasMoreGroupKey, keyTestType: Q_covidTestType.key, isRequired: true})
        hasMoreGroup.addItem(Q_resultAntigenicTest.get());

        //Qcov16k Serological test result
        const Q_resultRapidAntigenicTest = new pool.ResultRapidAntigenicTest({parentKey:hasMoreGroupKey, keyTestType:Q_covidTestType.key, isRequired:true})
        hasMoreGroup.addItem(Q_resultRapidAntigenicTest.get());

        // // Qcov19 test -----------------------------------------------------
        const Q_fluTest = new pool.FluTest({parentKey: hasMoreGroupKey, isRequired: true});
        hasMoreGroup.addItem(Q_fluTest.get());

        //Qcov19b Flu PCR test result
        const Q_resultFluPCRTest = new pool.ResultFluTest({parentKey:hasMoreGroupKey, keyFluTest: Q_fluTest.key, isRequired: true})
        hasMoreGroup.addItem(Q_resultFluPCRTest.get());

        // // Q9 took medication --------------------------------------
        const Q_tookMedication = new pool.TookMedication({parentKey:hasMoreGroupKey, isRequired:true});
        hasMoreGroup.addItem(Q_tookMedication.get());

        const Q_antibioFrom = new weekly.AntibioticFrom({parentKey:hasMoreGroupKey, isRequired: false, medicationQuestion: Q_tookMedication } )

        hasMoreGroup.addItem(Q_antibioFrom.get());

        // // Q14 hospitalized ------------------------------------------------
        const Q_hospitalized = new pool.Hospitalized({parentKey:hasMoreGroupKey, isRequired:true});
        hasMoreGroup.addItem(Q_hospitalized.get());

        // // Q10 daily routine------------------------------------------------
        const Q_dailyRoutine = new pool.DailyRoutine({parentKey:hasMoreGroupKey, isRequired:true});
        hasMoreGroup.addItem(Q_dailyRoutine.get());

        // // Q10b today-------------------------------------------------------
        const Q_dailyRoutineToday = new pool.DailyRoutineToday({parentKey:hasMoreGroupKey, keyDailyRoutine: Q_dailyRoutine.key, isRequired:true});
        hasMoreGroup.addItem(Q_dailyRoutineToday.get());

        // // Q10c daily routine days-----------------------------------------
        const Q_dailyRoutineDaysMissed = new pool.DailyRoutineDaysMissed({parentKey:hasMoreGroupKey, keyDailyRoutine: Q_dailyRoutine.key, isRequired:true});
        hasMoreGroup.addItem(Q_dailyRoutineDaysMissed.get());

        // // Qcov7 Covid 19 habits change question ------------------------------------------------------
        const Q_covidHabits = new pool.CovidHabitsChange({parentKey:hasMoreGroupKey, isRequired:false});
        hasMoreGroup.addItem(Q_covidHabits.get());

        // // Q11 think cause of symptoms --------------------------------------
        const Q_causeOfSymptoms = new pool.CauseOfSymptoms({parentKey:hasMoreGroupKey, isRequired:true});
        hasMoreGroup.addItem(Q_causeOfSymptoms.get());

        this.items.push(hasMoreGroup);

        const Q_Howdoyoufeel = new weekly.HowDoYouFeel({parentKey: rootKey});
        
        this.items.push(Q_Howdoyoufeel);

        const surveyEndText = new pool.SurveyEnd({parentKey:rootKey});
        this.items.push(surveyEndText);
    }

    getSameIllnessKey() {
        return this.Q_same_illnes.key;
    }

}

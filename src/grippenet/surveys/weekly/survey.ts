import {  _T,questionPools, SurveyBuilder, transTextComponent, ClientExpression as ce,  textComponent, ItemQuestion, GroupQuestion } from "../../../common"
import {  Item } from "case-editor-tools/surveys/types";
import * as weekly from "./questions";
//import * as ansm from "./ansm";
import { lastSubmissionQuestion } from "../../questions/lastSubmission";
import { GrippenetFlags } from "../../flags";
import { weeklySurveyKey } from "../../constants";
import responses from './responses';
import * as iraprev from "./iraprev";
import { Expression } from "survey-engine/data_types";

const pool = questionPools.weekly;

export class WeeklyDef extends SurveyBuilder {

    Q_symptomsEnd: Item;

    Q_wantsMore: Item;

    //Q_AnsmDeliveryFailure:Item;

    constructor(meta:Map<string,string>) {
        super({
            surveyKey: weeklySurveyKey,
            name:  _T( "weekly.name.0", "Weekly questionnaire"),
            description:_T("weekly.description.0", "Please also report if you had no complaints."),
            durationText: _T( "weekly.typicalDuration.0", "Duration 1-5 minutes"),
            metadata: meta
        });
        
        const rootKey = this.key

        const QLastSubmit = new lastSubmissionQuestion({parentKey: rootKey, itemKey:'submission', flagKey: GrippenetFlags.lastWeekly.key, trans:'weekly.lastsubmission'});
        this.items.push(QLastSubmit);

        // Symptoms Q1
        const Q_symptoms = new pool.Symptoms({parentKey: rootKey, isRequired: true, useRash: false, noteOnTop: true, useMarkdownNote: false});
        this.items.push(Q_symptoms);

        // // Group HS -------> HAS SYMPTOMS GROUP
        const hasSymptomGroup = new pool.SymptomsGroup({parentKey: rootKey, keySymptomsQuestion: Q_symptoms.key});
        const hasSymptomGroupKey = hasSymptomGroup.key;

        // // Q2 same illness --------------------------------------
        const Q_same_illness = new pool.SameIllness({parentKey: hasSymptomGroupKey, isRequired: false, useDoesNotApply: false});
        hasSymptomGroup.addItem(Q_same_illness.get());
        
        /*
        // // Qcov3 pcr tested contact COVID-19--------------------------------------
        const Q_covidPCRTestedContact = new pool.PcrTestedContact({parentKey: hasSymptomGroupKey, isRequired: true});
        hasSymptomGroup.addItem(Q_covidPCRTestedContact.get());

        // Qcov3b household pcr contacts COVID-19--------------------------
        const Q_pcrHouseholdContact = new pool.PcrHouseholdContact({parentKey: hasSymptomGroupKey, covid19ContactKey: Q_covidPCRTestedContact.key, isRequired: true});
        hasSymptomGroup.addItem(Q_pcrHouseholdContact.get());
        */

        // // Q3 when first symptoms --------------------------------------
        const Q_symptomStart = new weekly.SymptomsStart({parentKey: hasSymptomGroupKey, keySameIllness: Q_same_illness.key, isRequired: false});
        hasSymptomGroup.addItem(Q_symptomStart.get());

        // // Q4 when symptoms end --------------------------------------
        const Q_symptomsEnd = new pool.SymptomsEnd({parentKey:hasSymptomGroupKey, keySymptomsStart: Q_symptomStart.key, isRequired:false});
        this.Q_symptomsEnd = Q_symptomsEnd;
        hasSymptomGroup.addItem(Q_symptomsEnd.get());

        // QIRA1
        const QIraPrev1 = new iraprev.IRAPrev1({parentKey: hasSymptomGroupKey});
        const iraPrevCondition = Q_symptoms.createSymptomCondition("fever", "rhino","sorethroat", "cough", "loss_smell", "loss_smell");
        QIraPrev1.setCondition(iraPrevCondition);

        // // Q5 symptoms developed suddenly --------------------------------------
        const Q_symptomsSuddenlyDeveloped = new pool.SymptomsSuddenlyDeveloped({parentKey:hasSymptomGroupKey, isRequired:false});
        hasSymptomGroup.addItem(Q_symptomsSuddenlyDeveloped.get());

        // Q6 fever start questions
        // Separated into individual questions and Key code overriden to prevent Q6.a and keep Q6
        const Q_feverStart = new pool.FeverStart({parentKey:hasSymptomGroupKey, keySymptomsQuestion:Q_symptoms.key, keySymptomStart: Q_symptomStart.key, isRequired:false, keyOverride:"Q6"});
        hasSymptomGroup.addItem(Q_feverStart.get());

        // Q6b fever developed suddenly
        const Q_feverDevelopedSuddenly = new pool.FeverDevelopedSuddenly({parentKey: hasSymptomGroupKey, keySymptomsQuestion:Q_symptoms.key, isRequired: false, keyOverride:"Q6b"});
        hasSymptomGroup.addItem(Q_feverDevelopedSuddenly.get());

        // Q6c temperature taken
        const Q_didUMeasureTemp = new pool.DidUMeasureTemperature({parentKey:hasSymptomGroupKey, keySymptomsQuestion: Q_symptoms.key, isRequired: false, keyOverride: "Q6c"});
        hasSymptomGroup.addItem(Q_didUMeasureTemp.get());

        // Q6d highest temperature taken
        const Q_highestTempMeasured = new pool.HighestTemprerature({parentKey:hasSymptomGroupKey, keySymptomsQuestion: Q_symptoms.key, keyDidYouMeasureTemperature: Q_didUMeasureTemp.key, isRequired: false, keyOverride: "Q6d"});
        hasSymptomGroup.addItem(Q_highestTempMeasured.get());

        // Q16
        const Q_Stool = new weekly.StoolCount({parentKey: rootKey, SymptomQuestion: Q_symptoms, isRequired: false});
        hasSymptomGroup.addItem(Q_Stool.get());

        // Q36 optional information
        const Q_wantsMore = new pool.ConsentForMore({parentKey: hasSymptomGroupKey, isRequired: false});

        this.Q_wantsMore = Q_wantsMore;

        hasSymptomGroup.addItem(Q_wantsMore.get());

        this.items.push(hasSymptomGroup);

        const hasMoreGroup = new pool.HasMoreGroup({parentKey: rootKey, consentForMoreKey: Q_wantsMore.key});
        const hasMoreGroupKey = hasMoreGroup.key;

        // // Qcov16h test -----------------------------------------------------
        const Q_symptomImpliedCovidTest = new pool.SymptomImpliedCovidTest({parentKey: hasMoreGroupKey, isRequired: false});
        hasMoreGroup.addItem(Q_symptomImpliedCovidTest.get());

        const severalTestRealized = textComponent({key:"several", "content": _T("common.qcov16.several_test_realized", "If you have realized several test"), className:'mb-2'});
        
        const addQcov16notes= (item: ItemQuestion) => {
            item.setOptions({topDisplayCompoments: [severalTestRealized]});
        }

        // Qcov16i test type -----------------------------------------------------
        const Q_covidTestType = new pool.CovidTestType({parentKey: hasMoreGroupKey, keySymptomImpliedCovidTest: Q_symptomImpliedCovidTest.key, isRequired: false, useSerology: false});
        addQcov16notes(Q_covidTestType);
        hasMoreGroup.addItem(Q_covidTestType.get());

        // Qcov16b PCR test result
        const Q_resultPCRTest = new pool.ResultPCRTest({parentKey:hasMoreGroupKey, keyTestType: Q_covidTestType.key, isRequired: false})
        addQcov16notes(Q_resultPCRTest);
        hasMoreGroup.addItem(Q_resultPCRTest.get());

        //Qcov16f Serological test result
        const Q_resultAntigenicTest = new pool.ResultAntigenicTest({parentKey:hasMoreGroupKey, keyTestType: Q_covidTestType.key, isRequired: false})
        addQcov16notes(Q_resultAntigenicTest);
        hasMoreGroup.addItem(Q_resultAntigenicTest.get());

        //Qcov16k Serological test result
        const Q_resultRapidAntigenicTest = new pool.ResultRapidAntigenicTest({parentKey:hasMoreGroupKey, keyTestType:Q_covidTestType.key, isRequired:false})
        hasMoreGroup.addItem(Q_resultRapidAntigenicTest.get());

        // Qcov19 test 
        const Q_fluTest = new pool.FluTest({parentKey: hasMoreGroupKey, isRequired: false});
        hasMoreGroup.addItem(Q_fluTest.get());

        // Qcov19b Flu PCR test result
        const Q_resultFluPCRTest = new pool.ResultFluTest({parentKey:hasMoreGroupKey, isRequired: false})
        Q_resultFluPCRTest.setCondition(Q_fluTest.getHasTestCondition());
        hasMoreGroup.addItem(Q_resultFluPCRTest.get());

        // Q7 visited medical service
        const Q_visitedMedicalService = new weekly.VisitedMedicalService({parentKey: hasMoreGroupKey, isRequired: false, noteOnTop: true});
        hasMoreGroup.addItem(Q_visitedMedicalService.get());

        // Q7b how soon visited medical service 
        const Q_visitedMedicalServiceWhen = new weekly.VisitedMedicalServiceWhen({parentKey: hasMoreGroupKey, isRequired: false, visiteMedicalService: Q_visitedMedicalService});
        hasMoreGroup.addItem(Q_visitedMedicalServiceWhen.get());

        // Qcov20
        const Q_testBeforeMedical = new weekly.TestBeforeMedicalVisit({parentKey: hasMoreGroupKey, isRequired: false});
        Q_testBeforeMedical.setCondition(
            ce.logic.and(
                Q_symptomImpliedCovidTest.getYesResponseCondition(),
                Q_visitedMedicalService.getResponseCondition('gp', 'emergency', 'other','other_community')
            )
        )
        hasMoreGroup.addItem(Q_testBeforeMedical.get());

        // Qcov18 reasons no medical services 
        const Q_visitedNoMedicalService = new weekly.WhyVisitedNoMedicalService({parentKey:hasMoreGroupKey, keyVisitedMedicalServ: Q_visitedMedicalService.key, isRequired: false, useAnswerTip: false});
        Q_visitedNoMedicalService.setOptions({topDisplayCompoments: [ transTextComponent("common.only_single_response","Only single response")] });
        Q_visitedNoMedicalService.setCondition(
            Q_visitedMedicalService.getCov18Condition()
        );
        
        hasMoreGroup.addItem(Q_visitedNoMedicalService.get());

        /** 
        const Q1ansm = new ansm.Q1ANSM({parentKey: hasMoreGroupKey});
        Q1ansm.setCondition(Q_visitedMedicalService.getQ1AnsmCondition());

        hasMoreGroup.addItem(Q1ansm.get());

        const Q2ansm = new ansm.Q2ANSM({parentKey: hasMoreGroupKey});
        Q2ansm.setCondition(Q1ansm.getYesCondition());
        hasMoreGroup.addItem(Q2ansm.get());

        const QDeliveryGroup3 = new ansm.AnsmDeliveryGroup(
            {
                parentKey: hasMoreGroupKey, 
                NotDeliveredKey: 'Q3ansm',
                NotDeliveredIdontKnow: false,
                DelivedyReplaced: 'Q4ansm',
                ProposedAlternative: 'Q5ansm'
            }
        );

        QDeliveryGroup3.setCondition(Q2ansm.getYesCondition());

        hasMoreGroup.addItem(QDeliveryGroup3.get());
        */

        // // Q9 took medication --------------------------------------
        const Q_tookMedication = new pool.TookMedication({parentKey:hasMoreGroupKey, isRequired:false, useOtherTextInput: true, useCovidAntiviral: true});
        hasMoreGroup.addItem(Q_tookMedication.get());

        //const Q_antibioFrom = new weekly.AntibioticFrom({parentKey:hasMoreGroupKey, isRequired: false, medicationQuestion: Q_tookMedication } )
        //hasMoreGroup.addItem(Q_antibioFrom.get());

        // // Q14 hospitalized ------------------------------------------------
        const Q_hospitalized = new pool.Hospitalized({parentKey:hasMoreGroupKey, isRequired:false});
        hasMoreGroup.addItem(Q_hospitalized.get());


        //fièvre, nez qui coule, éternuements, maux de gorge, toux, perte d’odorat et perte de goût. 
        this.buildIRAPrev(hasMoreGroup, Q_symptoms.createAnySymptomCondition());
 
        // // Q10 daily routine------------------------------------------------
        const Q_dailyRoutine = new pool.DailyRoutine({parentKey:hasMoreGroupKey, isRequired:false});
        hasMoreGroup.addItem(Q_dailyRoutine.get());

        // // Q10b today-------------------------------------------------------
        const Q_dailyRoutineToday = new pool.DailyRoutineToday({parentKey:hasMoreGroupKey, keyDailyRoutine: Q_dailyRoutine.key, isRequired:false});
        hasMoreGroup.addItem(Q_dailyRoutineToday.get());

        // // Q10c daily routine days-----------------------------------------
        const Q_dailyRoutineDaysMissed = new pool.DailyRoutineDaysMissed({parentKey:hasMoreGroupKey, keyDailyRoutine: Q_dailyRoutine.key, isRequired:false});
        Q_dailyRoutineDaysMissed.setOptions({topDisplayCompoments: [ transTextComponent("weekly.Q10c.top.text.1", "Select the corresponding delay from the menu") ]})
        hasMoreGroup.addItem(Q_dailyRoutineDaysMissed.get());

        // // Qcov7 Covid 19 habits change question ------------------------------------------------------
        //const Q_covidHabits = new weekly.CovidHabitsChange({parentKey:hasMoreGroupKey, isRequired:false});
        //hasMoreGroup.addItem(Q_covidHabits.get());

        /**
         * CovidMask
         */
        /*
        const maskGroup = new weekly.MaskGroup({parentKey: hasMoreGroupKey});
        maskGroup.setCondition(Q_covidHabits.createWearMaskCondition());

        const QMaskContext = new weekly.MaskWearingContext({parentKey: maskGroup.key});
        maskGroup.addItem(QMaskContext.get());

        const QMaskWearingAlways = new weekly.MaskWearingAlways({parentKey: maskGroup.key});
        maskGroup.addItem(QMaskWearingAlways.get());

        const MaskNotWearingReason = new weekly.MaskNotWearingReason({parentKey: maskGroup.key});
        MaskNotWearingReason.setCondition(QMaskWearingAlways.createConditionNoUnknown());
        maskGroup.addItem(MaskNotWearingReason.get());

        const QMaskProvidedFrom = new weekly.MaskProvidedFrom({parentKey: maskGroup.key});
        maskGroup.addItem(QMaskProvidedFrom.get());

        hasMoreGroup.addItem(maskGroup.get());
       // Qm5
       const QMaskWhyNotWearing = new weekly.MaskWhyNotWearing({parentKey: hasMoreGroupKey});
       QMaskWhyNotWearing.setCondition(
            ce.logic.and(
                Q_symptoms.createAnySymptomCondition(),
                Q_covidHabits.createDontWearMaskCondition(),
            )
       );
       hasMoreGroup.addItem(QMaskWhyNotWearing.get());
        */
       
        // // Q11 think cause of symptoms --------------------------------------
        const Q_causeOfSymptoms = new weekly.CauseOfSymptoms({parentKey:hasMoreGroupKey, isRequired:false});
        hasMoreGroup.addItem(Q_causeOfSymptoms.get());


        this.items.push(hasMoreGroup);

        const Q_Howdoyoufeel = new weekly.HowDoYouFeel({parentKey: rootKey, isRequired: false});
        
        this.items.push(Q_Howdoyoufeel);

        /*
        const minorFlags = GrippenetFlags.minor;
        const MajorExpression = ce.participantFlags.hasKeyAndValue(minorFlags.key, minorFlags.values.no);

        const QAnsmGroup2 = new ansm.AnsmEndGroup({parentKey: rootKey});
        QAnsmGroup2.setCondition(ce.logic.and(Q_wantsMore.getYesCondition(), MajorExpression));
    
        this.Q_AnsmDeliveryFailure = QAnsmGroup2.getDeliveryFailureItem();
        this.items.push(QAnsmGroup2);
        */

        const surveyEndText = new pool.SurveyEnd({parentKey:rootKey});
        this.items.push(surveyEndText);
    }

    buildIRAPrev(g: GroupQuestion, condition: Expression) {

        const QIra2 = new iraprev.QIRAPrev2({parentKey: g.key});
        g.addItem(QIra2.get());

        const QIra3 = new iraprev.QIRAPrev3({parentKey:g.key});
        g.addItem(QIra3.get());

        const QIra4 = new iraprev.QIRAPrev4({parentKey:g.key});
        g.addItem(QIra4.get());


    }


    getSymptomEnd(): Item {
        return this.Q_symptomsEnd;
    }

    /*getAnsmDeliveryFailureItem(): Item {
        return this.Q_AnsmDeliveryFailure;
    }*/

   getHasMoreQuestion(): Item {
    return this.Q_wantsMore;
   }

}

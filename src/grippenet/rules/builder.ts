import { AbstractStudyRulesBuilder, responses } from "../../common";
import { GrippenetKeys } from "../keys";
import { responseGroupKey } from "case-editor-tools/constants/key-definitions";
import { ServerExpression as se } from "../../common";
import { Expression } from "survey-engine/data_types";
import WeeklyResponses from "../surveys/weekly/responses";
import { GrippenetFlags as flags } from "../flags";
import { Duration,  } from "case-editor-tools/types/duration";
import { assignedSurveys, updateFlag, hasParticipantFlagKeyAndValue, hasSurveyKeyAssigned, updateLastSubmission} from "./helpers";
import { ExtraStudyRulesBuilder } from "./extra_study";

export function response_item_key(name:string) {
    return responseGroupKey + '.' + name;
}

const IntakeResponses = responses.intake;

export class GrippenetRulesBuilder extends AbstractStudyRulesBuilder {

    protected keys: GrippenetKeys;

    constructor(keys: GrippenetKeys) {
        super();
        this.keys = keys;
    }

    create(): void {
     
        
        const intakeKey = this.keys.intake.key;
        const weeklyKey = this.keys.weekly.key;
        const vacKey = this.keys.vaccination.key;
        
        /**
         * Define what should happen, when persons enter the study first time:
         */
        const entryRules: Expression[] = [
            assignedSurveys.add(intakeKey, 'normal')
        ];
       
        const postalCodeKey = this.keys.intake.getPostalCodeItem().key;
        
        /**
         * Define what should happen, when persons submit an intake survey:
         */
        const handleIntake = se.ifThen(
            se.checkSurveyResponseKey(intakeKey),
            // remove assigned intake
            assignedSurveys.remove(intakeKey, 'all'),
            // add weekly survey if not already there
            se.ifThen(
                se.not(
                    hasSurveyKeyAssigned(weeklyKey)
                ),
                assignedSurveys.add(weeklyKey, 'prio')
            ),
            se.ifThen(
                se.hasResponseKey(postalCodeKey,'rg.0'),
                updateFlag(flags.needLocation.key, flags.needLocation.values.no),
            ),
            // add optional intake
            assignedSurveys.add(intakeKey, 'optional'),
            updateLastSubmission(flags.lastIntake.key)
        );

        const hasOnGoingSymptoms = flags.hasOnGoingSymptoms;

        const WeeklySymptomEndKey = this.keys.weekly.getSymptomEnd().key;

        const handleWeekly = se.ifThen(
            se.checkSurveyResponseKey(weeklyKey),
            // remove weekly and re-add it with new a new timeout
            assignedSurveys.remove(weeklyKey, 'all'),
            assignedSurveys.add(weeklyKey, 'prio', se.timestampWithOffset({hours: 1,})),
            // Manage flags:
            se.if(
                // if has ongoing symptoms:
                se.singleChoice.any(WeeklySymptomEndKey, WeeklyResponses.symptoms_end.still_ill),
                // then:
                updateFlag(hasOnGoingSymptoms.key, hasOnGoingSymptoms.values.yes),
                // else:
                updateFlag(hasOnGoingSymptoms.key, hasOnGoingSymptoms.values.no)
            ),
            updateLastSubmission(flags.lastWeekly.key),
        );

        const handleVaccination = se.ifThen(
            se.checkSurveyResponseKey(vacKey),
            // remove vaccination and re-add it with a new timeout
            assignedSurveys.remove(vacKey, 'all'),
            assignedSurveys.add(vacKey, 'optional', se.timestampWithOffset({hours: 1})),
            // update vaccinationCompleted flag
            updateFlag(flags.vaccinationCompleted.key, flags.vaccinationCompleted.values.yes),
            updateLastSubmission(flags.lastVaccination.key)
        );
        
        const ageResponseComp = responseGroupKey + '.' + IntakeResponses.birthDate.date;

        const underAgeFlag = flags.underAgeVac;

        const minorFlag = flags.minor;

        const intakeBirthDateKey = this.keys.intake.getBirthDateItem().key;

        const olderAgeExpression = (age: Duration): Expression => {
            
            const offset : Duration = {};
            if(age.years) {
                offset.years = -age.years;
            }
            if(age.months) {
                offset.months = -age.months;
            }
            
            if(Object.keys(offset).length == 0) {
                throw new Error("offset must have at least one entry");
            }

            // Timestamp(birthday) < Timestamp( now -offset)
            // True = Older than offset
            return se.lt(
                se.getResponseValueAsNum(intakeBirthDateKey, ageResponseComp),
                se.timestampWithOffset(offset)
            );
        };


        const handleChild = se.ifThen(
            se.checkSurveyResponseKey(intakeKey),
            se.do(
                // set child flag if younger than age
                se.if(
                    olderAgeExpression(underAgeFlag.age),
                    updateFlag(underAgeFlag.key, underAgeFlag.values.no), // Not under age = Can be vaccinated
                    updateFlag(underAgeFlag.key, underAgeFlag.values.yes)
                ),
                // if not child, add vaccination survey if not already there
                se.if(
                    se.and(
                        hasParticipantFlagKeyAndValue(underAgeFlag.key, underAgeFlag.values.no),
                        se.not(
                            hasSurveyKeyAssigned(vacKey)
                        )
                    ),
                    assignedSurveys.add(vacKey, 'prio')
                ),
                // if child, remove vaccination survey if present
                se.if(
                    se.and(
                        hasParticipantFlagKeyAndValue(underAgeFlag.key, underAgeFlag.values.yes),
                        hasSurveyKeyAssigned(vacKey)
                    ),
                    se.do(
                        assignedSurveys.remove(vacKey, 'all'),
                        se.participantActions.removeFlag(flags.vaccinationCompleted.key)
                    )
                ), // if
                 // Update minor flag
                 se.if(
                    olderAgeExpression(minorFlag.age),
                    updateFlag(minorFlag.key, minorFlag.values.no), 
                    updateFlag(minorFlag.key, minorFlag.values.yes)
                ),
               
            ) // do
        );

        const submitRules: Expression[] = [
            handleIntake,
            handleWeekly,
            handleVaccination,
            handleChild,
        ];

        const extra = new ExtraStudyRulesBuilder();

        submitRules.push(...extra.getSubmitRules());

        this.rules.entry = entryRules;
        this.rules.submit = submitRules;

    }
}
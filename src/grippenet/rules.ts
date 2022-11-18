import { AbstractStudyRulesBuilder, responses } from "../common";
import { GrippenetKeys } from "./keys";
import { responseGroupKey } from "case-editor-tools/constants/key-definitions";
import { ServerExpression as se } from "../common";
import { Expression } from "survey-engine/data_types";
import WeeklyResponses from "./surveys/weekly/responses";

import { GrippenetFlags as flags } from "./flags";

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
     
        const assignedSurveys = se.participantActions.assignedSurveys;
        const updateFlag = se.participantActions.updateFlag;
        const hasParticipantFlagKeyAndValue = se.participantState.hasParticipantFlagKeyAndValue
        const hasSurveyKeyAssigned = se.participantState.hasSurveyKeyAssigned;

        const intakeKey = this.keys.intake.key;
        const weeklyKey = this.keys.weekly.key;
        const vacKey = this.keys.vaccination.key;

        /**
         * Define what should happen, when persons enter the study first time:
         */
        const entryRules: Expression[] = [
            assignedSurveys.add(intakeKey, 'normal')
        ];
       
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
            // add optional intake
            assignedSurveys.add(intakeKey, 'optional')
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
            )
        );

        const handleVaccination = se.ifThen(
            se.checkSurveyResponseKey(vacKey),
            // remove vaccination and re-add it with a new timeout
            assignedSurveys.remove(vacKey, 'all'),
            assignedSurveys.add(vacKey, 'prio', se.timestampWithOffset({hours: 1})),
            // update vaccinationCompleted flag
            updateFlag(flags.vaccinationCompleted.key, flags.vaccinationCompleted.values.yes)
        );

        const ageResponseComp = responseGroupKey + '.' + IntakeResponses.birthDate.date;

        const underAgeFlag = flags.underAgeVac;

        const intakeBirthDateKey = this.keys.intake.getBirthDateItem().key;

        const handleChild = se.ifThen(
            se.checkSurveyResponseKey(intakeKey),
            se.do(
                // set child flag if younger than age
                se.if(
                    // Timestamp(birthday) < Timestamp( now -offset)
                    // True = Older than offset
                    se.lt(
                        se.getResponseValueAsNum(intakeBirthDateKey, ageResponseComp),
                        se.timestampWithOffset(underAgeFlag.offset)
                    ),
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
                ) // if
            ) // do
        );


        const submitRules: Expression[] = [
            handleIntake,
            handleWeekly,
            handleVaccination,
            handleChild
        ];

        this.rules.entry = entryRules;
        this.rules.submit = submitRules;

    }
}
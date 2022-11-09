import { AbstractStudyRulesBuilder, responses } from "../common";
import { GrippenetKeys } from "./keys";
import { responseGroupKey } from "case-editor-tools/constants/key-definitions";
import { ServerExpression as se } from "../common";
import { Expression } from "survey-engine/data_types";
import { CommonStudy } from "../../common";

export function response_item_key(name:string) {
    return responseGroupKey + '.' + name;
}

const flags = CommonStudy.flags.ParticipantFlags;

const WeeklyResponses = responses.weekly;
const IntakeResponses = responses.intake;

export class GrippenetRulesBuilder extends AbstractStudyRulesBuilder {

    protected keys: GrippenetKeys;

    constructor(keys: GrippenetKeys) {
        super();
        this.keys = keys;
    }

    create(): void {
     
        const assignedSurveys = se.participantActions.assignedSurveys;

        /**
         * Define what should happen, when persons enter the study first time:
         */
        const entryRules: Expression[] = [
            assignedSurveys.add(this.keys.intakeKey, 'normal')
        ];

        /**
         * Define what should happen, when persons submit an intake survey:
         */
        const handleIntake = se.ifThen(
            se.checkSurveyResponseKey(this.keys.intakeKey),
            // remove assigned intake
            assignedSurveys.remove(this.keys.intakeKey, 'all'),
            // add weekly survey if not already there
            se.ifThen(
                se.not(
                    se.participantState.hasSurveyKeyAssigned(this.keys.weeklyKey)
                ),
                assignedSurveys.add(this.keys.weeklyKey, 'prio')
            ),
            // add optional intake
            assignedSurveys.add(this.keys.intakeKey, 'optional')
        );

        const handleWeekly = se.ifThen(
            se.checkSurveyResponseKey(this.keys.weeklyKey),
            // remove weekly and re-add it with new a new timeout
            assignedSurveys.remove(this.keys.weeklyKey, 'all'),
            assignedSurveys.add(this.keys.weeklyKey, 'prio', se.timestampWithOffset({hours: 1,})),
            // Manage flags:
            se.if(
                // if has ongoing symptoms:
                se.singleChoice.any(this.keys.weeklySameIllnessKey, WeeklyResponses.same_illness.dontknow),
                // then:
                se.participantActions.updateFlag(
                    flags.hasOnGoingSymptoms.key,
                    flags.hasOnGoingSymptoms.values.yes
                ),
                // else:
                se.participantActions.updateFlag(
                    flags.hasOnGoingSymptoms.key,
                    flags.hasOnGoingSymptoms.values.no
                )
            )
        );

        const handleVaccination = se.ifThen(
            se.checkSurveyResponseKey(this.keys.vacKey),
            // remove vaccination and re-add it with a new timeout
            assignedSurveys.remove(this.keys.vacKey, 'all'),
            assignedSurveys.add(this.keys.vacKey, 'prio', se.timestampWithOffset({days: 28})),
            // update vaccinationCompleted flag
            se.participantActions.updateFlag(flags.vaccinationCompleted.key, flags.vaccinationCompleted.values.yes)
        );

        const ageResponseComp = responseGroupKey + '.' + IntakeResponses.birthDate.date;

        const handleChild = se.ifThen(
            se.checkSurveyResponseKey(this.keys.intakeKey),
            se.do(
                // set child flag if younger than age
                se.if(
                    se.lt(
                        se.getResponseValueAsNum(this.keys.intakeBirthDateKey, ageResponseComp),
                        se.timestampWithOffset({ years: -flags.isChild.age })
                    ),
                    se.participantActions.updateFlag(flags.isChild.key, flags.isChild.values.no),
                    se.participantActions.updateFlag(flags.isChild.key, flags.isChild.values.yes)
                ),
                // if not child, add vaccination survey if not already there
                se.if(
                    se.and(
                        se.participantState.hasParticipantFlagKeyAndValue(flags.isChild.key, flags.isChild.values.no),
                        se.not(
                            se.participantState.hasSurveyKeyAssigned(this.keys.vacKey)
                        )
                    ),
                    se.participantActions.assignedSurveys.add(this.keys.vacKey, 'prio')
                ),
                // if child, remove vaccination survey if present
                se.if(
                    se.and(
                        se.participantState.hasParticipantFlagKeyAndValue(flags.isChild.key, flags.isChild.values.yes),
                        se.participantState.hasSurveyKeyAssigned(this.keys.vacKey)
                    ),
                    se.do(
                        se.participantActions.assignedSurveys.remove(this.keys.vacKey, 'all'),
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
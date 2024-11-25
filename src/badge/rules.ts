import { expWithArgs } from "case-editor-tools/surveys/utils/simple-generators";
import { ServerExpression as se } from "../../common";
import { Expression, ExpressionArg } from "survey-engine/data_types";
import { onSurveySubmitted } from "../grippenet/rules/helpers";
import { BadgeDefinition, BadgeDefinitions, BadgeCounterDefinition, isBadgeStep } from "./definition";

const hasFlag = se.participantState.hasParticipantFlagKey;
const getFlagValueAsNum = se.participantState.getParticipantFlagValueAsNum;
const updateFlag = se.participantActions.updateFlag;
const isoWeek = se.getISOWeekForTs;
const updateReport = se.participantActions.reports.updateData;

const add = (...values: (Expression|number)[]):Expression => {
    return expWithArgs('sum', ...values);
};

export interface SingleResponseRef {
    itemKey: string
    responseKey: string
}


interface BadgeBuilderConfig {
    weeklyKey: string;
    intakeKey: string;
    vaccKey: string; // Vaccination Survey Key
    flagWeeklySequentialCounter: string; // Sequential flag
    flagWeeklySeasonalCounter: string;
    flagSeasonCounter: string;
    flagWeeklyOverallCounter: string; //
    flagLastLocation: string; // Last location flag 
    flagsLastSubmission :{ // Last submission flag is a timestamp created when the survey is submitted. Must be managed by rules
        weekly: string
        intake: string
        vacc: string
    },
    seasonStart: number; // timestamp of the start of the season
    previousSeasonStart: number; // timestamp of the previous season
    weeklyMoreQuestion: Expression,
    intakeTobacco: Expression,
    intakePostalCode:SingleResponseRef, // Expression to get postalcode value
    influenzaVaccPrev?: Expression, // Vaccination question
    externals?: string[]
}

interface badgeCreateOpts {
    flag: string // flag Name
    condition?: Expression
    extra?: Expression[]
}

const createBadgeIfNotExists = (props: badgeCreateOpts)=> {
    
    const flagName = props.flag;
    const createCondition = props.condition;
    const extraActions = props.extra;

    const createFlag = () => {
        return se.do(
            updateFlag(flagName, se.timestampWithOffset({seconds:0})),
            updateReport('badge', flagName, '1'),
            ...(extraActions ? extraActions : []),
        );
    }
    return se.ifThen(
        se.not(hasFlag(flagName)),
        createCondition ? se.ifThen(createCondition, createFlag()) : createFlag()
    );
};

const createCounterBadge = (counterFlag: string, badgeDef: BadgeDefinition) => {
    if(!isBadgeStep(badgeDef)) {
        throw new Error("Badge " + badgeDef.flag + ' is not a step badge');
    }
    return createBadgeIfNotExists({
            flag: badgeDef.flag, 
            condition: se.and(
                hasFlag(counterFlag),
                se.gte(getFlagValueAsNum(counterFlag), badgeDef.count)
            )
        }
    );
}

const incrementFlag = (flagName: string) => {
    return se.if(
        hasFlag(flagName),
        updateFlag(flagName, add(getFlagValueAsNum(flagName), 1)),
        updateFlag(flagName, 1)
    );
}

export class BadgeRuleBuilder {
    config: BadgeBuilderConfig;
    
    constructor(config: BadgeBuilderConfig) {
        this.config = config;
    }

    build(): Expression[] {

        const weeklyRules: Expression[] = [];
        const intakeRules: Expression[] = [];
        const vaccRules: Expression[] = [];

        const FlagsLastSubmission = this.config.flagsLastSubmission;

        // Counters
        
        weeklyRules.push( createSequentialWeekCounter(this.config.flagWeeklySequentialCounter, FlagsLastSubmission.weekly));
        
        weeklyRules.push( 
            incrementFlag(this.config.flagWeeklySeasonalCounter),
            incrementFlag(this.config.flagWeeklyOverallCounter),
        );

        weeklyRules.push(
            se.ifThen(
                se.lt(this.config.flagsLastSubmission.weekly, this.config.seasonStart),
                incrementFlag(this.config.flagSeasonCounter)
            )
        );

        weeklyRules.push( createBadgeIfNotExists({flag: BadgeDefinitions.beginner.flag}) );

        weeklyRules.push( createCounterBadge(this.config.flagWeeklyOverallCounter, BadgeDefinitions.step5) )
        weeklyRules.push( createCounterBadge(this.config.flagWeeklyOverallCounter, BadgeDefinitions.step10) )
        weeklyRules.push( createCounterBadge(this.config.flagWeeklyOverallCounter, BadgeDefinitions.step25) )
        weeklyRules.push( createCounterBadge(this.config.flagWeeklyOverallCounter, BadgeDefinitions.step50) )
        weeklyRules.push( createCounterBadge(this.config.flagWeeklyOverallCounter, BadgeDefinitions.step100) )

        // Loyalty > 4 weeks sequential
        weeklyRules.push( 
            createCounterBadge(this.config.flagWeeklySequentialCounter, BadgeDefinitions.loyalty ),
        );

        // Regularity > 12 weeks sequential
        weeklyRules.push( 
            createCounterBadge(this.config.flagWeeklySequentialCounter, BadgeDefinitions.regularity ),
        );

        weeklyRules.push(
            createCounterBadge(this.config.flagSeasonCounter, BadgeDefinitions.seasonBronze),
            createCounterBadge(this.config.flagSeasonCounter, BadgeDefinitions.seasonArgent),
            createCounterBadge(this.config.flagSeasonCounter, BadgeDefinitions.seasonGold),
        )

        weeklyRules.push(
            createBadgeIfNotExists({flag: BadgeDefinitions.precision.flag, condition: this.config.weeklyMoreQuestion})
        )

        if(this.config.externals) {
            const externals = this.config.externals.map(surveyKey => {
                return se.participantState.lastSubmissionDateOlderThan(se.timestampWithOffset({'seconds':0}), surveyKey);
            });
            weeklyRules.push(
                createBadgeIfNotExists({
                    flag:BadgeDefinitions.external.flag, 
                    condition: se.or(...externals)
                })
            );
        }

        const flagValueAfterSeasonStart = (flag: string) => {
            return se.and(
                    hasFlag(flag),
                    se.gte(getFlagValueAsNum(flag), this.config.seasonStart)
            );
        }

        // Starting badge check each other survey
        intakeRules.push(
            createBadgeIfNotExists({
                flag: BadgeDefinitions.starting.flag,
                condition: flagValueAfterSeasonStart(FlagsLastSubmission.vacc)
            })
        );
        
        intakeRules.push(
            createPioneerBadge(this.config.intakePostalCode, this.config.flagLastLocation )    
        );
        
       
        vaccRules.push(
            createBadgeIfNotExists({
                flag:BadgeDefinitions.starting.flag,
                condition: flagValueAfterSeasonStart(FlagsLastSubmission.intake)
            })
        );

        if(this.config.influenzaVaccPrev) {
            vaccRules.push(
                createBadgeIfNotExists({
                    flag: BadgeDefinitions.influenza_prev.flag, 
                    condition: this.config.influenzaVaccPrev
                })
            );
        }

        intakeRules.push(
            createBadgeIfNotExists({
                flag: BadgeDefinitions.stop_tobacco.flag, 
                condition: this.config.intakeTobacco
            })
        )

        const rules: Expression[] = [];
    
        if(weeklyRules.length > 0) {
            rules.push(onSurveySubmitted(this.config.weeklyKey, ...weeklyRules));
        }
        if(intakeRules.length > 0) {
            rules.push(onSurveySubmitted(this.config.intakeKey, ...intakeRules));
        }
        if(vaccRules.length > 0 ) {
            rules.push(onSurveySubmitted(this.config.vaccKey, ...vaccRules));
        }

        return rules;
    }
}

// Create a pioneer Badge
// Pioneer is defined as to be the first to respond to be in a location code.
// We first check there is an update of postalcode before to send request to external service
const createPioneerBadge = (postalCodeRef: SingleResponseRef, flagLastLocation:string):Expression => {
    const hasPostalCode = se.hasResponseKey(postalCodeRef.itemKey, postalCodeRef.responseKey);
    const postalCodeValue = se.getResponseValueAsStr(postalCodeRef.itemKey, postalCodeRef.responseKey);
    return createBadgeIfNotExists({
        flag: BadgeDefinitions.pionner.flag,
        condition: se.and(
            // Need to update the pioneer check (postalcode has changed)
            hasPostalCode,
            se.not(se.eq(
                se.participantState.getParticipantFlagValue(flagLastLocation),
                postalCodeValue
            )),
            // Call external service to check pioneer flag
            se.eq(
                se.externalEventEval('pioneer'),
                '1'
            )
        ),
        extra: [
            updateFlag(flagLastLocation, postalCodeValue)
        ]
    })
};


const createSequentialWeekCounter =(counterFlag:string, timeFlag:string)=>{
    
    // flag + days <= current <=> flag >= current - days 
    const timeFlagNewerThan = (flag:string, days: number) => {
        return se.gt(
            se.participantState.getParticipantFlagValueAsNum(flag),
            se.timestampWithOffset({days: -days})
        );
    }

    // flag + days >= current <=> flag <= current - days
    const timeFlagOlderThan = (flag:string, days: number) => {
        return se.lt(
            se.participantState.getParticipantFlagValueAsNum(flag),
            se.timestampWithOffset({days: -days})
        );
    }
    
    const incrementCounter = ()=> {
        return se.if(
                hasFlag(counterFlag),
                updateFlag(counterFlag, add(getFlagValueAsNum(counterFlag), 1)),
                updateFlag(counterFlag, 1)
            )
    }

    const checkInNextWeek = () => {
        return se.or(
            // Delay from last <= 7 days and weeks are not the same
            se.and(
                timeFlagNewerThan(timeFlag, 7),
                // w1 != w2
                se.not(
                    se.eq( 
                        isoWeek(getFlagValueAsNum(timeFlag)),
                        isoWeek(se.timestampWithOffset({seconds:0}))
                    )
                )

            ),
            se.and(
                timeFlagOlderThan(timeFlag, 7),
                timeFlagNewerThan(timeFlag, 14)
            )
        )
    }

    return se.if(
        hasFlag(timeFlag),
            // hasFlagTimeFlag()
            se.if(
                checkInNextWeek(),
                incrementCounter(),
                se.ifThen(  // If previous older than 14, then reset the flag to 1 (the current submission)
                    timeFlagOlderThan(timeFlag, 14),
                    updateFlag(counterFlag, 1)
                )
            ),
            // Else hasFlag(timeFlag)
            updateFlag(counterFlag, 1)
        )
}

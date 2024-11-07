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

interface BadgeBuilderConfig {
    WeeklyKey: string;
    IntakeKey: string;
    VaccKey: string; // Vaccination Survey Key
    FlagWeeklySequentialCounter: string; // Sequential flag
    FlagWeeklySeasonalCounter: string;
    FlagSeasonCounter: string;
    FlagWeeklyOverallCounter: string; //
    FlagsLastSubmission :{ // Last submission flag is a timestamp created when the survey is submitted. Must be managed by rules
        weekly: string
        intake: string
        vacc: string
    },
    seasonStart: number; // timestamp of the start of the season
    previousSeasonStart: number; // timestamp of the previous season
    WeeklyMoreQuestion: Expression,
    IntakeTobacco: Expression,
    IntakePostalCode: Expression, // Expression to get postalcode value
    InfluenzaVaccPrev?: Expression, // Vaccination question
    Externals?: string[]
}

const createBadgeIfNotExists = (flagName: string, createCondition?: Expression, extraActions?: Expression[])=> {
    
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
    return createBadgeIfNotExists(badgeDef.flag, 
        se.and(
            hasFlag(counterFlag),
            se.gte(getFlagValueAsNum(counterFlag), badgeDef.count)
        )
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

        const FlagsLastSubmission = this.config.FlagsLastSubmission;

        // Counters
        
        weeklyRules.push( createSequentialWeekCounter(this.config.FlagWeeklySequentialCounter, FlagsLastSubmission.weekly));
        
        weeklyRules.push( 
            incrementFlag(this.config.FlagWeeklySeasonalCounter),
            incrementFlag(this.config.FlagWeeklyOverallCounter),
        );

        weeklyRules.push(
            se.ifThen(
                se.lt(this.config.FlagsLastSubmission.weekly, this.config.seasonStart),
                incrementFlag(this.config.FlagSeasonCounter)
            )
        );

        weeklyRules.push( createBadgeIfNotExists(BadgeDefinitions.beginner.flag) );

        weeklyRules.push( createCounterBadge(this.config.FlagWeeklyOverallCounter, BadgeDefinitions.step5) )
        weeklyRules.push( createCounterBadge(this.config.FlagWeeklyOverallCounter, BadgeDefinitions.step10) )
        weeklyRules.push( createCounterBadge(this.config.FlagWeeklyOverallCounter, BadgeDefinitions.step25) )
        weeklyRules.push( createCounterBadge(this.config.FlagWeeklyOverallCounter, BadgeDefinitions.step50) )
        weeklyRules.push( createCounterBadge(this.config.FlagWeeklyOverallCounter, BadgeDefinitions.step100) )

        // Loyalty > 4 weeks sequential
        weeklyRules.push( 
            createCounterBadge(this.config.FlagWeeklySequentialCounter, BadgeDefinitions.loyalty ),
        );

        // Regularity > 12 weeks sequential
        weeklyRules.push( 
            createCounterBadge(this.config.FlagWeeklySequentialCounter, BadgeDefinitions.regularity ),
        );

        weeklyRules.push(
            createCounterBadge(this.config.FlagSeasonCounter, BadgeDefinitions.seasonBronze),
            createCounterBadge(this.config.FlagSeasonCounter, BadgeDefinitions.seasonArgent),
            createCounterBadge(this.config.FlagSeasonCounter, BadgeDefinitions.seasonGold),
        )

        weeklyRules.push(
            createBadgeIfNotExists(BadgeDefinitions.precision.flag, this.config.WeeklyMoreQuestion)
        )

        if(this.config.Externals) {
            const externals = this.config.Externals.map(surveyKey => {
                return se.participantState.lastSubmissionDateOlderThan(se.timestampWithOffset({'seconds':0}), surveyKey);
            });
            weeklyRules.push(
                createBadgeIfNotExists(
                    BadgeDefinitions.external.flag, se.or(...externals)
                )
            );
        }

        // Starting badge check each other survey
        intakeRules.push(
            createBadgeIfNotExists(BadgeDefinitions.starting.flag,
                hasFlag(FlagsLastSubmission.vacc)
             )
        );

        /*
        intakeRules.push(
            createBadgeIfNotExists(BadgeDefinitions.pionner.flag,
                // check if condition met
                ,
                [

                ]
            ),
        )
        */

        vaccRules.push(
            createBadgeIfNotExists(BadgeDefinitions.starting.flag,
                hasFlag(FlagsLastSubmission.intake)
             )
        );

        if(this.config.InfluenzaVaccPrev) {
            vaccRules.push(
                createBadgeIfNotExists(BadgeDefinitions.influenza_prev.flag, this.config.InfluenzaVaccPrev)
            );
        }

        intakeRules.push(
            createBadgeIfNotExists(BadgeDefinitions.stop_tobacco.flag, this.config.IntakeTobacco)
        )

        const rules: Expression[] = [];
    
        if(weeklyRules.length > 0) {
            rules.push(onSurveySubmitted(this.config.WeeklyKey, ...weeklyRules));
        }
        if(intakeRules.length > 0) {
            rules.push(onSurveySubmitted(this.config.IntakeKey, ...intakeRules));
        }
        if(vaccRules.length > 0 ) {
            rules.push(onSurveySubmitted(this.config.VaccKey, ...vaccRules));
        }

        return rules;
    }

}

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

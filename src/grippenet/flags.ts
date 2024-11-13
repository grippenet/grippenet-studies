
import { CommonStudy, FlagCollection } from "../../common";

const flags = CommonStudy.flags.ParticipantFlags;

const monthInSeconds = 60 * 60 * 24 * 30;

const booleanValues = {
    yes: '1',
    no: '0'
} as const;


export const GrippenetFlags = {
    underAgeVac: {
        key: 'ageVac',
        age: {months: 6}, 
        values: {
            yes: '1', // Yes = Under age for vaccination survey
            no: '0' // No = 
        } as const
    } as const,
    minor: {
        key: 'minor',
        age: {years: 18},
        values: {
            yes: '1',
            no: '0'
        } as const
    } as const,
    lastIntake: {
        key: 'lastIntakeTime',
    },
    lastVaccination: {
        key: 'lastVacTime'
    },
    lastWeekly: {
        key: 'lastWeeklyTime',
    },
    lastMozart: {
        key: 'lastMozartTime'
    },
    lastPuli: {
        key: 'lastPuliTime'
    },
    mozartS0: {
        key: 'mozartS0',
        values: booleanValues
    } as const,
    reminderTester: {
        // Tester of reminder
        key: 'reminderTester',
        values: booleanValues,
    },
    needLocation: {
        key: 'needLocation',
        values: booleanValues
    } as const,
    lastLocation: {
        key: 'lastLoc',
    },
    main: {
        key: 'main',
        values: booleanValues
    } as const,
    hasOnGoingSymptoms: flags.hasOnGoingSymptoms,
    vaccinationCompleted: flags.vaccinationCompleted
} as const;


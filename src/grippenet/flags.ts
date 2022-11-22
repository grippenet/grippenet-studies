
import { CommonStudy, FlagCollection } from "../../common";

const flags = CommonStudy.flags.ParticipantFlags;

const monthInSeconds = 60 * 60 * 24 * 30;

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
    hasOnGoingSymptoms: flags.hasOnGoingSymptoms,
    vaccinationCompleted: flags.vaccinationCompleted
} as const;


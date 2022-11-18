
import { CommonStudy, FlagCollection } from "../../common";

const flags = CommonStudy.flags.ParticipantFlags;

const monthInSeconds = 60 * 60 * 24 * 30;

export const GrippenetFlags = {
    underAgeVac: {
        key: 'ageVac',
        offset: {months: -6}, //  Offset must be negative values
        values: {
            yes: '1', // Yes = Under age for vaccination survey
            no: '0' // No = 
        }
    } as const,
    hasOnGoingSymptoms: flags.hasOnGoingSymptoms,
    vaccinationCompleted: flags.vaccinationCompleted
} as const;


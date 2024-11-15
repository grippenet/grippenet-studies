import { getUnixTime, parseISO } from "date-fns";

export class StudyConfig {

    readonly season: number;

    readonly starting: Date;

    readonly previousStarting: Date;

    constructor(season: number, startDate: string, previousStart: string) {
        this.season = season;
        this.starting = parseISO(startDate);
        this.previousStarting = parseISO(previousStart);
    }

    getStartingTimestamp() {
        return getUnixTime(this.starting);
    }

    getPreviousStartingTimestamp() {
        return getUnixTime(this.previousStarting);
    }

}
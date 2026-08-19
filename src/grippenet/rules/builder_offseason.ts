import { AbstractStudyRulesBuilder, responses, ServerExpression as se } from "../../common";
import { GrippenetKeys } from "../keys";
import { responseGroupKey } from "case-editor-tools/constants/key-definitions";
import { Expression } from "survey-engine/data_types";
import { GrippenetFlags as flags } from "../flags";
import { assignedSurveys, updateFlag, hasParticipantFlagKeyAndValue, hasSurveyKeyAssigned, updateLastSubmission} from "./helpers";
import { HeatwaveKeys } from "../../../common/studies/heatwave/surveys/keys";

export function response_item_key(name:string) {
    return responseGroupKey + '.' + name;
}

const IntakeResponses = responses.intake;

export class GrippenetRulesOffSeasonBuilder extends AbstractStudyRulesBuilder {

    protected keys: GrippenetKeys;
        
    constructor(keys: GrippenetKeys) {
        super();
        this.keys = keys;
    }

    create(): void {
       
        const intakeKey = this.keys.intake.key;
        const hwBackgroundKey = HeatwaveKeys.BackgroundSurvey;
        const hwSymptomsKey = HeatwaveKeys.SymptomSurvey;
        
        const entryRules: Expression[] = [
            assignedSurveys.add(intakeKey, 'normal'),
            assignedSurveys.add(hwBackgroundKey, 'normal'),
        ];
       
        /**
         * Define what should happen, when persons submit an intake survey
         * Simplified version only to handle heatwave
         */
        const handleIntake = se.ifThen(
            se.checkSurveyResponseKey(intakeKey),
            // remove assigned intake
            assignedSurveys.remove(intakeKey, 'all'),
            updateLastSubmission(flags.lastIntake.key)
        );

        const handleBackground = se.ifThen(
            se.checkSurveyResponseKey(hwBackgroundKey),
            assignedSurveys.remove(hwBackgroundKey, 'all'),
            updateLastSubmission(flags.lastHeatwavebackround.key),
            assignedSurveys.add(hwSymptomsKey, 'immediate'),
        );

        const handleSymptoms = se.ifThen(
            se.checkSurveyResponseKey(hwSymptomsKey),
            assignedSurveys.remove(hwSymptomsKey, 'all'),
            updateLastSubmission(flags.lastHeatwaveSymptoms.key),
            assignedSurveys.add(hwSymptomsKey, 'prio', se.timestampWithOffset({ days: 5 })),
        );
    
         const submitRules: Expression[] = [
            handleIntake,
            handleBackground,
            handleSymptoms,
         ];
 
        
        this.rules.entry = entryRules;
        this.rules.submit = submitRules;

    }
}
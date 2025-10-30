import { StudyEngine as se } from "case-editor-tools/expression-utils/studyEngineExpressions";
import { Expression } from "survey-engine/data_types";
import { RuleSet } from "./base"
import { GrippenetFlags } from "../../flags";

const flagSispo = GrippenetFlags.sispo.key;

const create = (): Expression[]=> {

    const filter_sispo = se.and(
        se.participantState.hasParticipantFlagKey(flagSispo),
        se.not(
            se.participantState.hasParticipantFlagKeyAndValue(flagSispo, '')
        )
    );
   
    return [
        filter_sispo
    ];
};

export const ruleset: RuleSet = {
    name : 'filter_participant_sipseau',
    rules: create
}

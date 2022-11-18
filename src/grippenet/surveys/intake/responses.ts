import { responses as common_responses } from "../../../common"

import { check_encoding_collection } from "../../../common"
const common = common_responses.intake;

const ResponseEncoding = {
    ...common,
    health_prof: {
        no: "0",
        yes_human: "1",
        yes_animal: "2"
    } as const,

    for_whom: {
        myself: "0",
        "someone": "2",
        "household": "1",
        "representative": "3",
    } as const,

    cold_frequency: {
        ...common.cold_frequency,
        "sometimes": "6",
    } as const

} as const;

check_encoding_collection(ResponseEncoding);

export default ResponseEncoding;
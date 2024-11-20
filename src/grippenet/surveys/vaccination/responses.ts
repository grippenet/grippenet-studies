import { responses as common_responses } from "../../../common"

import { check_encoding_collection } from "../../../common"
const common = common_responses.vaccination;


const ResponseEncoding = {
    ...common,

    covid_vac_likert: {
        'current':'row1', // This season
        'last': 'row2', // Last season
        'before':'row3' // Before last season
    } as const,

} as const;

check_encoding_collection(ResponseEncoding);

export default ResponseEncoding;
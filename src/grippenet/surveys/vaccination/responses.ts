import { responses as common_responses } from "../../../common"

import { check_encoding_collection } from "../../../common"
const common = common_responses.vaccination;


const ResponseEncoding = {
    ...common,
} as const;

check_encoding_collection(ResponseEncoding);

export default ResponseEncoding;
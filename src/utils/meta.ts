
import {  _T, Translation, LanguageMap } from "../common"

export function add_meta(m: LanguageMap, meta: Map<string,string> ):LanguageMap {
    meta.forEach((value, key)=> {
        m.set('_' + key, value);
    });
    return m;
}

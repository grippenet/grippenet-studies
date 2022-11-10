
export const extra_texts = new Map<string, Map<string,string>>();

/**
 * Returns a french text
 */
 export function french(text:string, id:string, ref:string): Map<string,string> {
    const  trans = new Map<string,string>([
        ['en', ref],
        ['fr', text],
    ]);

    if(id) {
        extra_texts.set(id, trans);
    }
    return trans;
}
import { OptionDef } from "case-editor-tools/surveys/types";
import { format } from "util";
import { _T } from "../common";
import { as_option, OptionList } from "../utils/options";

const o = (key:string) => {
    return as_option(key, _T(key, key));
} 

// Index of a key in an option list
const index = (key:string, oo: OptionDef[]) => {
    return oo.findIndex(o => {
        return o.key === key;
    });
}

const new_list = (...keys:string[]) => {
    const oo = keys.map(k => o(k));
    return new OptionList(oo);
};

test("optionlist_values", ()=>{

    const kk = ['A','B'];

    const list = new_list(...kk);
    const oo = list.values();

    kk.forEach((key, index) => {
        const o = oo[index];
        expect(o.key).toBe(key);
    });
});

const keylist = (oo: OptionDef[]) => oo.map(o => o.key).join(',');

const test_insert_at = (from:string[], at:number, key:string) => {
    const l = new_list(...from);
    l.insertAt(at, o(key));
    const oo = l.values();
    
    test(format('Inserting %s in %s at %d => %s', key, from.join(','), at, keylist(oo)), () => {
        expect(index(key, oo)).toBe(at);
    });
}

describe("optionlist_insert", ()=> {

    const kk = ['A','B'];
      
    test_insert_at(kk, 0, 'C');
    test_insert_at(kk, 1, 'C');
   
    const k2 = ['a','b','c','d'];
    test_insert_at(k2, 0, 'C');
    test_insert_at(k2, 1, 'C');
    test_insert_at(k2, 2, 'C');
    test_insert_at(k2, 3, 'C');
    
});

const test_insert_before = (from:string[], before:string, key:string) => {
    const l = new_list(...from);
    const at = index(before, l.values());
    l.insertBeforeKey(before, o(key));
    const oo = l.values();
    test(format('Inserting %s in %s before %s => %s', key, from.join(','), before, keylist(oo)), ()=>{
        expect(index(key, oo)).toBe(at);
        expect(index(before, oo)).toBe(at + 1);
    });
}

describe("optionlist_insert_before", ()=> {
    const kk = ['a','b','c','d'];
    test_insert_before(kk, 'a', 'X');
    test_insert_before(kk, 'b', 'X');
    test_insert_before(kk, 'c', 'X');
    test_insert_before(kk, 'd', 'X');
    test("unknown_key", ()=> {
        expect(()=>{
                    test_insert_before(kk, 'e', 'X')
                }
            ).toThrowError(/is not found in list/);
    });
});


const test_insert_after = (from:string[], after:string, key:string) => {
    const l = new_list(...from);
    const at = index(after, l.values());
    l.insertAfterKey(after, o(key));
    const oo = l.values();
    test(format('Inserting %s in %s after %s => %s', key, from.join(','), after, keylist(oo)), ()=>{
        expect(index(key, oo)).toBe(at + 1); // Added key is next index
        expect(index(after, oo)).toBe(at); // Target key still in same place
    });
}

describe("optionlist_insert_after", ()=> {
    const kk = ['a','b','c','d'];
    test_insert_after(kk, 'a', 'X');
    test_insert_after(kk, 'b', 'X');
    test_insert_after(kk, 'c', 'X');
    test_insert_after(kk, 'd', 'X');
    test("unknown_key", ()=> {
        expect(()=>{
            test_insert_after(kk, 'e', 'X')
                }
            ).toThrowError(/is not found in list/);
    });
});
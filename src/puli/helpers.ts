
export const _T = (id:string, text: string) => {
    return new Map<string,string>([
        ['id', K(id)],
        ['fr', text]
    ]);
}

export const K = (id: string) => {
    return 'puli.' + id;
}



const yes_no = {
    'yes': '1',
    'no': '0',
    'dnk': '2'
} as const;

export const responses = {
    yes_no: yes_no,
    Q0: yes_no,
    Q1: {
        'yes':'1',
        'no': '0',
    } as const,
    Q2: yes_no,
    Q2b: {
        'lyme': '1',
        'encephalitis': '2',
        'other': '3'
    } as const,
    Q3: {
        'jardin':'1',
        'terrain':'2',
        'terrasse':'3',
        'no':'4',
    } as const,
    Q6: {
        'un': '1',
        'deux': '2',
        'trois': '3',
        'quatre_plus': '4',
        'dnk': '99'
    } as const,
    'Q6_8': {
        sameday: '1',
        nextday:'2',
        fallenAlone: '3',
        dnk: '99',
    } as const, 
    

} as const;

export default responses;
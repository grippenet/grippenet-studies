
export interface BadgeBaseDefinition {
    flag: string;
    seasonal?: boolean;
}

export interface BadgeSimpleDefinition extends BadgeBaseDefinition {
    type: 'base'
}

/**
 * Badge based on a counter value
 */
export interface BadgeCounterDefinition extends BadgeBaseDefinition {
    type: 'counter'
    count: number;
}


export type BadgeDefinition = BadgeSimpleDefinition | BadgeCounterDefinition ;

export const isBadgeStep = (b: BadgeDefinition): b is BadgeCounterDefinition => {
    return b.type == 'counter' && 'count' in b;
} 

export const BadgeDefinitions : Record<string, BadgeDefinition>= {
    'beginner': {
        type: 'base',
        flag: 'bg1',
    } as const,
    'starting': {
        type: 'base',
        flag: 'bg2',
        seasonal: true,
    } as const,
    'step5': {
        flag: 'bgs5',
        type: 'counter',
        count: 5
    } as const,
    'step10': {
        flag: 'bgs10',
        type: 'counter',
        count: 10
    } as const,
    'step25': {
        flag: 'bgs25',
        type: 'counter',
        count: 25
    } as const,
    'step50': {
        flag: 'bgs50',
        type: 'counter',
        count: 50
    } as const,
    'step100': {
        flag: 'bgs100',
        type: 'counter',
        count: 100
    } as const,
    'loyalty': {
        type: 'counter',
        count: 4,
        flag: 'bg3'
    } as const,
    'regularity': {
        type: 'counter',
        count: 12,
        flag: 'bg4',
        seasonal: true,
    } as const,
    'seasonBronze': {
        'type':'counter',
        flag:'bg5',
        count: 3
    },
    'seasonArgent': {
        'type':'counter',
        flag:'bg6',
        count: 5
    },
    'seasonGold': {
        'type':'counter',
        flag:'bg7',
        count: 10
    },
    'return': {
        'type':"base",
        "flag":"bg12",
        seasonal: true,
    },
    'pionner': {
        "type":"base",
        "flag":"bg13",
        "seasonal": true,
    },
    'precision': {
        "type": "base",
        "flag": "bg11",
        seasonal: true,
    },
    'external': {
        'type': 'base',
        flag: 'bg8',
    },
    'stop_tobacco': {
        'type':'base',
        flag: 'bg9',
        'seasonal': true,
    },
    'influenza_prev': {
        'type': 'base',
        flag: 'bg10',
        seasonal: true,
    },
    'muscles': {
        'type': 'base',
        'flag': 'bg11',
        seasonal: true,
    }
} as const;
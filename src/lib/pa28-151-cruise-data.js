// PA-28-151 Warrior Cruise Performance data — values TBD, to be read from chart
// Left-panel lookup: yRef by pressure altitude and temperature.
export const cruiseYRefLookup = [
   { pa:     0, points: [
        { t: 15.5, yRef:  0.0 }, { t:  37.8, yRef:  5.0 },
    ]},
    { pa:  1000, points: [
        { t: 4.4, yRef:  0.0 }, { t:  37.8, yRef:  7.6 },
    ]},
    { pa:  2000, points: [
        { t: -5.0, yRef:  0.0 }, { t:  37.8, yRef:  10.0 },
    ]},
    { pa:  3000, points: [
        { t: -13.9, yRef:  0.0 }, { t:  37.8, yRef:  12.4 },
    ]},
    { pa:  4000, points: [
        { t: -23.3, yRef:  0.0 }, { t:  37.8, yRef:  14.9 },
    ]},
    { pa:  5000, points: [
        { t: -28.9, yRef:  1.1 }, { t:  37.8, yRef:  17.2 },
    ]},
    { pa:  6000, points: [
        { t: -28.9, yRef:  4.0 }, { t:  37.8, yRef:  19.7 },
    ]},
    { pa:  7000, points: [
        { t: -28.9, yRef:  6.4 }, { t:  37.8, yRef:  22.0 },
    ]},
    { pa:  8000, points: [
        { t: -28.9, yRef:  8.9 }, { t:  34.4, yRef:  24.0 },
    ]},
    { pa:  9000, points: [
        { t: -28.9, yRef:  11.3 }, { t:  23.3, yRef:  24.0 },
    ]},
    { pa: 10000, points: [
        { t: -28.9, yRef:  13.8 }, { t:  11.7, yRef:  24.0 },
    ]},
    { pa: 11000, points: [
        { t: -28.9, yRef:  16.8 }, { t:  0.8, yRef:  24.0 },
    ]},
    { pa: 12000, points: [
        { t: -28.9, yRef:  19.1 }, { t:  -9.4, yRef:  24.0 },
    ]},
];

// Right-panel lookup: TAS by yRef, keyed by % power.
export const cruiseTASLookup = {
    75: [
        { yRef:  0, tas:  107.8 },
        { yRef: 16, tas:  115.0 },
    ],
    65: [
        { yRef:  0, tas:  101.0 },
        { yRef: 24, tas:  108.7 },
    ],
    55: [
        { yRef:  0, tas:  92.0 },
        { yRef: 24, tas:  95.6 },
    ],
};

export const cruiseMaxTAS = [
    { yRef:  0, tas: 117.2 },   // max curve lower anchor
    { yRef: 16, tas: 115   },   // 75% intersection
    { yRef: 17, tas: 114.9   },
    { yRef: 18, tas: 114.8   },
    { yRef: 20, tas: 114   },
    { yRef: 22.3, tas: 112.5   },    
    { yRef: 24, tas: 111   },   // 65%/55% intersection
];

// Fuel flow from chart legend (best power mixture) — values TBD
export const cruiseFuelGPH = { 75: 9.2, 65: 8.0, 55: 6.7 };

// TAS deduction when wheel fairings are NOT installed — value TBD
export const noFairingsTASDeduction = 2.0;
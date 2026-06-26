// PA-28-181 Archer II Engine Performance data — values TBD
// yRefLookup shape: { pa, points: [{ t, yRef }, ...] }
export const yRefLookup = [
    { pa:     0, points: [
        { t:  14.5, yRef:  0 },
        { t:  37.8, yRef: 0 },
    ]},
    { pa:  1000, points: [
        { t:   4.4, yRef:  0 },
        { t:  13, yRef:  2.0 },
        { t:  37.8, yRef: 7.4 },
    ]},
    { pa:  2000, points: [
        { t:  -5.6, yRef:  0 },
        { t: 11, yRef:  4.1 },
        { t:  37.8, yRef: 10 },
    ]},
    { pa:  3000, points: [
        { t: -15, yRef:  0 },
        { t: 9, yRef:  5.8 },
        { t:  37.8, yRef: 12.3 },
    ]},
    { pa:  4000, points: [
        { t: -23.9, yRef:  0 },
        { t: 7, yRef:  7.9 },
        { t:  37.8, yRef: 14.8 },
    ]},
    { pa:  5000, points: [
        { t: -28.9, yRef:  1.6 },
        { t: 5, yRef:  10 },
        { t:  37.8, yRef: 17.3 },
    ]},
    { pa:  6000, points: [
        { t: -28.9, yRef:  4.0 },
        { t:  -12, yRef: 8.3 },
        { t:  -1, yRef: 11 },
        { t:  3, yRef: 12.0 },
        { t:  10, yRef: 13.6 },
        { t:  37.8, yRef: 19.6 },
    ]},
    { pa:  8000, points: [
        { t: -28.9, yRef: 9 },
        { t:  -17, yRef: 12 },
        { t:  -6.7, yRef: 14.8 },
        { t:  -1, yRef: 16.3 },
        { t:  10, yRef: 18.7 },
        { t:  21, yRef: 21 },
        { t:  37.8, yRef: 24.5 },
    ]},
    { pa: 10000, points: [
        { t: -28.9, yRef: 14 },
        { t: -5, yRef:  20 },
        { t:  32, yRef: 28 },

    ]},
    { pa: 12000, points: [
        { t: -28.9, yRef: 19 },
        { t: -9, yRef:  24 },
        { t:  9, yRef: 28 },
    ]},
    { pa:  14000, points: [
        { t: -28.9, yRef: 24 },
        { t: -23.3, yRef:  25.4 },
        { t: -17.8, yRef:  26.8 },
        { t:  -13, yRef: 28 },
    ]},
];

// rpmLookup shape: { yRef, rpm } — one array per power setting
// yRef from getEngineYRef → interpolate to get RPM for that power line
export const rpmLookup = {
    75: [
         { yRef:  0, rpm: 2440 },
         { yRef: 18, rpm: 2660 },
    ],
    70: [
         { yRef:  0, rpm: 2380 },
         { yRef: 21, rpm: 2630 },
    ],
    65: [
         { yRef:  0, rpm: 2300 },
         { yRef: 24, rpm: 2595 },
    ],
    60: [
         { yRef:  0, rpm: 2210 },
         { yRef: 26.5, rpm: 2550 },
    ],
    55: [
         { yRef:  0, rpm: 2130 },
         { yRef: 28, rpm: 2450 },
    ],
};

export const engineMaxRPM = [
    { yRef:  0,    rpm: 2700 },
    { yRef: 18,    rpm: 2660 },  // 75% endpoint
    { yRef: 21,    rpm: 2630 },  // 70% endpoint
    { yRef: 24,    rpm: 2595 },  // 65% endpoint
    { yRef: 26.5,  rpm: 2550 },  // 60% endpoint
    { yRef: 28,    rpm: 2450 },  // 55% endpoint
];

// PA-28-181 Archer II Engine Performance data — values TBD
// yRefLookup shape: { pa, points: [{ t, yRef }, ...] }
export const yRefLookup = [
    { pa:     0, points: [
        { t:  14.5, yRef:  0 },
        { t:  37.8, yRef: 0 },
    ]},
    { pa:  1000, points: [
        { t:   4.4, yRef:  0 },
        { t:  37.8, yRef: 7.4 },
    ]},
    { pa:  2000, points: [
        { t:  -5.6, yRef:  0 },
        { t:  37.8, yRef: 10 },
    ]},
    { pa:  3000, points: [
        { t: -15, yRef:  0 },
        { t:  37.8, yRef: 12.3 },
    ]},
    { pa:  4000, points: [
        { t: -23.9, yRef:  0 },
        { t:  37.8, yRef: 14.8 },
    ]},
    { pa:  5000, points: [
        { t: -29, yRef:  1.6 },
        { t:  37.8, yRef: 17.3 },
    ]},
    { pa:  6000, points: [
        { t: -29, yRef:  4.0 },
        { t:  37.8, yRef: 19.6 },
    ]},
    { pa:  8000, points: [
        { t: -29, yRef: 9 },
        { t:  37.8, yRef: 24.5 },
    ]},
    { pa: 10000, points: [
        { t: -29, yRef: 14 },
        { t:  32, yRef: 28 },
    ]},
    { pa: 12000, points: [
        { t: -29, yRef: 19 },
        { t:  9, yRef: 28 },
    ]},
    { pa:  14000, points: [
        { t: -29, yRef: 24 },
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

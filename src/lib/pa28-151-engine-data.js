// PA-28-151 Warrior Engine Performance data — values TBD, to be read from chart
// yRefLookup shape: { pa, points: [{ t, yRef }, ...] }
export const yRefLookup = [
    { pa:     0, points: [
        { t: 15.5, yRef:  0.0 }, { t:  32.2, yRef:  3.9 },  { t:  37.8, yRef:  5.0 },
    ]},
    { pa:  1000, points: [
        { t: 4.4, yRef:  0.0 }, { t:  21.1, yRef:  4.0 },  { t:  37.8, yRef:  7.6 },
    ]},
    { pa:  2000, points: [
        { t: -5.0, yRef:  0.0 },  { t:  10, yRef:  3.75 }, { t:  37.8, yRef:  9.9 },
    ]},
    { pa:  3000, points: [
        { t: -13.9, yRef:  0.0 }, { t:  -12.2, yRef:  0.6 }, { t:  10, yRef:  6.2 }, { t:  21.1, yRef:  8.9 }, { t:  37.8, yRef:  12.4 },
    ]},
    { pa:  4000, points: [
        { t: -23.3, yRef:  0.0 }, { t:  -12.2, yRef:  3.2 }, { t:  10, yRef:  8.7 }, { t:  21.1, yRef:  11.3 }, { t:  37.8, yRef:  14.8 },
    ]},
    { pa:  5000, points: [
        { t: -28.9, yRef:  1.2 }, { t:  -15, yRef:  5.0 },{ t:  -12.2, yRef:  5.8 },{ t:  -1.1, yRef:  8.6 },{ t:  15.6, yRef:  12.5 },{ t:  37.8, yRef:  17.3 },
    ]},
    { pa:  6000, points: [
        { t: -28.9, yRef:  4.0 }, { t:  -12.2, yRef:  8.4 }, { t:  4.4, yRef:  12.4 }, { t:  37.8, yRef:  19.7 },
    ]},
    { pa:  7000, points: [
        { t: -28.9, yRef:  6.4 }, { t:  -15, yRef:  10.1 },{ t:  -12.2, yRef:  10.8 },{ t:  10, yRef:  16.1 },{ t:  21.1, yRef:  18.5 }, { t:  37.8, yRef:  22.0 },
    ]},
    { pa:  8000, points: [
        { t: -28.9, yRef:  8.9 }, /*{ t:  -15, yRef:  12.7 },*/{ t:  -12.2, yRef:  13.3 },{ t:  10, yRef:  18.6 },{ t:  21.1, yRef:  21.0 },{ t:  34.5, yRef:  24.0 },
    ]},
    { pa:  9000, points: [
        { t: -28.9, yRef:  11.3 }, { t:  -12.2, yRef:  15.7 }, { t:  10, yRef:  20.9 }, { t:  21.1, yRef:  23.5 }, { t:  23.4, yRef:  24.0 },
    ]},
    { pa: 10000, points: [
        { t: -28.9, yRef:  13.7 }, { t:  -12.2, yRef:  18.1 },  { t:  11.7, yRef:  24.0 },
    ]},
    { pa: 11000, points: [
        { t: -28.9, yRef:  16.7 }, { t:  0.8, yRef:  24.0 },
    ]},
    { pa: 12000, points: [
        { t: -28.9, yRef:  19.1 }, { t:  -9.4, yRef:  24.0 },
    ]},
];

// rpmLookup shape: { yRef, rpm } — one array per power setting — values TBD
export const rpmLookup = {
    75: [
        { yRef:  0, rpm: 2440 },
        { yRef: 15.85, rpm: 2700 },
    ],
    65: [
        { yRef:  0, rpm: 2320 },
        { yRef: 24, rpm: 2609 },
    ],
    55: [
        { yRef:  0, rpm: 2194 },
        { yRef: 24, rpm: 2402 },
    ],
};

export const engineMaxRPM = [
    { yRef:  0,    rpm: 2700 },  // cruise-engine derived: ~88.8% power at yRef=0
    { yRef: 16,    rpm: 2700 },  // 75% endpoint (capped at redline)
    { yRef: 17,    rpm: 2700 },  // capped at redline
    { yRef: 18,    rpm: 2700 },  // capped at redline
    { yRef: 20,    rpm: 2700 },  // capped at redline
    { yRef: 22.3,  rpm: 2687 },  // cruise-engine derived
    { yRef: 24,    rpm: 2664 },  // 65% endpoint area, cruise-engine derived
];

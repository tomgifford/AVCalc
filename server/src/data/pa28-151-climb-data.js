// PA-28-151 Warrior Climb Performance data — values TBD, to be read from chart
export const climbDistLookup = [
    { yRef:  0, dist:  0.0 },
    { yRef:  2, dist:  2.1 },
    { yRef:  4, dist:  4.0 },
    { yRef:  6, dist:  6.8 },
    { yRef:  8, dist:  9.5 },
    { yRef: 10, dist:  12.5 },
    { yRef: 12, dist:  15.8 },
    { yRef: 14, dist:  19.7 },
    { yRef: 16, dist:  23.75 },
    { yRef: 18, dist:  28.5 },
    { yRef: 20, dist:  35.0 },
    { yRef: 22, dist:  42.3 },
    { yRef: 24, dist:  51.0 },
];

export const timeLookup = [
    { yRef:  0, time:  0.0 },
    { yRef:  2, time:  1.5 },
    { yRef:  4, time:  3.3 },
    { yRef:  6, time:  5.2 },
    { yRef:  8, time:  7.3 },
    { yRef: 10, time:  9.5 },
    { yRef: 12, time:  12.0 },
    { yRef: 14, time:  14.5 },
    { yRef: 16, time:  17.5 },
    { yRef: 18, time:  21.0 },
    { yRef: 20, time:  25.3 },
    { yRef: 22, time:  30.0 },
    { yRef: 24, time:  36.0 },
];

export const fuelLookup = [
    { yRef:  0, fuel:  0.0 },
    { yRef:  4, fuel:  0.7 },
    { yRef:  8, fuel:  1.5 },
    { yRef: 13, fuel:  2.5 },
    { yRef: 16, fuel:  3.1 },
    { yRef: 19, fuel:  3.75 },
    { yRef: 22, fuel:  5.0 },
    { yRef: 24, fuel:  6.0 },
];

// Left-panel lookup: YRef by pressure altitude and temperature.
// Values to be read from the PA-28-151 climb performance chart left Y-axis.
export const yRefLookup = [
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
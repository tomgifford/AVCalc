export const climbDistLookup = [
    { yRef:  0, dist:  0.0 },
    { yRef:  5, dist:  2.0 },
    { yRef: 10, dist:  5.0 },
    { yRef: 15, dist:  7.8 },
    { yRef: 20, dist: 10.5 },
    { yRef: 25, dist: 14.0 },
    { yRef: 30, dist: 17.0 },
    { yRef: 35, dist: 21.5 },
    { yRef: 40, dist: 27.0 },
    { yRef: 45, dist: 34.0 },
    { yRef: 50, dist: 43.0 },
    { yRef: 55, dist: 56.5 },
    { yRef: 60, dist: 77.0 },
];

export const timeLookup = [
    { yRef:  0, time:  0.0 },
    { yRef:  5, time:  2.0 },
    { yRef: 10, time:  4.0 },
    { yRef: 15, time:  6.0 },
    { yRef: 20, time:  8.0 },
    { yRef: 25, time: 10.5 },
    { yRef: 30, time: 13.0 },
    { yRef: 35, time: 16.0 },
    { yRef: 40, time: 19.0 },
    { yRef: 45, time: 24.0 },
    { yRef: 50, time: 30.0 },
    { yRef: 55, time: 39.0 },
    { yRef: 60, time: 50.0 },
];
export const fuelLookup = [
    { yRef:  0, fuel: 0.00 },
    { yRef:  5, fuel: 0.75 },
    { yRef: 10, fuel: 1.1 },
    { yRef: 15, fuel: 1.6 },
    { yRef: 20, fuel: 2.1 },
    { yRef: 25, fuel: 2.7 },
    { yRef: 30, fuel: 3.20 },

    { yRef: 35, fuel: 3.60 },
    { yRef: 40, fuel: 4.1 },
    { yRef: 45, fuel: 4.75 },
    { yRef: 50, fuel: 5.8 },
    { yRef: 55, fuel: 6.8 },
    { yRef: 60, fuel: 8.20 },
];

// Left-panel lookup: YRef by pressure altitude and temperature.
// Values read from the PA-28-161 climb performance chart left Y-axis.
// At T=−40 (left Y-axis), YRef = PA by definition.
export const yRefLookup = [
    { pa:  0, points: [
        { t: -40, yRef:  0 }, { t:  40, yRef:  0 },
    ]},
    { pa:  1000, points: [
        { t: -40, yRef:  4.1 }, { t: -30, yRef:  4.2 }, { t: -20, yRef:  4.4 },
        { t: -10, yRef:  4.6 }, { t:   0, yRef:  4.9 }, { t:  10, yRef:  5.0 },
        { t:  20, yRef:  5.2 }, { t:  30, yRef:  5.8 }, { t:  40, yRef:  6.3 },
    ]},
    { pa:  2000, points: [
        { t: -40, yRef:  8.8 }, { t: -30, yRef:  8.9 }, { t: -20, yRef:  9.1 },
        { t: -10, yRef:  9.4 }, { t:   0, yRef:  9.8 }, { t:  10, yRef: 10.2 },
        { t:  20, yRef: 11.0 }, { t:  30, yRef: 11.8 }, { t:  40, yRef: 13.1 },
    ]},
    { pa:  3000, points: [
        { t: -40, yRef: 12.8 }, { t: -30, yRef: 13.0 }, { t: -20, yRef: 13.4 },
        { t: -10, yRef: 14.0 }, { t:   0, yRef: 14.6 }, { t:  10, yRef: 15.5 },
        { t:  20, yRef: 16.5 }, { t:  30, yRef: 18.2 }, { t:  40, yRef: 20.2 },
    ]},
    { pa:  4000, points: [
        { t: -40, yRef: 16.0 }, { t: -30, yRef: 16.7 }, { t: -20, yRef: 17.6 },
        { t: -10, yRef: 18.4 }, { t:   0, yRef: 19.5 }, { t:  10, yRef: 20.8 },
        { t:  20, yRef: 22.6 }, { t:  30, yRef: 25.0 }, { t:  40, yRef: 28.6 },
    ]},
    { pa:  5000, points: [
        { t: -40, yRef: 19.5 }, { t: -30, yRef: 20.5 }, { t: -20, yRef: 21.5 },
        { t: -10, yRef: 23.0 }, { t:   0, yRef: 24.5 }, { t:  10, yRef: 26.5 },
        { t:  20, yRef: 29.0 }, { t:  30, yRef: 32.1 }, { t:  40, yRef: 36.0 },
    ]},
    { pa:  6000, points: [
        { t: -40, yRef: 22.7 }, { t: -30, yRef: 24.0 }, { t: -20, yRef: 25.6 },
        { t: -10, yRef: 27.5 }, { t:   0, yRef: 29.6 }, { t:  10, yRef: 32.0 },
        { t:  20, yRef: 35.5 }, { t:  30, yRef: 39.6 }, { t:  40, yRef: 44.2 },
    ]},
    { pa:  7000, points: [
        { t: -40, yRef: 26.0 }, { t: -30, yRef: 27.8 }, { t: -20, yRef: 29.8 },
        { t: -10, yRef: 32.1 }, { t:   0, yRef: 35.0 }, { t:  10, yRef: 38.2 },
        { t:  20, yRef: 42.8 }, { t:  30, yRef: 48 }, { t:  40, yRef: 53.2 },
    ]},
    { pa:  8000, points: [
        { t: -40, yRef: 29.8 }, { t: -30, yRef: 32.1 }, { t: -20, yRef: 34.8 },
        { t: -10, yRef: 37.5 }, { t:   0, yRef: 40.5 }, { t:  10, yRef: 44.5 },
        { t:  20, yRef: 50.0 }, { t:  30, yRef: 56.5 }, { t:  35.5, yRef: 60.0 },
    ]},
    { pa:  9000, points: [
        { t: -40, yRef: 33.7 }, { t: -30, yRef: 36.4 }, { t: -20, yRef: 39.6 },
        { t: -10, yRef: 43.0}, { t:   0, yRef: 46.8 }, { t:  10, yRef: 51.4 },
        { t:  20, yRef: 58.0 }, { t:  22.5, yRef: 60.0 },
    ]},
    { pa: 10000, points: [
        { t: -40, yRef: 38.0 }, { t: -30, yRef: 41.0 }, { t: -20, yRef: 44.3 },
        { t: -10, yRef: 48.0 }, { t:   0, yRef: 52.7 }, { t:  10, yRef: 59.0 },
        { t:  11, yRef: 60.0 },
    ]},
    { pa: 11000, points: [
        { t: -40, yRef: 42.5 }, { t: -30, yRef: 46.0 }, { t: -20, yRef: 49.5 },
        { t: -10, yRef: 53.5 }, { t:   0, yRef: 59.0 }, { t:  2, yRef: 60.0 },
    ]},
    { pa: 12000, points: [
        { t: -40, yRef: 46.8 }, { t: -30, yRef: 50.0 }, { t: -20, yRef: 54.3 },
        { t: -10, yRef: 59.3 }, { t:   -9, yRef: 60.0 },
    ]},
];
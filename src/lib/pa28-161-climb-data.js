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
    { yRef:  5, fuel: 0.25 },
    { yRef: 10, fuel: 0.54 },
    { yRef: 15, fuel: 0.86 },
    { yRef: 20, fuel: 1.21 },
    { yRef: 25, fuel: 1.60 },
    { yRef: 30, fuel: 2.13 },
    { yRef: 35, fuel: 3.00 },
    { yRef: 40, fuel: 3.80 },
    { yRef: 45, fuel: 4.75 },
    { yRef: 50, fuel: 6.00 },
    { yRef: 55, fuel: 7.0 },
    { yRef: 60, fuel: 8.00 },
];

// Left-panel lookup: YRef by pressure altitude and temperature.
// Values read from the PA-28-161 climb performance chart left Y-axis.
// At T=−40 (left Y-axis), YRef = PA by definition.
export const yRefLookup = [
    { pa:  1000, points: [
        { t: -40, yRef:  3.9 }, { t: -30, yRef:  4.0 }, { t: -20, yRef:  4.2 },
        { t: -10, yRef:  4.4 }, { t:   0, yRef:  4.8 }, { t:  10, yRef:  5.3 },
        { t:  20, yRef:  5.8 }, { t:  30, yRef:  6.5 }, { t:  40, yRef:  7.2 },
    ]},
    { pa:  2000, points: [
        { t: -40, yRef:  7.8 }, { t: -30, yRef:  8.0 }, { t: -20, yRef:  8.4 },
        { t: -10, yRef:  8.8 }, { t:   0, yRef:  9.6 }, { t:  10, yRef: 10.6 },
        { t:  20, yRef: 11.6 }, { t:  30, yRef: 13.0 }, { t:  40, yRef: 14.4 },
    ]},
    { pa:  3000, points: [
        { t: -40, yRef: 11.7 }, { t: -30, yRef: 12.0 }, { t: -20, yRef: 12.6 },
        { t: -10, yRef: 13.2 }, { t:   0, yRef: 14.4 }, { t:  10, yRef: 15.9 },
        { t:  20, yRef: 17.4 }, { t:  30, yRef: 19.5 }, { t:  40, yRef: 21.6 },
    ]},
    { pa:  4000, points: [
        { t: -40, yRef: 15.6 }, { t: -30, yRef: 16.0 }, { t: -20, yRef: 16.8 },
        { t: -10, yRef: 17.6 }, { t:   0, yRef: 19.2 }, { t:  10, yRef: 21.2 },
        { t:  20, yRef: 23.2 }, { t:  30, yRef: 26.0 }, { t:  40, yRef: 28.8 },
    ]},
    { pa:  5000, points: [
        { t: -40, yRef: 19.5 }, { t: -30, yRef: 20.0 }, { t: -20, yRef: 21.0 },
        { t: -10, yRef: 22.0 }, { t:   0, yRef: 24.0 }, { t:  10, yRef: 26.5 },
        { t:  20, yRef: 29.0 }, { t:  30, yRef: 32.5 }, { t:  40, yRef: 36.0 },
    ]},
    { pa:  6000, points: [
        { t: -40, yRef: 23.4 }, { t: -30, yRef: 24.0 }, { t: -20, yRef: 25.2 },
        { t: -10, yRef: 26.4 }, { t:   0, yRef: 28.8 }, { t:  10, yRef: 31.8 },
        { t:  20, yRef: 34.8 }, { t:  30, yRef: 39.0 }, { t:  40, yRef: 43.2 },
    ]},
    { pa:  7000, points: [
        { t: -40, yRef: 27.3 }, { t: -30, yRef: 28.0 }, { t: -20, yRef: 29.4 },
        { t: -10, yRef: 30.8 }, { t:   0, yRef: 33.6 }, { t:  10, yRef: 37.1 },
        { t:  20, yRef: 40.6 }, { t:  30, yRef: 45.5 }, { t:  40, yRef: 50.4 },
    ]},
    { pa:  8000, points: [
        { t: -40, yRef: 31.2 }, { t: -30, yRef: 32.0 }, { t: -20, yRef: 33.6 },
        { t: -10, yRef: 35.2 }, { t:   0, yRef: 38.4 }, { t:  10, yRef: 42.4 },
        { t:  20, yRef: 46.4 }, { t:  30, yRef: 52.0 }, { t:  40, yRef: 57.6 },
    ]},
    { pa:  9000, points: [
        { t: -40, yRef: 35.1 }, { t: -30, yRef: 36.0 }, { t: -20, yRef: 37.8 },
        { t: -10, yRef: 39.6 }, { t:   0, yRef: 43.2 }, { t:  10, yRef: 47.7 },
        { t:  20, yRef: 52.2 }, { t:  30, yRef: 58.5 }, { t:  40, yRef: 64.8 },
    ]},
    { pa: 10000, points: [
        { t: -40, yRef: 39.0 }, { t: -30, yRef: 40.0 }, { t: -20, yRef: 42.0 },
        { t: -10, yRef: 44.0 }, { t:   0, yRef: 48.0 }, { t:  10, yRef: 53.0 },
        { t:  20, yRef: 58.0 }, { t:  30, yRef: 65.0 }, { t:  40, yRef: 72.0 },
    ]},
    { pa: 11000, points: [
        { t: -40, yRef: 42.9 }, { t: -30, yRef: 44.0 }, { t: -20, yRef: 46.2 },
        { t: -10, yRef: 48.4 }, { t:   0, yRef: 52.8 }, { t:  10, yRef: 58.3 },
        { t:  20, yRef: 63.8 }, { t:  30, yRef: 71.5 }, { t:  40, yRef: 79.2 },
    ]},
    { pa: 12000, points: [
        { t: -40, yRef: 46.8 }, { t: -30, yRef: 48.0 }, { t: -20, yRef: 50.4 },
        { t: -10, yRef: 52.8 }, { t:   0, yRef: 57.6 }, { t:  10, yRef: 63.6 },
        { t:  20, yRef: 69.6 }, { t:  30, yRef: 78.0 }, { t:  40, yRef: 86.4 },
    ]},
];
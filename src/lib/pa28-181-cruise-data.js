export const cruiseYRefLookup = [
    { pa:     0, points: [
        { t:  14.5, yRef:  0 },
        { t:  20, yRef:  1.2 },
        { t:  30, yRef:  3.5 },
        { t:  38, yRef: 5.2 },
    ]},
    { pa:  1000, points: [
        { t:   5, yRef:  0 },
        { t:  38, yRef: 7.4 },
    ]},
    { pa:  2000, points: [
        { t:  -7, yRef:  0 },
        { t:  38, yRef: 10 },
    ]},
    { pa:  3000, points: [
        { t: -17, yRef:  0 },
        { t:  38, yRef: 12.3 },
    ]},
    { pa:  4000, points: [
        { t: -25, yRef:  0 },
        { t:  38, yRef: 14.8 },
    ]},
    { pa:  5000, points: [
        { t: -29, yRef:  1.6 },
        { t:  38, yRef: 17.2 },
    ]},
    { pa:  6000, points: [
        { t: -29, yRef:  4.1 },
        { t:  38, yRef: 19.6 },
    ]},
    { pa:  8000, points: [
        { t: -29, yRef: 9 },
        { t:  38, yRef: 25 },
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

export const cruiseTASLookup = {
    75: [
        { yRef:  0, tas: 111 },
 //       { yRef: 11, tas: 120 },
        { yRef: 16, tas: 125 },
    ],
    65: [
        { yRef:  0, tas: 103 },
//        { yRef: 14, tas: 113 },
        { yRef: 24, tas: 120.5 },
    ],
    55: [
        { yRef:  0, tas:  91.5 },
        { yRef: 28, tas: 109 },
    ],
};

export const cruiseFuelGPH = { 75: 10.0, 65: 8.8, 55: 7.8 };

export const noFairingsTASDeduction = 2.6;
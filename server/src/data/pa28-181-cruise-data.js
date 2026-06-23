export const cruiseYRefLookup = [
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

export const cruiseFuelGPH = { 75: 10.5, 65: 9.0, 55: 7.8 };

export const noFairingsTASDeduction = 2.6;
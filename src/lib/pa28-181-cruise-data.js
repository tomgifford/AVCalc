export const cruiseYRefLookup = [
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

export const cruiseTASLookup = {
    75: [
        { yRef:  0, tas: 111 },
        { yRef: 18, tas: 125 },
    ],
    65: [
        { yRef:  0, tas: 103 },
        { yRef: 14, tas: 113 },
        { yRef: 24, tas: 120.5 },
    ],
    55: [
        { yRef:  0, tas:  91.5 },
        { yRef: 28, tas: 109 },
    ],
};

export const cruiseMaxTAS = [
    { yRef:  0, tas: 127.7 },   // max curve lower anchor
    { yRef: 10, tas: 127.3   },  
    { yRef: 12, tas: 127   },  
    { yRef: 16, tas: 126   },  
    { yRef: 18, tas: 125   },   // 75% intersection
    { yRef: 20, tas: 123.8   },  
    { yRef: 22, tas: 122.5 },   
    { yRef: 24, tas: 120.5 },   // 65% intersection
    { yRef: 26.1, tas: 117.3 },   
    { yRef: 27.2, tas: 115.1 },
    { yRef: 28, tas: 113   },   // max curve upper limit
];

export const cruiseFuelGPH = { 75: 10.5, 65: 9.0, 55: 7.8 };

export const noFairingsTASDeduction = 2.6;
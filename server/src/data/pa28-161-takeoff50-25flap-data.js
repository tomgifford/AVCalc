// PA-28-161 Takeoff Performance — Distance Over 50 ft Obstacle (Figure 5-10)
// 25° Flaps, Paved Level Dry Runway, Full Power Before Brake Release
//
// DRAFT — data values are placeholder copies from the 0° flap chart (Figure 5-9).
// Validate and replace against the actual chart using the trace overlay at
// app/test/pa28-161-takeoff50-25flap-trace-overlay.html before using in flight planning.
//
// Three-pane chart pipeline:
//   pane 1 (left):   OAT × PA              → yRef1  (chart reference scale 0–80)
//   pane 2 (middle): yRef1 × Weight        → yRef2  (chart reference scale 0–80)
//   pane 3 (right):  yRef2 × Wind (HW/TW) → distance over 50 ft (ft)

// yRef1Lookup — left pane: OAT (°C) × pressure altitude (ft) → yRef1 (0–80 scale)
export const yRef1Lookup = [
    { pa: 0,    points: [{ t: -12, yRef: 10 }, { t: 10, yRef: 15.1 }, { t: 20, yRef: 17.7 }, { t: 40, yRef: 22.7 }] },
    { pa: 1000, points: [{ t: -22, yRef: 10 }, { t: 0, yRef: 15.2 }, { t: 0, yRef: 15.2 }, /*{ t: 20, yRef: 20.2 }, */{ t: 40, yRef: 25.5 }] },
    { pa: 2000, points: [{ t: -32.8, yRef: 10 }, { t: -20, yRef: 12.8 }, { t: 0, yRef: 17.8 }, { t: 20, yRef: 22.8 }, { t: 40, yRef: 28.3 }] },
    { pa: 3000, points: [{ t: -40, yRef: 10.8 }, { t: -20, yRef: 15.5 }, { t: 0, yRef: 20.8 }, { t: 20, yRef: 26.2 }, { t: 40, yRef: 32 }] },
    { pa: 4000, points: [{ t: -40, yRef: 12.7 }, { t: -20, yRef: 17.8 }, { t: 0, yRef: 23.2 }, { t: 20, yRef: 29 }, { t: 40, yRef: 35 }] },
    { pa: 5000, points: [{ t: -40, yRef: 15 }, { t: -20, yRef: 20.5 }, { t: 0, yRef: 26.6 }, { t: 20, yRef: 33 }, { t: 40, yRef: 40 }] },
    { pa: 6000, points: [{ t: -40, yRef: 17.5 }, { t: -20, yRef: 23.5 }, { t: 0, yRef: 30.3 }, { t: 20, yRef: 37.3 }, { t: 27.7, yRef: 40 }] },
    { pa: 7000, points: [{ t: -40, yRef: 21 }, { t: -20, yRef: 27.3 }, { t: -10, yRef: 30.6 }, { t: 0, yRef: 34 }, { t: 17.5, yRef: 40 }] },
];

// weightLookup — middle pane: yRef1 × weight (lbs) → yRef2 (0–80 scale)
// Weight axis runs RIGHT (1600 lbs) to LEFT (2440 lbs).
export const weightLookup = [
    { yRef1:  16.4, points: [{ weight: 1600, yRef2:  7 }, { weight: 1700, yRef2:  8 }, { weight: 2000, yRef2:  11 }, { weight: 2440, yRef2:  16.4 }]},
    { yRef1:  22, points: [{ weight: 1600, yRef2:  9.4 }, { weight: 1700, yRef2: 10.8 }, { weight: 1800, yRef2: 12 }, { weight: 2000, yRef2: 15 }, { weight: 2200, yRef2: 17.5 }, { weight: 2440, yRef2: 22 }] },
    { yRef1:  27.3, points: [{ weight: 1600, yRef2: 12 }, { weight: 1700, yRef2: 13.6 },{ weight: 1800, yRef2: 15.3 }, { weight: 2000, yRef2: 19 }, { weight: 2200, yRef2: 22.3 }, { weight: 2440, yRef2: 27.3 }] },
    { yRef1:  33.2, points: [{ weight: 1600, yRef2: 14.8 }, { weight: 1700, yRef2: 16.8 }, { weight: 2000, yRef2: 22.5 }, { weight: 2300, yRef2: 29.3 }, { weight: 2440, yRef2: 33.2 }] },
    { yRef1:  38.9, points: [{ weight: 1600, yRef2: 17.2 }, { weight: 1700, yRef2: 19.4 }, { weight: 1800, yRef2: 21.6 }, { weight: 2000, yRef2: 26 }, { weight: 2300, yRef2: 34 }, { weight: 2440, yRef2: 38.9 }] },
];

// headwindLookup — right pane, headwind section:
// yRef2 × windKts (0–15) → takeoff distance over 50 ft (ft)
export const headwindLookup = [
//    { yRef2: 5, points: [{ windKts:  0, dist:  500 },/* { windKts:  5, dist:  360 }, { windKts: 10, dist:  324 }, */{ windKts: 15, dist:  300 }] },
    { yRef2: 10, points: [{ windKts:  0, dist:  1000 },/* { windKts:  5, dist:  790 }, { windKts: 10, dist:  711 }, */{ windKts: 15, dist:  740 }] },
    { yRef2: 15, points: [{ windKts:  0, dist: 1500 }, { windKts:  15, dist: 1180 }, ]},
    { yRef2: 20, points: [{ windKts:  0, dist: 2000 }, { windKts:  15, dist: 1640 }, ] },
    { yRef2: 25, points: [{ windKts:  0, dist: 2500 }, { windKts: 15, dist: 1990 }] },
    { yRef2: 30, points: [{ windKts:  0, dist: 3000 }, { windKts:  15, dist: 2400 }], },
    { yRef2: 35, points: [{ windKts:  0, dist: 3500 }, { windKts:  15, dist: 2820 }], },
    { yRef2: 40, points: [{ windKts:  0, dist: 4000 }, { windKts:  15, dist: 3300 }], },
];

// tailwindLookup — right pane, tailwind section:
// yRef2 × windKts (0–15) → takeoff distance over 50 ft (ft)
export const tailwindLookup = [
    { yRef2: 5, points: [{ windKts:  0, dist:  500 }, { windKts:  5, dist:  650 }] },
    { yRef2: 10, points: [{ windKts:  0, dist:  1000 }, { windKts:  5, dist:  1200 }] },
    { yRef2: 15, points: [{ windKts:  0, dist:  1510 }, { windKts:  5, dist:  1800 }] },
    { yRef2: 20, points: [{ windKts:  0, dist:  2000 }, { windKts:  5, dist:  2400 }] },
    { yRef2: 25, points: [{ windKts:  0, dist:  2500 }, { windKts:  5, dist:  3050 }] },
    { yRef2: 30, points: [{ windKts:  0, dist:  3000 }, { windKts:  5, dist:  3640 }] },
    { yRef2: 35, points: [{ windKts:  0, dist:  3500 }, { windKts:  3.6, dist:  4000 }] },
//    { yRef2: 40, points: [{ windKts:  0, dist:  4000 }, { windKts:  3.4, dist:  4500 }] },
];

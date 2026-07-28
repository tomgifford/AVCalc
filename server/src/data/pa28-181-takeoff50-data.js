// PA-28-181 Takeoff Performance — Distance Over 50 ft Obstacle
// 0° Flaps, Paved Level Dry Runway, Full Power Before Brake Release
//
// DRAFT — data values are placeholder copies from the PA-28-161 (Figure 5-9).
// Validate and replace against the actual PA-28-181 POH chart using the trace
// overlay at app/test/pa28-181-takeoff50-trace-overlay.html before use.
//
// Three-pane chart pipeline:
//   pane 1 (left):   OAT × PA              → yRef1  (chart reference scale 0–80)
//   pane 2 (middle): yRef1 × Weight        → yRef2  (chart reference scale 0–80)
//   pane 3 (right):  yRef2 × Wind (HW/TW) → distance over 50 ft (ft)

// yRef1Lookup — left pane: OAT (°C) × pressure altitude (ft) → yRef1 (0–80 scale)
export const yRef1Lookup = [
    { pa: 0,    points: [{ t: 7, yRef: 0 }, { t: 26.7, yRef: 6 }] },
    { pa: 2000, points: [{ t: -12.2, yRef: 0 }, { t: 10, yRef: 7.2 }, { t: 26.7, yRef: 13 }] },
    { pa: 4000, points: [{ t: -34, yRef: 0 }, { t: -20, yRef: 4 }, { t: 0, yRef: 10.8 }, { t: 10, yRef: 15.1 }, { t: 26.7, yRef: 22.3 }] },
    { pa: 6000, points: [{ t: -40, yRef: 4}, { t: -20, yRef: 10.8 }, { t: -10, yRef: 15 }, { t: 0, yRef: 19.5 }, { t: 15, yRef: 28 }] },
    { pa: 7000, points: [{ t: -40, yRef: 7 }, { t: -20, yRef: 14.5 }, { t: -10, yRef: 19.4 }, { t: 0, yRef: 25 }, { t: 4, yRef: 28 }] },
];

// weightLookup — middle pane: yRef1 × weight (lbs) → yRef2 (0–80 scale)
// Weight axis runs RIGHT (1600 lbs) to LEFT (2440 lbs).
export const weightLookup = [
    { yRef1:  2.6, points: [{ weight: 2410, yRef2:  0 }, { weight: 2550, yRef2:  2.6 }]},
    { yRef1:  5.1, points: [{ weight: 2300, yRef2:  0 },  { weight: 2550, yRef2: 5.2 }] },
    { yRef1:  7.9, points: [{ weight: 2185, yRef2: 0 }, { weight: 2300, yRef2: 2.2 }, { weight: 2550, yRef2: 7.9}] },
    { yRef1:  10.6, points: [{ weight: 2095, yRef2: 0 }, { weight: 2300, yRef2: 4.6 }, { weight: 2550, yRef2: 10.6 }] },
    { yRef1:  13.5, points: [{ weight: 2050, yRef2: 0.9 }, { weight: 2300, yRef2: 6.7 }, { weight: 2450, yRef2: 10.5 }, { weight: 2550, yRef2: 13.5 }] },
    { yRef1:  17.1, points: [{ weight: 2050, yRef2: 3 }, { weight: 2300, yRef2: 9.5 },  { weight: 2450, yRef2: 14 }, { weight: 2550, yRef2: 17.1 }] },
    { yRef1:  21, points: [{ weight: 2050, yRef2: 5 },{ weight: 2200, yRef2: 9.4 },  { weight: 2300, yRef2: 12.4 }, { weight: 2450, yRef2: 17.3 }, { weight: 2550, yRef2: 21 }] },
    { yRef1:  24.5, points: [{ weight: 2050, yRef2: 7.1 }, { weight: 2200, yRef2: 11.75 }, { weight: 2300, yRef2: 15 }, { weight: 2450, yRef2: 20.4 }, { weight: 2550, yRef2: 24.5 }] },
    { yRef1:  28, points: [{ weight: 2050, yRef2: 9 }, { weight: 2200, yRef2: 14.2 }, { weight: 2300, yRef2: 17.8 }, { weight: 2450, yRef2: 23.9 }, { weight: 2550, yRef2: 28 }] },
];

// headwindLookup — right pane, headwind section:
// yRef2 × windKts (0–15) → takeoff distance over 50 ft (ft)
export const headwindLookup = [
    { yRef2:  2, points: [{ windKts:  0, dist:  1800 }, { windKts: 7.7, dist:  1600 }] },
    { yRef2: 6, points: [{ windKts:  0, dist:  2200 }, { windKts: 15, dist:  1790 }] },
    { yRef2: 10, points: [{ windKts:  0, dist: 2600 }, { windKts: 15, dist: 2100 }] },
    { yRef2: 14, points: [{ windKts:  0, dist: 3000 }, { windKts: 15, dist: 2450 }] },
    { yRef2: 18, points: [{ windKts:  0, dist: 3400 }, { windKts: 15, dist: 2790 }] },
    { yRef2: 22, points: [{ windKts:  0, dist: 3800 }, { windKts: 15, dist: 3150 }] },
    { yRef2: 28, points: [{ windKts:  0, dist: 4400 }, { windKts: 15, dist: 3650 }] },
];

// tailwindLookup — right pane, tailwind section:
// yRef2 × windKts (0–15) → takeoff distance over 50 ft (ft)
export const tailwindLookup = [
    { yRef2:  2, points: [{ windKts:  0, dist:  1800 }, { windKts: 5, dist:  2200 }] },
    { yRef2: 6, points: [{ windKts:  0, dist:  2200 }, { windKts: 5, dist:  2650 }] },
    { yRef2: 10, points: [{ windKts:  0, dist: 2600 }, { windKts: 5, dist: 3110 }] },
    { yRef2: 14, points: [{ windKts:  0, dist: 3000 }, { windKts: 5, dist: 3600 }] },
    { yRef2: 18, points: [{ windKts:  0, dist: 3400 }, { windKts: 5, dist: 4040 }] },
    { yRef2: 22, points: [{ windKts:  0, dist: 3800 }, { windKts: 4.5, dist: 4400 }] },
];

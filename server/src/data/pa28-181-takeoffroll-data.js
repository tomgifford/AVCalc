// PA-28-181 Takeoff Performance — Ground Roll
// 0° Flaps, Paved Level Dry Runway, Full Power Before Brake Release
//
// DRAFT — data values are placeholder copies from the PA-28-161 (Figure 5-7).
// Validate and replace against the actual PA-28-181 POH chart using the trace
// overlay at app/test/pa28-181-takeoffroll-trace-overlay.html before use.
//
// Three-pane chart pipeline:
//   pane 1 (left):   OAT × PA              → yRef1  (chart reference scale 0–80)
//   pane 2 (middle): yRef1 × Weight        → yRef2  (chart reference scale 0–80)
//   pane 3 (right):  yRef2 × Wind (HW/TW) → ground roll distance (ft)

// yRef1Lookup — left pane: OAT (°C) × pressure altitude (ft) → yRef1 (0–80 scale)
export const yRef1Lookup = [
    { pa: 0,    points: [{ t: 10, yRef:  5 }, /*{ t: 0, yRef: 16.8 }, { t: 20, yRef: 24.5 }, */{ t: 37.8, yRef: 9.8 }] },
    { pa: 1000, points: [{ t: 0, yRef: 5 }, /*{ t: -20, yRef: 14 }, { t: 0, yRef: 21.3 }, { t: 20, yRef: 29 }, */{ t: 37.8, yRef: 11.8 }] },
    { pa: 2000, points: [{ t: -11, yRef: 5 },/* { t: -20, yRef: 18.4 }, { t: 0, yRef: 25.5 }, { t: 20, yRef: 33 },*/ { t: 37.8, yRef: 13.8 }] },
    { pa: 3000, points: [{ t: -20, yRef: 5 },/* { t: -20, yRef: 23 }, { t: 0, yRef: 29.8 }, { t: 20, yRef: 37 }, */ { t: 37.8, yRef: 15.8 }] },
    { pa: 4000, points: [{ t: -29, yRef: 5 },/* { t: -20, yRef: 27 }, */{ t: 0, yRef: 10.3 }, /*{ t: 20, yRef: 41.3 },*/ { t: 37.8, yRef: 17.8 }] },
    { pa: 5000, points: [{ t: -39, yRef: 5 }, /*{ t: -20, yRef: 31.4 },*/ { t: 0, yRef: 12.5 },/* { t: 20, yRef: 45.5 }, */{ t: 37, yRef: 20 }] },
    { pa: 6000, points: [{ t: -40, yRef: 6.6 }, { t: 24, yRef: 20 }] },
    { pa: 7000, points: [{ t: -40, yRef: 8.4 }, { t: -20, yRef: 12.5 }, /*{ t: 0, yRef: 45.9 }, */{ t: 14.5, yRef: 20 }] },

];

// weightLookup — middle pane: yRef1 × weight (lbs) → yRef2 (0–80 scale)
// Weight axis runs RIGHT (1700 lbs) to LEFT (2440 lbs).
export const weightLookup = [
    { yRef1: 5.85,   points: [{ weight: 2050, yRef2:  1.9 }, { weight: 2350, yRef2: 4.2 }, { weight: 2550, yRef2: 5.85 }] },
    { yRef1: 8,   points: [{ weight: 2050, yRef2: 3.2 }, { weight: 2350, yRef2: 6 }, { weight: 2550, yRef2: 8 }] },
    { yRef1: 9.9, points: [{ weight: 2050, yRef2: 4.3 }, { weight: 2350, yRef2: 7.5 }, { weight: 2550, yRef2: 9.9 }] },
    { yRef1: 12,   points: [{ weight: 2050, yRef2: 5.7 }, { weight: 2350, yRef2: 9.2 }, { weight: 2550, yRef2: 12 }] },
    { yRef1: 14,   points: [{ weight: 2050, yRef2: 6.8 }, { weight: 2350, yRef2: 10.9 }, { weight: 2550, yRef2: 14 }] },
    { yRef1: 16,   points: [{ weight: 2050, yRef2: 8.1 }, { weight: 2350, yRef2: 12.7 }, { weight: 2450, yRef2: 14.3 }, { weight: 2550, yRef2: 16 }] },
    { yRef1: 18,   points: [{ weight: 2050, yRef2: 9.4 }, { weight: 2350, yRef2: 14.3 }, { weight: 2450, yRef2: 16 }, { weight: 2550, yRef2: 18 }] },
    { yRef1: 16,   points: [{ weight: 2050, yRef2: 10.4 }, { weight: 2250, yRef2: 14.1 }, { weight: 2350, yRef2: 16 }, { weight: 2550, yRef2: 20 }] },
];

// headwindLookup — right pane, headwind section:
// yRef2 × windKts (0–15) → ground roll distance (ft)
export const headwindLookup = [
    { yRef2:  2,    points: [{ windKts:  0, dist:  600 }, { windKts: 15, dist:  400 }] },
    { yRef2:  4,    points: [{ windKts:  0, dist:  800 }, { windKts: 15, dist:  560 }] },
    { yRef2: 6,    points: [{ windKts:  0, dist:  1000 }, { windKts: 15, dist:  750 }] },
    { yRef2: 8,    points: [{ windKts:  0, dist:  1200 }, { windKts: 15, dist:  910 }] },
    { yRef2: 9.9,  points: [{ windKts:  0, dist:  1390 }, { windKts: 15, dist:  1070 }] },
    { yRef2: 12,    points: [{ windKts:  0, dist:  1600 }, { windKts: 15, dist:  1240 }] },
    { yRef2: 13.9,  points: [{ windKts:  0, dist:  1790 }, { windKts: 15, dist:  1380 }] },
    { yRef2: 15.9,    points: [{ windKts:  0, dist:  1990 }, { windKts: 15, dist:  1520 }] },
    { yRef2: 17.8,    points: [{ windKts:  0, dist:  2180 }, { windKts: 15, dist:  1680 }] },
    { yRef2: 19.8,    points: [{ windKts:  0, dist:  2380 }, { windKts: 15, dist:  1850 }] },
];

// tailwindLookup — right pane, tailwind section:
// yRef2 × windKts (0–15) → ground roll distance (ft)
export const tailwindLookup = [
    { yRef2:  2,    points: [{ windKts:  0, dist:  600 }, { windKts: 5, dist:  775 }] },
    { yRef2:  4,    points: [{ windKts:  0, dist:  800 }, { windKts: 5, dist:  1010 }] },
    { yRef2:  6,    points: [{ windKts:  0, dist:  1000 }, { windKts: 5, dist:  1280 }] },
    { yRef2:  8,    points: [{ windKts:  0, dist:  1200 }, { windKts: 5, dist:  1510 }] },
    { yRef2:  9.9,  points: [{ windKts:  0, dist:  1390 }, { windKts: 5, dist:  1750 }] },
    { yRef2:  12,   points: [{ windKts:  0, dist:  1600 }, { windKts: 5, dist:  2000 }] },
];

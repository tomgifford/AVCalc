// PA-28-161 Takeoff Performance — Distance Over 50 ft Obstacle (Figure 5-9)
// 0° Flaps, Paved Level Dry Runway, Full Power Before Brake Release
//
// DRAFT — data values are placeholder estimates. Validate against the actual
// chart using the trace overlay at app/test/pa28-161-takeoff50-trace-overlay.html
// before using in flight planning.
//
// Three-pane chart pipeline:
//   pane 1 (left):   OAT × PA              → yRef1  (chart reference scale 0–80)
//   pane 2 (middle): yRef1 × Weight        → yRef2  (chart reference scale 0–80)
//   pane 3 (right):  yRef2 × Wind (HW/TW) → distance over 50 ft (ft)
//
// POH worked example (Figure 5-9):
//   PA 1500 ft, OAT 27 °C, Weight 2316 lbs, 15 kts headwind → 2100 ft

// yRef1Lookup — left pane: OAT (°C) × pressure altitude (ft) → yRef1 (0–80 scale)
export const yRef1Lookup = [
    { pa: 0,    points: [{ t: -6, yRef: 15 }, { t: 40, yRef: 26.5 }] },
    { pa: 1000, points: [{ t: -16, yRef: 15 },/* { t: -20, yRef: 22 }, { t: 0, yRef: 28 }, */{ t: 20, yRef: 24.5 }, { t: 40, yRef: 30.5 }] },
    { pa: 2000, points: [{ t: -28, yRef: 15 },/* { t: -20, yRef: 22 }, */{ t: 0, yRef: 22 }, { t: 20, yRef: 27.5 }, { t: 40, yRef: 33.5 }] },
    { pa: 3000, points: [{ t: -40, yRef: 15 },/* { t: -20, yRef: 32 }, { t: 0, yRef: 25 }, */{ t: 20, yRef: 30.8 }, { t: 40, yRef: 37.3 }] },
    { pa: 4000, points: [{ t: -40, yRef: 17.5 },/* { t: -20, yRef: 32 }, */{ t: 0, yRef: 28.7 }, { t: 20, yRef: 35 }, { t: 40, yRef: 42 }] },
    { pa: 5000, points: [{ t: -40, yRef: 20 },/* { t: -20, yRef: 32 }, */{ t: 0, yRef: 32.5 }, { t: 20, yRef: 38.8 }, { t: 36, yRef: 45 }] },
    { pa: 6000, points: [{ t: -40, yRef: 23 },/* { t: -20, yRef: 43 }, */{ t: 0, yRef: 36.2 }, /*{ t: 20, yRef: 62 }, */{ t: 24, yRef: 45 }] },
    { pa: 7000, points: [{ t: -40, yRef: 26 }, { t: -10, yRef: 36.9 }, /*{ t: 0, yRef: 67 }, { t: 20, yRef: 78 }, */{ t: 11, yRef: 44.8 }] },
];

// weightLookup — middle pane: yRef1 × weight (lbs) → yRef2 (0–80 scale)
// Weight axis runs RIGHT (1600 lbs) to LEFT (2440 lbs).
export const weightLookup = [
    { yRef1:  20, points: [{ weight: 1600, yRef2:  6.5 }, { weight: 1700, yRef2:  7.5 }, { weight: 2000, yRef2:  11.8 }, { weight: 2440, yRef2:  20 }]},
    { yRef1:  26, points: [{ weight: 1600, yRef2:  8.8 }, { weight: 1700, yRef2: 10.2 }, { weight: 1800, yRef2: 11.8 }, { weight: 2000, yRef2: 15.7 }, { weight: 2200, yRef2: 20.2 }, { weight: 2440, yRef2: 26 }] },
    { yRef1:  32, points: [{ weight: 1600, yRef2: 11.2 }, { weight: 1700, yRef2: 12.7 },{ weight: 1800, yRef2: 14.6 }, { weight: 2000, yRef2: 19.5 }, { weight: 2200, yRef2: 25 }, { weight: 2440, yRef2: 32 }] },
    { yRef1:  37, points: [{ weight: 1600, yRef2: 13.4 }, { weight: 1700, yRef2: 15.9 }, { weight: 2000, yRef2: 24.2 }, { weight: 2200, yRef2: 30.5 }, { weight: 2440, yRef2: 38.2 }] },
    { yRef1:  44.4, points: [{ weight: 1600, yRef2: 16.1 }, { weight: 1700, yRef2: 18.7 }, { weight: 1800, yRef2: 21.6 }, { weight: 2000, yRef2: 28.1 }, { weight: 2200, yRef2: 35.3 }, { weight: 2440, yRef2: 44.4 }] },
];

// headwindLookup — right pane, headwind section:
// yRef2 × windKts (0–15) → takeoff distance over 50 ft (ft)
export const headwindLookup = [
    { yRef2: 5, points: [{ windKts:  0, dist:  500 },/* { windKts:  5, dist:  360 }, { windKts: 10, dist:  324 }, */{ windKts: 15, dist:  300 }] },
    { yRef2: 10, points: [{ windKts:  0, dist:  1000 },/* { windKts:  5, dist:  790 }, { windKts: 10, dist:  711 }, */{ windKts: 15, dist:  790 }] },
    { yRef2: 15, points: [{ windKts:  0, dist: 1500 }, { windKts:  15, dist: 1180 }, ]}, 
    { yRef2: 20, points: [{ windKts:  0, dist: 2000 }, { windKts:  15, dist: 1640 }, ] },
    { yRef2: 25, points: [{ windKts:  0, dist: 2500 }, { windKts: 15, dist: 2050 }] },
    { yRef2: 30, points: [{ windKts:  0, dist: 3000 }, { windKts:  15, dist: 2450 }], },
    { yRef2: 35, points: [{ windKts:  0, dist: 3500 }, { windKts:  15, dist: 2840 }], },
    { yRef2: 40, points: [{ windKts:  0, dist: 4000 }, { windKts:  15, dist: 3300 }], },
];

// tailwindLookup — right pane, tailwind section:
// yRef2 × windKts (0–15) → takeoff distance over 50 ft (ft)
export const tailwindLookup = [
    { yRef2: 5, points: [{ windKts:  0, dist:  500 }, { windKts:  5, dist:  700 }] },
    { yRef2: 10, points: [{ windKts:  0, dist:  1000 }, { windKts:  5, dist:  1250 }] },
    { yRef2: 15, points: [{ windKts:  0, dist:  1510 }, { windKts:  5, dist:  1890 }] },
    { yRef2: 20, points: [{ windKts:  0, dist:  2000 }, { windKts:  5, dist:  2380 }] },
    { yRef2: 25, points: [{ windKts:  0, dist:  2500 }, { windKts:  5, dist:  2950 }] },
    { yRef2: 30, points: [{ windKts:  0, dist:  3000 }, { windKts:  5, dist:  3580 }] },
    { yRef2: 35, points: [{ windKts:  0, dist:  3500 }, { windKts:  5, dist:  4230 }] },
    { yRef2: 40, points: [{ windKts:  0, dist:  4000 }, { windKts:  3.4, dist:  4500 }] },
];

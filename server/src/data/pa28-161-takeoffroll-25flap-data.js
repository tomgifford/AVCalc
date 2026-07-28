// PA-28-161 Takeoff Performance — Ground Roll (Figure 5-8)
// 25° Flaps, Paved Level Dry Runway, Full Power Before Brake Release
//
// DRAFT — data values are placeholder copies from the 0° flap chart (Figure 5-7).
// Validate and replace against the actual chart using the trace overlay at
// app/test/pa28-161-takeoffroll25flap-trace-overlay.html before using in flight planning.
//
// Three-pane chart pipeline:
//   pane 1 (left):   OAT × PA              → yRef1  (chart reference scale 0–80)
//   pane 2 (middle): yRef1 × Weight        → yRef2  (chart reference scale 0–80)
//   pane 3 (right):  yRef2 × Wind (HW/TW) → ground roll distance (ft)

// yRef1Lookup — left pane: OAT (°C) × pressure altitude (ft) → yRef1 (0–80 scale)
export const yRef1Lookup = [
    { pa: 0,    points: [{ t: 10, yRef:  19.5 }, /*{ t: -20, yRef: 11 }, { t: 0, yRef: 16.8 }, { t: 20, yRef: 24.5 }, */{ t: 40, yRef: 28 }] },
    { pa: 1000, points: [{ t: 0, yRef: 20 }, /*{ t: -20, yRef: 14 }, { t: 0, yRef: 21.3 }, { t: 20, yRef: 29 }, */{ t: 40, yRef: 32 }] },
    { pa: 2000, points: [{ t: -14, yRef: 20 }, /*{ t: -20, yRef: 18.4 }, { t: 0, yRef: 25.5 }, { t: 20, yRef: 33 }, */ { t: 40, yRef: 35 }] },
    { pa: 3000, points: [{ t: -26, yRef: 20 }, { t: -20, yRef: 21.8 }, { t: 0, yRef: 28 }, { t: 20, yRef: 33.8 }, { t: 40, yRef: 39 }] },
    { pa: 4000, points: [{ t: -40, yRef: 19 }, /*{ t: -20, yRef: 27 }, */{ t: 0, yRef: 31.4 }, { t: 20, yRef: 37 },  { t: 40, yRef: 42 }] },
    { pa: 5000, points: [{ t: -40, yRef: 23 }, /* { t: -20, yRef: 31.4 }, */{ t: 0, yRef: 34.9 }, /*{ t: 20, yRef: 45.5 }, */{ t: 40, yRef: 47 }] },
    { pa: 6000, points: [{ t: -40, yRef: 26.5 },  { t: -20, yRef: 32.3 }, { t: 0, yRef: 38.5 }, /*{ t: 20, yRef: 45.5 }, */{ t: 40, yRef: 51.5 }] },
    { pa: 7000, points: [{ t: -40, yRef: 30 }, { t: -20, yRef: 36.1 }, { t: 0, yRef: 42.5 }, { t: 20, yRef: 49 }, { t: 28, yRef: 52 }] },
//    { pa: 7000, points: [{ t: -40, yRef: 33.5 }, { t: -20, yRef: 39 }, { t: 0, yRef: 45.9 }, { t: 17.6, yRef: 52 }] },
];

// weightLookup — middle pane: yRef1 × weight (lbs) → yRef2 (0–80 scale)
// Weight axis runs RIGHT (1700 lbs) to LEFT (2440 lbs).
export const weightLookup = [
    { yRef1: 21, points: [{ weight: 1600, yRef2:  10 }, { weight: 1700, yRef2: 11 }, { weight: 1800, yRef2: 12 }, { weight: 2000, yRef2: 14.5 }, { weight: 2200, yRef2: 17 }, { weight: 2440, yRef2: 21 }] },
    { yRef1: 28.5, points: [{ weight: 1600, yRef2:  13.8 }, { weight: 1700, yRef2: 15 }, { weight: 1800, yRef2: 16.8 }, { weight: 2000, yRef2: 20 }, { weight: 2200, yRef2: 23.8 }, { weight: 2440, yRef2: 28.5 }] },
    { yRef1: 37, points: [{ weight: 1600, yRef2: 17 }, { weight: 1700, yRef2: 18.9 }, { weight: 1800, yRef2: 21 }, { weight: 2000, yRef2: 25.4 }, { weight: 2200, yRef2: 30.4 }, { weight: 2440, yRef2: 37 }] },
    { yRef1: 45, points: [{ weight: 1600, yRef2: 20.5 }, { weight: 1700, yRef2: 22.6 }, { weight: 1800, yRef2: 25 }, { weight: 2000, yRef2: 30.9 }, { weight: 2200, yRef2: 37.1 }, { weight: 2440, yRef2: 45 }] },
    { yRef1: 52, points: [{ weight: 1600, yRef2: 24.1 }, { weight: 1700, yRef2: 26.7 }, { weight: 1800, yRef2: 29.4 }, { weight: 2000, yRef2: 36 }, { weight: 2200, yRef2: 43.5 }, { weight: 2420, yRef2: 52 }] },
];

// headwindLookup — right pane, headwind section:
// yRef2 × windKts (0–15) → ground roll distance (ft)
export const headwindLookup = [
//    { yRef2:  8, points: [{ windKts:  0, dist:  400 }, { windKts: 15, dist:  280 }] },
    { yRef2: 12, points: [{ windKts:  0, dist:  600 }, { windKts: 15, dist:  450 }] },
    { yRef2: 16, points: [{ windKts:  0, dist:  800 }, { windKts: 15, dist:  600 }] },
    { yRef2: 20, points: [{ windKts:  0, dist:  1000 }, { windKts: 15, dist:  750 }] },
    { yRef2: 23.8, points: [{ windKts:  0, dist:  1180 }, { windKts: 15, dist:  925 }] },
    { yRef2: 28, points: [{ windKts:  0, dist:  1400 }, { windKts: 15, dist:  1100 }] },
    { yRef2: 31.8, points: [{ windKts:  0, dist:  1600 }, { windKts: 15, dist:  1240 }] },
    { yRef2: 36, points: [{ windKts:  0, dist:  1800 }, { windKts: 15, dist:  1430 }] },
    { yRef2: 40, points: [{ windKts:  0, dist:  2000 }, { windKts: 15, dist:  1580 }] },
    { yRef2: 44, points: [{ windKts:  0, dist:  2200 }, { windKts: 15, dist:  1770 }] },
    { yRef2: 48, points: [{ windKts:  0, dist:  2400 }, { windKts: 15, dist:  1950 }] },
];

// tailwindLookup — right pane, tailwind section:
// yRef2 × windKts (0–15) → ground roll distance (ft)
export const tailwindLookup = [
    { yRef2: 12, points: [{ windKts:  0, dist:  600 }, { windKts: 5, dist:  775 }] },
    { yRef2: 16, points: [{ windKts:  0, dist:  800 }, { windKts: 5, dist:  995 }] },
    { yRef2: 20, points: [{ windKts:  0, dist:  1000 }, { windKts: 5, dist:  1300 }] },
    { yRef2: 23.8, points: [{ windKts:  0, dist:  1180 }, { windKts: 5, dist:  1500 }] },
    { yRef2: 28, points: [{ windKts:  0, dist:  1400 }, { windKts: 5, dist:  1750 }] },
    { yRef2: 31.8, points: [{ windKts:  0, dist:  1600 }, { windKts: 5, dist:  2000 }] },
    { yRef2: 36, points: [{ windKts:  0, dist:  1800 }, { windKts: 5, dist:  2220 }] },
    { yRef2: 40, points: [{ windKts:  0, dist:  2000 }, { windKts: 5, dist:  2490 }] },
    { yRef2: 44, points: [{ windKts:  0, dist:  2200 }, { windKts: 4.2, dist:  2600 }] },
];

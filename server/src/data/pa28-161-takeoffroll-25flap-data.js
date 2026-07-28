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
    { pa: 0,    points: [{ t: -13, yRef:  12 }, /*{ t: -20, yRef: 11 },*/ { t: 0, yRef: 16.8 }, { t: 20, yRef: 24.5 }, { t: 40, yRef: 32.7 }] },
    { pa: 1000, points: [{ t: -25.5, yRef: 12 }, { t: -20, yRef: 14 }, { t: 0, yRef: 21.3 }, { t: 20, yRef: 29 }, { t: 40, yRef: 36.8 }] },
    { pa: 2000, points: [{ t: -40, yRef: 12 }, { t: -20, yRef: 18.4 }, { t: 0, yRef: 25.5 }, { t: 20, yRef: 33 }, { t: 40, yRef: 40.7 }] },
    { pa: 3000, points: [{ t: -40, yRef: 17 }, { t: -20, yRef: 23 }, { t: 0, yRef: 29.8 }, { t: 20, yRef: 37 }, { t: 40, yRef: 44.5 }] },
    { pa: 4000, points: [{ t: -40, yRef: 20.8 }, { t: -20, yRef: 27 }, { t: 0, yRef: 34 }, { t: 20, yRef: 41.3 }, { t: 40, yRef: 49 }] },
    { pa: 5000, points: [{ t: -40, yRef: 25.5 }, { t: -20, yRef: 31.4 }, { t: 0, yRef: 38.2 }, { t: 20, yRef: 45.5 }, { t: 37.8, yRef: 52 }] },
    { pa: 6000, points: [{ t: -40, yRef: 29 }, { t: -20, yRef: 35.4 }, { t: 0, yRef: 42.3 }, { t: 20, yRef: 49.5 }, { t: 27, yRef: 52 }] },
    { pa: 7000, points: [{ t: -40, yRef: 33.5 }, { t: -20, yRef: 39 }, { t: 0, yRef: 45.9 }, { t: 17.6, yRef: 52 }] },
];

// weightLookup — middle pane: yRef1 × weight (lbs) → yRef2 (0–80 scale)
// Weight axis runs RIGHT (1700 lbs) to LEFT (2440 lbs).
export const weightLookup = [
    { yRef1: 22, points: [{ weight: 1600, yRef2:  9 }, { weight: 1700, yRef2: 9.7 }, { weight: 1800, yRef2: 10.5 }, { weight: 2000, yRef2: 13.2 }, { weight: 2200, yRef2: 17 }, { weight: 2440, yRef2: 22 }] },
    { yRef1: 30, points: [{ weight: 1600, yRef2:  12.2 }, { weight: 1700, yRef2: 13.2 }, { weight: 1800, yRef2: 14.5 }, { weight: 2000, yRef2: 18.5 }, { weight: 2200, yRef2: 23.2 }, { weight: 2440, yRef2: 30 }] },
    { yRef1: 37.8, points: [{ weight: 1600, yRef2: 15.5 }, { weight: 1700, yRef2: 16.8 }, { weight: 1800, yRef2: 18.8 }, { weight: 2000, yRef2: 23.6 }, { weight: 2200, yRef2: 30 }, { weight: 2440, yRef2: 37.8 }] },
    { yRef1: 45, points: [{ weight: 1600, yRef2: 18.1 }, { weight: 1700, yRef2: 20 }, { weight: 1800, yRef2: 22.7 }, { weight: 2000, yRef2: 29 }, { weight: 2200, yRef2: 36 }, { weight: 2440, yRef2: 45 }] },
    { yRef1: 45, points: [{ weight: 1600, yRef2: 20.9 }, { weight: 1700, yRef2: 23.3 }, { weight: 1800, yRef2: 26.5 }, { weight: 2000, yRef2: 34.2 }, { weight: 2200, yRef2: 42.8 }, { weight: 2400, yRef2: 52 }] },
];

// headwindLookup — right pane, headwind section:
// yRef2 × windKts (0–15) → ground roll distance (ft)
export const headwindLookup = [
    { yRef2:  8, points: [{ windKts:  0, dist:  400 }, { windKts: 15, dist:  280 }] },
    { yRef2: 12, points: [{ windKts:  0, dist:  600 }, { windKts: 15, dist:  450 }] },
    { yRef2: 16, points: [{ windKts:  0, dist:  800 }, { windKts: 15, dist:  600 }] },
    { yRef2: 20, points: [{ windKts:  0, dist:  1000 }, { windKts: 15, dist:  750 }] },
    { yRef2: 23.8, points: [{ windKts:  0, dist:  1180 }, { windKts: 15, dist:  925 }] },
    { yRef2: 28, points: [{ windKts:  0, dist:  1400 }, { windKts: 15, dist:  1100 }] },
    { yRef2: 31.8, points: [{ windKts:  0, dist:  1600 }, { windKts: 15, dist:  1240 }] },
    { yRef2: 36, points: [{ windKts:  0, dist:  1800 }, { windKts: 15, dist:  1400 }] },
    { yRef2: 40, points: [{ windKts:  0, dist:  2000 }, { windKts: 15, dist:  1570 }] },
    { yRef2: 44, points: [{ windKts:  0, dist:  2200 }, { windKts: 15, dist:  1725 }] },
    { yRef2: 48, points: [{ windKts:  0, dist:  2400 }, { windKts: 15, dist:  1925 }] },
];

// tailwindLookup — right pane, tailwind section:
// yRef2 × windKts (0–15) → ground roll distance (ft)
export const tailwindLookup = [
    { yRef2:  8, points: [{ windKts:  0, dist:  400 }, { windKts: 5, dist:  525 }] },
    { yRef2: 12, points: [{ windKts:  0, dist:  600 }, { windKts: 5, dist:  775 }] },
    { yRef2: 16, points: [{ windKts:  0, dist:  800 }, { windKts: 5, dist:  1060 }] },
    { yRef2: 20, points: [{ windKts:  0, dist:  1000 }, { windKts: 5, dist:  1280 }] },
    { yRef2: 23.8, points: [{ windKts:  0, dist:  1180 }, { windKts: 5, dist:  1500 }] },
    { yRef2: 28, points: [{ windKts:  0, dist:  1400 }, { windKts: 5, dist:  1750 }] },
    { yRef2: 31.8, points: [{ windKts:  0, dist:  1600 }, { windKts: 5, dist:  2000 }] },
    { yRef2: 36, points: [{ windKts:  0, dist:  1800 }, { windKts: 5, dist:  2250 }] },
    { yRef2: 40, points: [{ windKts:  0, dist:  2000 }, { windKts: 5, dist:  2500 }] },
    { yRef2: 44, points: [{ windKts:  0, dist:  2200 }, { windKts: 3.7, dist:  2600 }] },
];

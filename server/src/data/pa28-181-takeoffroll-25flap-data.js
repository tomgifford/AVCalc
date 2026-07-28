// PA-28-181 Takeoff Performance — Ground Roll
// 25° Flaps, Paved Level Dry Runway, Full Power Before Brake Release
//
// DRAFT — data values are placeholder copies from the PA-28-161 0° flap chart.
// Validate and replace against the actual PA-28-181 POH chart using the trace
// overlay at app/test/pa28-181-takeoffroll-25flap-trace-overlay.html before use.
//
// Three-pane chart pipeline:
//   pane 1 (left):   OAT × PA              → yRef1  (chart reference scale 0–80)
//   pane 2 (middle): yRef1 × Weight        → yRef2  (chart reference scale 0–80)
//   pane 3 (right):  yRef2 × Wind (HW/TW) → ground roll distance (ft)

// yRef1Lookup — left pane: OAT (°C) × pressure altitude (ft) → yRef1 (0–80 scale)
export const yRef1Lookup = [
    { pa: 0,    points: [{ t: 10, yRef:  4 }, { t: 37.8, yRef: 8 }] },
    { pa: 1000, points: [{ t: 2, yRef: 4 }, { t: 37.8, yRef: 9.6 }] },
    { pa: 2000, points: [{ t: -8, yRef: 4 }, { t: 37.8, yRef: 11.4 }] },
    { pa: 3000, points: [{ t: -18, yRef: 4 }, { t: 37.8, yRef: 13.2 }] },
    { pa: 4000, points: [{ t: -28, yRef: 4 }, { t: 37.8, yRef: 15.2 }] },
    { pa: 5000, points: [{ t: -37.5, yRef: 4 }, { t: 0, yRef: 10.3 }, { t: 37.8, yRef: 17.3 }] },
    { pa: 6000, points: [{ t: -40, yRef: 5.4 }, { t: -20, yRef: 8.5 }, { t: 0, yRef: 12.1 }, { t: 10, yRef: 14.2 }, { t: 29, yRef: 18 }] },
    { pa: 7000, points: [{ t: -40, yRef: 6.7 }, { t: -20, yRef: 10 }, { t: 0, yRef: 14 }, { t: 16, yRef: 18 }] },
];

// weightLookup — middle pane: yRef1 × weight (lbs) → yRef2 (0–80 scale)
export const weightLookup = [
    { yRef1: 4,   points: [{ weight: 2050, yRef2:  1.3 }, { weight: 2350, yRef2: 2.9 }, { weight: 2550, yRef2: 4 }] },
    { yRef1: 6,   points: [{ weight: 2050, yRef2:  2.7 }, { weight: 2350, yRef2: 4.5 }, { weight: 2550, yRef2: 6 }] },
    { yRef1: 8,   points: [{ weight: 2050, yRef2:  3.9 }, { weight: 2350, yRef2: 6.2 }, { weight: 2550, yRef2: 8 }] },
    { yRef1: 10,   points: [{ weight: 2050, yRef2:  5.7 },  { weight: 2250, yRef2: 6.9 }, { weight: 2350, yRef2: 8 }, { weight: 2550, yRef2: 10 }] },
    { yRef1: 12,   points: [{ weight: 2050, yRef2:  6.7 },  { weight: 2250, yRef2: 8.5 }, { weight: 2350, yRef2: 9.7 }, { weight: 2550, yRef2: 12 }] },
    { yRef1: 14,   points: [{ weight: 2050, yRef2:  7.6 }, { weight: 2250, yRef2: 10 },  { weight: 2350, yRef2: 11.2 }, { weight: 2550, yRef2: 14 }] },
    { yRef1: 16,   points: [{ weight: 2050, yRef2:  8.9 }, { weight: 2250, yRef2: 11.6 },  { weight: 2350, yRef2: 13 }, { weight: 2550, yRef2: 16 }] },
    { yRef1: 18,   points: [{ weight: 2050, yRef2:  10.2 }, { weight: 2250, yRef2: 13.1 },  { weight: 2350, yRef2: 14.75 }, { weight: 2550, yRef2: 18 }] },
];

// headwindLookup — right pane, headwind section:
export const headwindLookup = [
    { yRef2:  1.8,    points: [{ windKts:  0, dist:  580 }, { windKts: 13.75, dist:  400 }] },
    { yRef2: 4.6,    points: [{ windKts:  0, dist:  860 }, { windKts: 15, dist:  630 }] },
    { yRef2: 7.4,    points: [{ windKts:  0, dist:  1140 }, { windKts: 15, dist:  840 }] },
    { yRef2: 10,    points: [{ windKts:  0, dist:  1400 }, { windKts: 15, dist:  1050 }] },
    { yRef2: 12.8,    points: [{ windKts:  0, dist:  1680 }, { windKts: 15, dist:  1280 }] },
    { yRef2: 16.1,    points: [{ windKts:  0, dist:  2010 }, { windKts: 15, dist:  1550 }] },
    { yRef2: 19.8,    points: [{ windKts:  0, dist:  2380 }, { windKts: 15, dist:  1800 }] },
];

// tailwindLookup — right pane, tailwind section:
export const tailwindLookup = [
    { yRef2: 1.8,    points: [{ windKts:  0, dist:  580 }, { windKts: 5, dist:  775 }] },
    { yRef2: 4.6,    points: [{ windKts:  0, dist:  860 }, { windKts: 5, dist:  1120 }] },
    { yRef2: 7.4,    points: [{ windKts:  0, dist:  1140 }, { windKts: 5, dist:  1500 }] },
    { yRef2: 10,    points: [{ windKts:  0, dist:  1400 }, { windKts: 5, dist:  1820 }] },
    { yRef2: 12.8,    points: [{ windKts:  0, dist:  1680 }, { windKts: 5, dist:  2130 }] },
    { yRef2: 16.1,    points: [{ windKts:  0, dist:  2010 }, { windKts: 3.5, dist:  2400 }] },

];

// PA-28-181 Takeoff Performance — Distance Over 50 ft Obstacle
// 25° Flaps, Paved Level Dry Runway, Full Power Before Brake Release
//
// DRAFT — data values are placeholder copies from the PA-28-161 0° flap chart.
// Validate and replace against the actual PA-28-181 POH chart using the trace
// overlay at app/test/pa28-181-takeoff50-25flap-trace-overlay.html before use.
//
// Three-pane chart pipeline:
//   pane 1 (left):   OAT × PA              → yRef1  (chart reference scale 0–80)
//   pane 2 (middle): yRef1 × Weight        → yRef2  (chart reference scale 0–80)
//   pane 3 (right):  yRef2 × Wind (HW/TW) → distance over 50 ft (ft)

// yRef1Lookup — left pane: OAT (°C) × pressure altitude (ft) → yRef1 (0–80 scale)
export const yRef1Lookup = [
    { pa: 0,    points: [{ t: 5, yRef: 4 }, { t: 20, yRef: 7.6 }, { t: 26.7, yRef: 9.4 }] },
    { pa: 2000, points: [{ t: -15, yRef: 4 }, { t: 0, yRef: 7.7 }, { t: 26.7, yRef: 15.7 }] },
    { pa: 4000, points: [{ t: -34, yRef: 4 }, { t: -20, yRef: 7.7 }, { t: 0, yRef: 14 }, { t: 20, yRef: 21 }, { t: 26.7, yRef: 23.5 }] },
    { pa: 6000, points: [{ t: -40, yRef: 7.3 }, { t: -20, yRef: 13.8 }, { t: 0, yRef: 21 }, { t: 15, yRef: 28 }] },
    { pa: 7000, points: [{ t: -40, yRef: 10 }, { t: -20, yRef: 17.3 }, { t: 0, yRef: 25.6 }, { t: 4, yRef: 28 }] },
];

// weightLookup — middle pane: yRef1 × weight (lbs) → yRef2 (0–80 scale)
export const weightLookup = [
    { yRef1:  2.4, points: [{ weight: 2300, yRef2:  0 }, { weight: 2550, yRef2:  2.4 }]},
    { yRef1:  4.4, points: [{ weight: 2160, yRef2:  0 }, { weight: 2300, yRef2:  1.4 }, { weight: 2550, yRef2:  4.4 }]},
    { yRef1:  6.1, points: [{ weight: 2050, yRef2:  0 }, { weight: 2300, yRef2:  3 }, { weight: 2550, yRef2:  6.1 }]},
    { yRef1:  8.5, points: [{ weight: 2050, yRef2:  1.7 }, { weight: 2300, yRef2:  4.9 }, { weight: 2550, yRef2:  8.5 }]},
    { yRef1:  11, points: [{ weight: 2050, yRef2:  3.1 }, { weight: 2300, yRef2:  6.8 }, { weight: 2550, yRef2:  11 }]},
    { yRef1:  13.4, points: [{ weight: 2050, yRef2:  4.6 }, { weight: 2300, yRef2:  8.8 }, { weight: 2400, yRef2:  10.5 }, { weight: 2550, yRef2:  13.4 }]},
    { yRef1:  15.8, points: [{ weight: 2050, yRef2:  6.1 }, { weight: 2300, yRef2:  10.6 }, { weight: 2400, yRef2:  12.6 },  { weight: 2550, yRef2:  15.8 }]},
    { yRef1:  19, points: [{ weight: 2050, yRef2:  8.1 }, { weight: 2300, yRef2:  13.2 }, { weight: 2400, yRef2:  15.4 },  { weight: 2550, yRef2:  19 }]},
    { yRef1:  22.2, points: [{ weight: 2050, yRef2:  9.9 }, { weight: 2300, yRef2:  15.7 }, { weight: 2400, yRef2:  18.1 },  { weight: 2550, yRef2:  22.2 }]},
    { yRef1:  25.5, points: [{ weight: 2050, yRef2:  11.9 }, { weight: 2300, yRef2:  18.1 }, { weight: 2400, yRef2:  20.9 },  { weight: 2550, yRef2:  25.5 }]},
    { yRef1:  28, points: [{ weight: 2050, yRef2:  13.8 }, { weight: 2300, yRef2:  20.6 }, { weight: 2400, yRef2:  23.7 },  { weight: 2530, yRef2:  28 }]},
];

// headwindLookup — right pane, headwind section:
export const headwindLookup = [
    { yRef2:  2, points: [{ windKts:  0, dist:  1200 }, { windKts: 10, dist:  1000 }] },
    { yRef2:  6, points: [{ windKts:  0, dist:  1600 }, { windKts: 15, dist:  1250 }] },
    { yRef2:  10, points: [{ windKts:  0, dist:  2000 }, { windKts: 15, dist:  1550 }] },
    { yRef2:  13.9, points: [{ windKts:  0, dist:  2400 }, { windKts: 15, dist:  1890 }] },
    { yRef2:  18, points: [{ windKts:  0, dist:  2800 }, { windKts: 15, dist:  2250 }] },
    { yRef2:  21.8, points: [{ windKts:  0, dist:  3180 }, { windKts: 15, dist:  2560 }] },
];

// tailwindLookup — right pane, tailwind section:
export const tailwindLookup = [
    { yRef2:  2, points: [{ windKts:  0, dist:  1200 }, { windKts: 5, dist:  1520 }] },
    { yRef2:  6, points: [{ windKts:  0, dist:  1600 }, { windKts: 5, dist:  1980 }] },
    { yRef2:  10, points: [{ windKts:  0, dist:  2000 }, { windKts: 5, dist:  2500 }] },
    { yRef2:  13.9, points: [{ windKts:  0, dist:  2400 }, { windKts: 5, dist:  2950 }] },
    { yRef2:  18, points: [{ windKts:  0, dist:  2800 }, { windKts: 5, dist:  3400 }] },
    { yRef2:  21.8, points: [{ windKts:  0, dist:  3180 }, { windKts: 4.2, dist:  3800 }] },
];

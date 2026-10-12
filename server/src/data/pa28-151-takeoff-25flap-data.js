// PA-28-151 Takeoff Performance — 25° Flaps, Combined Data
// Paved Level Dry Runway, Full Power Before Brake Release
//
// DRAFT — data values are placeholder stubs derived from the old PA-28-181-modelled
// data files. Validate and replace against the actual PA-28-151 POH chart using the
// trace overlay at app/test/pa28-151-takeoff-25flap-trace-overlay.html before use.
// OAT axis: -28.9 °C (-20 °F) to 37.8 °C (100 °F) — no values outside this range.
//
// Two-pane chart pipeline (PA-28-151 specific — no weight panel):
//   pane 1 (left):   OAT × PA  → yRef           (chart reference scale 0–28)
//   pane 2a (mid):   yRef × 3 wind curves → ground roll distance (ft)
//   pane 2b (right): yRef × 3 wind curves → 50 ft obstacle distance (ft)
//   Weight is always max gross (2325 lbs) — not a variable.

// yRef1Lookup — left pane: OAT (°C) × pressure altitude (ft) → yRef (0–28 scale)
export const yRef1Lookup = [
    { pa: 0,    points: [{ t: 10,    yRef:  4.0 }, { t: 37.8, yRef:  8.0 }] },
    { pa: 1000, points: [{ t:  2,    yRef:  4.0 }, { t: 37.8, yRef:  9.6 }] },
    { pa: 2000, points: [{ t: -8,    yRef:  4.0 }, { t: 37.8, yRef: 11.4 }] },
    { pa: 3000, points: [{ t: -18,   yRef:  4.0 }, { t: 37.8, yRef: 13.2 }] },
    { pa: 4000, points: [{ t: -28,   yRef:  4.0 }, { t: 37.8, yRef: 15.2 }] },
    { pa: 5000, points: [{ t: -28.9, yRef:  4.0 }, { t:  0,   yRef: 10.3 }, { t: 37.8, yRef: 17.3 }] },
    { pa: 6000, points: [{ t: -28.9, yRef:  5.4 }, { t: -20,  yRef:  8.5 }, { t:  0,   yRef: 12.1 }, { t: 10, yRef: 14.2 }, { t: 29, yRef: 18.0 }] },
    { pa: 7000, points: [{ t: -28.9, yRef:  6.7 }, { t: -20,  yRef: 10.0 }, { t:  0,   yRef: 14.0 }, { t: 16, yRef: 18.0 }] },
];

// groundRollLookup — mid pane: yRef × wind condition → ground roll distance (ft)
// Three named curves: calm (0 kt), hw15 (15 kt headwind), tw5 (5 kt tailwind).
// Wind interpolation: linear blend calm↔hw15 for headwind, calm↔tw5 for tailwind.
export const groundRollLookup = [
    {
        name: 'calm',
        points: [
            { yRef:  1.8, dist:  580 },
            { yRef:  4.6, dist:  860 },
            { yRef:  7.4, dist: 1140 },
            { yRef: 10.0, dist: 1400 },
            { yRef: 12.8, dist: 1680 },
            { yRef: 16.1, dist: 2010 },
            { yRef: 19.8, dist: 2380 },
        ],
    },
    {
        name: 'hw15',
        points: [
            { yRef:  1.8, dist:  380 },
            { yRef:  4.6, dist:  630 },
            { yRef:  7.4, dist:  840 },
            { yRef: 10.0, dist: 1050 },
            { yRef: 12.8, dist: 1280 },
            { yRef: 16.1, dist: 1550 },
            { yRef: 19.8, dist: 1800 },
        ],
    },
    {
        name: 'tw5',
        points: [
            { yRef:  1.8, dist:  775 },
            { yRef:  4.6, dist: 1120 },
            { yRef:  7.4, dist: 1500 },
            { yRef: 10.0, dist: 1820 },
            { yRef: 12.8, dist: 2130 },
            { yRef: 16.1, dist: 2570 },
            { yRef: 19.8, dist: 3000 },
        ],
    },
];

// takeoffPerfLookup — right pane: yRef × wind condition → 50 ft obstacle distance (ft)
// Same wind-curve structure as groundRollLookup.
export const takeoffPerfLookup = [
    {
        name: 'calm',
        points: [
            { yRef:  2.0, dist: 1200 },
            { yRef:  6.0, dist: 1600 },
            { yRef: 10.0, dist: 2000 },
            { yRef: 13.9, dist: 2400 },
            { yRef: 18.0, dist: 2800 },
            { yRef: 21.8, dist: 3180 },
        ],
    },
    {
        name: 'hw15',
        points: [
            { yRef:  2.0, dist:  900 },
            { yRef:  6.0, dist: 1250 },
            { yRef: 10.0, dist: 1550 },
            { yRef: 13.9, dist: 1890 },
            { yRef: 18.0, dist: 2250 },
            { yRef: 21.8, dist: 2560 },
        ],
    },
    {
        name: 'tw5',
        points: [
            { yRef:  2.0, dist: 1520 },
            { yRef:  6.0, dist: 1980 },
            { yRef: 10.0, dist: 2500 },
            { yRef: 13.9, dist: 2950 },
            { yRef: 18.0, dist: 3400 },
            { yRef: 21.8, dist: 3870 },
        ],
    },
];

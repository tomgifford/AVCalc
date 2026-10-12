// PA-28-151 Takeoff Performance — 0° Flaps, Combined Data
// Paved Level Dry Runway, Full Power Before Brake Release
//
// DRAFT — data values are placeholder stubs derived from the old PA-28-181-modelled
// data files. Validate and replace against the actual PA-28-151 POH chart using the
// trace overlay at app/test/pa28-151-takeoff-trace-overlay.html before use.
// OAT axis: -28.9 °C (-20 °F) to 37.8 °C (100 °F) — no values outside this range.
//
// Two-pane chart pipeline (PA-28-151 specific — no weight panel):
//   pane 1 (left):   OAT × PA  → yRef           (chart reference scale 0–28)
//   pane 2a (mid):   yRef × 3 wind curves → ground roll distance (ft)
//   pane 2b (right): yRef × 3 wind curves → 50 ft obstacle distance (ft)
//   Weight is always max gross (2325 lbs) — not a variable.

// yRef1Lookup — left pane: OAT (°C) × pressure altitude (ft) → yRef (0–28 scale)
export const yRef1Lookup = [
    { pa: 0,    points: [{ t: 10,    yRef:  5 }, { t: 37.8, yRef:  9.8 }] },
    { pa: 1000, points: [{ t:  0,    yRef:  5 }, { t: 37.8, yRef: 11.8 }] },
    { pa: 2000, points: [{ t: -11,   yRef:  5 }, { t: 37.8, yRef: 13.8 }] },
    { pa: 3000, points: [{ t: -20,   yRef:  5 }, { t: 37.8, yRef: 15.8 }] },
    { pa: 4000, points: [{ t: -28.9, yRef:  5 }, { t:  0,   yRef: 10.3 }, { t: 37.8, yRef: 17.8 }] },
    { pa: 5000, points: [{ t: -28.9, yRef:  5 }, { t:  0,   yRef: 12.5 }, { t:   37, yRef: 20.0 }] },
    { pa: 6000, points: [{ t: -28.9, yRef:  6.6 }, { t: 24,   yRef: 20.0 }] },
    { pa: 7000, points: [{ t: -28.9, yRef:  8.4 }, { t: -20,  yRef: 12.5 }, { t: 14.5, yRef: 20.0 }] },
];

// groundRollLookup — mid pane: yRef × wind condition → ground roll distance (ft)
// Three named curves: calm (0 kt), hw15 (15 kt headwind), tw5 (5 kt tailwind).
// Wind interpolation: linear blend calm↔hw15 for headwind, calm↔tw5 for tailwind.
export const groundRollLookup = [
    {
        name: 'calm',
        points: [
            { yRef:  2.0, dist:  600 },
            { yRef:  4.0, dist:  800 },
            { yRef:  6.0, dist: 1000 },
            { yRef:  8.0, dist: 1200 },
            { yRef:  9.9, dist: 1390 },
            { yRef: 12.0, dist: 1600 },
            { yRef: 13.9, dist: 1790 },
            { yRef: 15.9, dist: 1990 },
            { yRef: 17.8, dist: 2180 },
            { yRef: 19.8, dist: 2380 },
        ],
    },
    {
        name: 'hw15',
        points: [
            { yRef:  2.0, dist:  400 },
            { yRef:  4.0, dist:  560 },
            { yRef:  6.0, dist:  750 },
            { yRef:  8.0, dist:  910 },
            { yRef:  9.9, dist: 1070 },
            { yRef: 12.0, dist: 1240 },
            { yRef: 13.9, dist: 1380 },
            { yRef: 15.9, dist: 1520 },
            { yRef: 17.8, dist: 1680 },
            { yRef: 19.8, dist: 1850 },
        ],
    },
    {
        name: 'tw5',
        points: [
            { yRef:  2.0, dist:  775 },
            { yRef:  4.0, dist: 1010 },
            { yRef:  6.0, dist: 1280 },
            { yRef:  8.0, dist: 1510 },
            { yRef:  9.9, dist: 1750 },
            { yRef: 12.0, dist: 2000 },
            { yRef: 13.9, dist: 2230 },
            { yRef: 15.9, dist: 2460 },
            { yRef: 17.8, dist: 2680 },
            { yRef: 19.8, dist: 2900 },
        ],
    },
];

// takeoffPerfLookup — right pane: yRef × wind condition → 50 ft obstacle distance (ft)
// Same wind-curve structure as groundRollLookup.
export const takeoffPerfLookup = [
    {
        name: 'calm',
        points: [
            { yRef:  2, dist: 1800 },
            { yRef:  6, dist: 2200 },
            { yRef: 10, dist: 2600 },
            { yRef: 14, dist: 3000 },
            { yRef: 18, dist: 3400 },
            { yRef: 22, dist: 3800 },
            { yRef: 28, dist: 4400 },
        ],
    },
    {
        name: 'hw15',
        points: [
            { yRef:  2, dist: 1400 },
            { yRef:  6, dist: 1790 },
            { yRef: 10, dist: 2100 },
            { yRef: 14, dist: 2450 },
            { yRef: 18, dist: 2790 },
            { yRef: 22, dist: 3150 },
            { yRef: 28, dist: 3650 },
        ],
    },
    {
        name: 'tw5',
        points: [
            { yRef:  2, dist: 2200 },
            { yRef:  6, dist: 2650 },
            { yRef: 10, dist: 3110 },
            { yRef: 14, dist: 3600 },
            { yRef: 18, dist: 4040 },
            { yRef: 22, dist: 4500 },
            { yRef: 28, dist: 5200 },
        ],
    },
];

---
name: new-aircraft
description: Use this skill when the user wants to add a new aircraft to AVCalc, introduce a new aircraft type, or onboard a new plane. Triggers on phrases like "add a new aircraft", "introduce a new plane", "add support for", "new aircraft", or "onboard [aircraft name]". Walk the user through collecting all required data and then implement all necessary code changes.
---

# New Aircraft Onboarding

This skill guides you through adding a new aircraft to AVCalc. The process involves gathering data from the POH (Pilot's Operating Handbook) charts, then implementing the changes across several files. Progress is saved to `.claude/new-aircraft-wip.json` after each step so the session can be interrupted and resumed at any time.

---

## Resume Check (do this first, every time the skill is invoked)

Before anything else, check whether a work-in-progress file exists:

```bash
cat /workspaces/Code/AVCalc/.claude/new-aircraft-wip.json 2>/dev/null
```

If it exists:
- List all in-progress aircraft with their display names and a brief status summary (which steps are done vs. remaining).
- If there is more than one, ask the user which aircraft to work on.
- If the user names a specific aircraft (e.g., "let's continue with the Archer"), match it to the correct entry by `id` or `displayName`.
- Ask whether to resume or start fresh for the selected aircraft. Starting fresh removes only that aircraft's entry from the file (not others).
- Then jump to the first incomplete step for the selected aircraft.

If it doesn't exist, or the user wants to add a new aircraft not already in the file, proceed to Step 1.

---

## State File Format

The file holds an array so multiple aircraft can be in progress simultaneously. Each entry is keyed by aircraft ID for easy lookup. Write the file after Step 1 and update the relevant entry's `stepsComplete` after each subsequent step.

```json
{
  "aircraft": {
    "pa28-181": {
      "displayName": "Piper PA-28-181 Archer II",
      "id": "pa28-181",
      "upperID": "PA28-181",
      "camelId": "pa28181",
      "hasFairings": true,
      "fairingsTASDeduction": 2.6,
      "maxFlapAngle": 40,
      "stepsComplete": {
        "basicInfo": true,
        "chartImages": true,
        "skeletonFiles": true,
        "climbData": false,
        "cruiseData": false,
        "engineData": false,
        "airspeedCal": false,
        "registry": false,
        "testFiles": false
      }
    },
    "c172": {
      "displayName": "Cessna 172 Skyhawk",
      "id": "c172",
      "upperID": "C172",
      "camelId": "c172",
      "hasFairings": false,
      "fairingsTASDeduction": 0,
      "maxFlapAngle": 30,
      "stepsComplete": {
        "basicInfo": true,
        "chartImages": false,
        "skeletonFiles": false,
        "climbData": false,
        "cruiseData": false,
        "engineData": false,
        "airspeedCal": false,
        "registry": false,
        "testFiles": false
      }
    }
  }
}
```

When an aircraft completes Step 12 (build verification), remove its entry from the `aircraft` object. If the object becomes empty, delete the file entirely:

```bash
# Remove one entry with node (or read-modify-write the JSON manually):
node -e "
  const fs = require('fs');
  const p = '/workspaces/Code/AVCalc/.claude/new-aircraft-wip.json';
  const s = JSON.parse(fs.readFileSync(p));
  delete s.aircraft['{id}'];
  if (Object.keys(s.aircraft).length === 0) fs.unlinkSync(p);
  else fs.writeFileSync(p, JSON.stringify(s, null, 2));
"
```

---

## Overview of what gets created

1. `src/lib/{id}-climb-data.js` — climb performance data
2. `src/lib/{id}-cruise-data.js` — cruise performance data  
3. `src/lib/{id}-engine-data.js` — engine performance data
4. Entry added to `src/lib/airspeedcal-data.js`
5. Entry added to `src/lib/aircraft-registry.js`
6. Entry added to `src/lib/performance-charts.js`
7. Aircraft added to dropdown in `src/App.jsx`
8. Wheel fairings logic updated in `src/App.jsx` (if applicable)
9. Four chart PNG images placed in `public/charts/`

---

## Step 1: Gather Basic Aircraft Info

Ask the user for:

- **Full display name** — e.g., "Piper PA-28-161 Warrior II" (shown in the dropdown)
- **Aircraft ID** — kebab-case identifier used in file names and code, e.g., `pa28-161`. Suggest one based on the display name, confirm with user.
- **Has wheel fairings?** — Does this aircraft's POH include a TAS adjustment for wheel fairings being installed/not installed? (yes/no). If yes, ask for the TAS deduction in knots when fairings are NOT installed.

---

## Step 2: Chart Images

Four PNG chart images are needed, named using the UPPERCASE version of the aircraft ID (e.g., `PA28-161`):

- `{AIRCRAFT-ID-UPPER}-ClimbPerformanceChart.png`
- `{AIRCRAFT-ID-UPPER}-CruisePerfPowerChart.png`
- `{AIRCRAFT-ID-UPPER}-EnginePerformanceChart.png`
- `{AIRCRAFT-ID-UPPER}-AirspeedCalChart.png`

Ask the user where these files are located (or if they'll add them manually later). If they provide paths, copy them to `public/charts/` with the correct names. If not yet available, note that the app will still work — chart images are display-only; missing images just won't render.

---

## Step 3: Create Skeleton Data Files

Create the three data files now so the user can open them directly rather than entering everything through conversation. Do NOT add these to the registry yet — that happens in Step 8 so the aircraft doesn't appear in the UI until the data is ready.

### Standard temperature formula

ISA standard temperature at any pressure altitude: `std_temp = 15 - 2 * (PA / 1000)`

So: PA 0 → 15°C, PA 1000 → 13°C, PA 4000 → 7°C, PA 8000 → −1°C, PA 12000 → −9°C

### The yRef system (explain briefly to the user)

Each POH chart has a Y-axis. `yRefLookup` maps pressure altitude + OAT to a position on that Y-axis (yRef). The app interpolates the yRef value and uses it to look up performance values (TAS, distance, time, etc.) from the chart curves. Each chart type (climb, cruise, engine) has its own independent yRef calibration.

### What to generate

For each `yRefLookup`, create one PA entry per 1000 ft from 0 to the aircraft's service ceiling (adjust to match the chart). Each PA entry gets **three placeholder points**:
- **min temp**: lowest temperature visible on that altitude line (use the chart's edge; placeholder yRef = 0)
- **standard temp**: pre-calculated (yRef = 0 placeholder)
- **max temp**: highest temperature visible on that altitude line (yRef = 0 placeholder)

For performance lookup arrays (dist, time, fuel, TAS, RPM), create only a **first and last entry** as placeholders — Step 4–6 will fill in the actual values from the chart images.

### `src/lib/{id}-climb-data.js`

```js
export const climbDistLookup = [
    { yRef:  0, dist:  0 },
    { yRef:  0, dist:  0 },  // TODO: fill in max yRef and dist
];

export const timeLookup = [
    { yRef:  0, time:  0 },
    { yRef:  0, time:  0 },  // TODO: fill in max yRef and time
];

export const fuelLookup = [
    { yRef:  0, fuel:  0 },
    { yRef:  0, fuel:  0 },  // TODO: fill in max yRef and fuel
];

export const yRefLookup = [
    { pa:     0, points: [
        { t: -40, yRef: 0 },   // min temp — fill in
        { t:  15, yRef: 0 },   // std (15 - 2*0)
        { t:  40, yRef: 0 },   // max temp — fill in
    ]},
    { pa:  1000, points: [
        { t: -40, yRef: 0 },
        { t:  13, yRef: 0 },   // std (15 - 2*1)
        { t:  40, yRef: 0 },
    ]},
    { pa:  2000, points: [
        { t: -40, yRef: 0 },
        { t:  11, yRef: 0 },   // std (15 - 2*2)
        { t:  40, yRef: 0 },
    ]},
    { pa:  3000, points: [
        { t: -40, yRef: 0 },
        { t:   9, yRef: 0 },   // std (15 - 2*3)
        { t:  40, yRef: 0 },
    ]},
    { pa:  4000, points: [
        { t: -40, yRef: 0 },
        { t:   7, yRef: 0 },   // std (15 - 2*4)
        { t:  40, yRef: 0 },
    ]},
    { pa:  5000, points: [
        { t: -40, yRef: 0 },
        { t:   5, yRef: 0 },   // std (15 - 2*5)
        { t:  40, yRef: 0 },
    ]},
    { pa:  6000, points: [
        { t: -40, yRef: 0 },
        { t:   3, yRef: 0 },   // std (15 - 2*6)
        { t:  40, yRef: 0 },
    ]},
    { pa:  7000, points: [
        { t: -40, yRef: 0 },
        { t:   1, yRef: 0 },   // std (15 - 2*7)
        { t:  40, yRef: 0 },
    ]},
    { pa:  8000, points: [
        { t: -40, yRef: 0 },
        { t:  -1, yRef: 0 },   // std (15 - 2*8)
        { t:  40, yRef: 0 },
    ]},
    { pa:  9000, points: [
        { t: -40, yRef: 0 },
        { t:  -3, yRef: 0 },   // std (15 - 2*9)
        { t:  40, yRef: 0 },
    ]},
    { pa: 10000, points: [
        { t: -40, yRef: 0 },
        { t:  -5, yRef: 0 },   // std (15 - 2*10)
        { t:  40, yRef: 0 },
    ]},
    { pa: 11000, points: [
        { t: -40, yRef: 0 },
        { t:  -7, yRef: 0 },   // std (15 - 2*11)
        { t:  40, yRef: 0 },
    ]},
    { pa: 12000, points: [
        { t: -40, yRef: 0 },
        { t:  -9, yRef: 0 },   // std (15 - 2*12)
        { t:  40, yRef: 0 },
    ]},
];
```

### `src/lib/{id}-cruise-data.js`

Use the same PA level / std temp skeleton for `cruiseYRefLookup` (adjust the ceiling and min/max temps to match the cruise chart). Include fully expanded PA entries for all levels.

```js
export const cruiseYRefLookup = [
    { pa:     0, points: [ { t: -40, yRef: 0 }, { t:  15, yRef: 0 }, { t:  40, yRef: 0 } ] },
    { pa:  1000, points: [ { t: -40, yRef: 0 }, { t:  13, yRef: 0 }, { t:  40, yRef: 0 } ] },
    // ... continue through service ceiling with correct std temps ...
];

export const cruiseTASLookup = {
    75: [ { yRef: 0, tas: 0 }, { yRef: 0, tas: 0 } ],  // TODO: fill in
    65: [ { yRef: 0, tas: 0 }, { yRef: 0, tas: 0 } ],
    55: [ { yRef: 0, tas: 0 }, { yRef: 0, tas: 0 } ],
};

export const cruiseMaxTAS = [
    { yRef: 0, tas: 0 },  // TODO: fill in
    { yRef: 0, tas: 0 },
];

export const cruiseFuelGPH = { 75: 0, 65: 0, 55: 0 };  // TODO: fill in from POH

export const noFairingsTASDeduction = 0;  // TODO: fill in if applicable
```

### `src/lib/{id}-engine-data.js`

Same pattern — fully expanded `yRefLookup` with std temps, minimal RPM placeholders.

```js
export const yRefLookup = [
    { pa:     0, points: [ { t: -40, yRef: 0 }, { t:  15, yRef: 0 }, { t:  40, yRef: 0 } ] },
    // ... continue through service ceiling ...
];

export const rpmLookup = {
    75: [ { yRef: 0, rpm: 0 }, { yRef: 0, rpm: 0 } ],  // TODO: fill in
    65: [ { yRef: 0, rpm: 0 }, { yRef: 0, rpm: 0 } ],
    55: [ { yRef: 0, rpm: 0 }, { yRef: 0, rpm: 0 } ],
};
```

---

## Step 4: Fill In Climb Data

Read the climb chart image and update `src/lib/{id}-climb-data.js`:

**yRefLookup**: For each PA altitude line on the chart, read the yRef value where it intersects each temperature reference line. Replace the placeholder 0 yRef values, correct the min/max temperatures to match what the chart actually shows, and add any intermediate temperature reference lines visible on the chart.

**climbDistLookup / timeLookup / fuelLookup**: Sample each curve at regular yRef intervals from 0 to the chart's maximum. Aim for 15–25 points with finer spacing where curves bend sharply. Replace the placeholder last entry and add all intermediate points. The yRef=0 first entry (dist/time/fuel = 0) is correct and stays.

---

## Step 5: Fill In Cruise Data

Read the cruise chart image and update `src/lib/{id}-cruise-data.js`:

**cruiseYRefLookup**: Same approach — read yRef intersections per PA/temperature. The cruise chart may have different altitude levels and temperature ranges than the climb chart; adjust accordingly.

**cruiseTASLookup**: For each power curve (75%, 65%, 55%), read TAS values at several yRef positions across the chart. Fill in the placeholders and add intermediate points.

**cruiseMaxTAS**: Trace the maximum TAS envelope (upper boundary curve) with 8–12 points.

**cruiseFuelGPH**: Read fuel burn at 75%, 65%, 55% from the POH cruise performance table or chart legend.

**noFairingsTASDeduction**: Fill in if applicable, otherwise leave as 0.

---

## Step 6: Fill In Engine Data

Read the engine chart image and update `src/lib/{id}-engine-data.js`:

**yRefLookup**: Read yRef intersections per PA/temperature from the engine chart.

**rpmLookup**: For each power curve, read RPM values at several yRef positions. Fill in the placeholders and add intermediate points.

---

## Step 7: Airspeed Calibration Data

Ask the user for the aircraft's maximum flap deflection angle (e.g., 30°, 40°). This determines the second key name — use `flaps{angle}` (e.g., `flaps30`). These key names are internal only and never displayed to the user.

Read the airspeed calibration chart image and add the new aircraft's entry to `src/lib/airspeedcal-data.js`:

```js
'{id}': {
    flapsUp: [
        { ias:  XX, cas: XX },
        // full speed range — typically 6–10 points
    ],
    flaps{angle}: [
        { ias:  XX, cas: XX },
        // ...
    ],
},
```

Note: the current app only calls `getIASfromCAS` with `'flapsUp'`, so the full-flap entry is for future use. Still include it for completeness.

---

## Step 8: Wire Into Registry and UI

### 8a. Update `src/lib/aircraft-registry.js`

Add three import lines at the top:
```js
import * as {camelId}Climb from './{id}-climb-data.js';
import * as {camelId}Cruise from './{id}-cruise-data.js';
import * as {camelId}Engine from './{id}-engine-data.js';
```

Add entry to REGISTRY:
```js
'{id}': { climb: {camelId}Climb, cruise: {camelId}Cruise, engine: {camelId}Engine, airspeedCal: airspeedCalData['{id}'] },
```

### 8b. Update `src/lib/performance-charts.js`

Add entry to `CHART_MAP`:
```js
'{id}': {
    climb: {
        src: `${base}charts/{UPPER-ID}-ClimbPerformanceChart.png`,
        alt: '{Display Name} Fuel, Time and Distance to Climb chart',
        title: 'Fuel, Time and Distance to Climb',
    },
    cruise: {
        src: `${base}charts/{UPPER-ID}-CruisePerfPowerChart.png`,
        alt: '{Display Name} Cruise Performance Best Power chart',
        title: 'Cruise Performance (Best Power)',
    },
    engine: {
        src: `${base}charts/{UPPER-ID}-EnginePerformanceChart.png`,
        alt: '{Display Name} Engine Performance chart',
        title: 'Engine Performance',
    },
    airspeedCal: {
        src: `${base}charts/{UPPER-ID}-AirspeedCalChart.png`,
        alt: '{Display Name} Airspeed Calibration chart',
        title: 'Airspeed Calibration',
    },
},
```

### 8c. Update `src/App.jsx`

Add `<option>` to the aircraft dropdown (after the last existing option):
```jsx
<option value="{id}">{Display Name}</option>
```

If the aircraft has wheel fairings, add its ID to the fairings array:
```jsx
{['pa28-151', 'pa28-161', 'pa28-181', '{id}'].includes(aircraftType) && (
```

---

## Step 9: Create Lookup Chart HTML Files

Three HTML validation charts must be created in `test/` so the user can visually verify that their data points form smooth, correct curves when viewed in the browser (via `npm run dev` and navigating to `/test/{file}.html`).

### 9a. `test/{id}-climb-lookup-chart.html`

Copy the structure from `test/pa28-181-climb-lookup-chart.html` exactly, substituting:
- Page title and `<h1>`: use the display name (e.g., "PA-28-181 Archer II Climb Lookup Table Validation")
- `<p class="subtitle">`: reference the new data file (e.g., "Live data from {id}-climb-data.js")
- The ES module import: `import { climbDistLookup, timeLookup, fuelLookup, yRefLookup } from '../src/lib/{id}-climb-data.js';`
- The `DIST_INTERP`, `TIME_INTERP`, `FUEL_INTERP` sets: set these to `new Set([])` initially (user can annotate later which points were interpolated vs. entered)

### 9b. `test/{id}-cruise-lookup-chart.html`

Copy the structure from `test/pa28-181-cruise-lookup-chart.html` exactly, substituting:
- Title/heading for the new aircraft
- The import: `import { cruiseYRefLookup, cruiseTASLookup, cruiseMaxTAS } from '../src/lib/{id}-cruise-data.js';`

### 9c. `test/{id}-engine-lookup-chart.html`

Copy the structure from `test/pa28-181-engine-lookup-chart.html` exactly, substituting:
- Title/heading for the new aircraft
- The import: `import { yRefLookup, rpmLookup } from '../src/lib/{id}-engine-data.js';`

---

## Step 10: Add Scenario Tests

### 10a. Add to `test/cruise-scenario-test.js`

At the top of the file, add an import for the new aircraft's cruise data:
```js
import * as {camelId}Cruise from '../src/lib/{id}-cruise-data.js';
```

In the `SCENARIOS` array, add a block of scenarios — one per pressure altitude level in the aircraft's cruise yRefLookup, at standard temperature (15°C − 2°C per 1000 ft). Start all expected values as `null` so the test prints computed values for the user to validate against the POH chart:

```js
// {Display Name} — one scenario per PA line at standard temperature
{ name: '{UPPER-ID} — PA     0 / Std  15°C', aircraft: {camelId}Cruise, pa:     0, oat:  15, expected: { yRef: null, tas75: null, tas65: null, tas55: null } },
{ name: '{UPPER-ID} — PA  1000 / Std  13°C', aircraft: {camelId}Cruise, pa:  1000, oat:  13, expected: { yRef: null, tas75: null, tas65: null, tas55: null } },
// ... continue for all PA levels in the aircraft's cruiseYRefLookup
```

Run the test to see computed values, then tell the user to cross-check outputs against their POH chart and fill in known expected values.

### 10b. Add to `test/climb-scenario-test.js`

At the top, add an import:
```js
import * as {camelId}Climb from '../src/lib/{id}-climb-data.js';
```

Add a block of single-PA scenarios (climbing from sea level) covering standard, max, and min temperatures for each PA level. Start all expected values as `null`. For example:

```js
// --- {Display Name} single-PA chart lookup scenarios (from sea level) ---
// PA 0
{ name: '{UPPER-ID} — PA    0 / Std  15°C', aircraft: {camelId}Climb, paStart: 0, tStart: 15, paTarget:    0, tTarget:  15, expected: { time: 0, dist: 0, fuel: 0 } },
{ name: '{UPPER-ID} — PA    0 / Max  40°C', aircraft: {camelId}Climb, paStart: 0, tStart: 15, paTarget:    0, tTarget:  40, expected: { time: 0, dist: 0, fuel: 0 } },
{ name: '{UPPER-ID} — PA    0 / Min -40°C', aircraft: {camelId}Climb, paStart: 0, tStart: 15, paTarget:    0, tTarget: -40, expected: { time: 0, dist: 0, fuel: 0 } },
// PA 1000
{ name: '{UPPER-ID} — PA 1000 / Std  13°C', aircraft: {camelId}Climb, paStart: 0, tStart: 15, paTarget: 1000, tTarget:  13, expected: { time: null, dist: null, fuel: null } },
// ... continue for all PA levels
```

Use the actual min temperature from the aircraft's `yRefLookup` for each PA level rather than -40 if the chart has a narrower temperature range.

Run the scenario test, then ask the user to validate the outputs against their POH climb chart.

---

## Step 10d. Update `test/index.html`

Add a new aircraft card inside the `.grid` div, before the "All Aircraft — Airspeed Calibration" card at the bottom:

```html
  <div class="aircraft-card">
    <div class="aircraft-header">{Display Name}</div>
    <div class="chart-links">
      <div class="chart-row">
        <span class="chart-type-label">Climb</span>
        <a href="{id}-climb-lookup-chart.html">Lookup Table Validation</a>
      </div>
      <div class="chart-row">
        <span class="chart-type-label">Cruise</span>
        <a href="{id}-cruise-lookup-chart.html">Lookup Table Validation</a>
      </div>
      <div class="chart-row">
        <span class="chart-type-label">Engine</span>
        <a href="{id}-engine-lookup-chart.html">Lookup Table Validation</a>
      </div>
    </div>
  </div>
```

---

## Step 11: Build Verification

```bash
cd /workspaces/Code/AVCalc && npm run build 2>&1 | tail -20
```

Fix any import/export errors before reporting done. Then remind the user to:
1. Open the HTML lookup charts in the browser (via the dev server) to visually verify the curves look right
2. Run `node test/cruise-scenario-test.js` and `node test/climb-scenario-test.js` to see computed values, then cross-check a handful against the POH and fill in known expected values

---

## Data Collection Tips

- **Reading yRef values**: The Y-axis reference lines on POH charts are diagonal lines labeled with temperature. Read the Y-position where your pressure altitude line intersects each temperature reference line.
- **Multiple points per altitude**: More points = more accurate interpolation. Capture every reference line visible at each altitude level.
- **yRef=0 anchor**: At the bottom of the chart, there's usually an anchor point where yRef is 0. Make sure to capture this.
- **Consistency**: The yRefLookup tables for climb, cruise, and engine charts are typically different — each chart has its own Y-axis calibration. Don't reuse data across chart types unless the POH uses the same chart for multiple purposes.
- **Missing data**: If the user doesn't have certain data yet (e.g., engine RPM table), create the file with a `// TODO` comment and placeholder structure so the app still compiles.

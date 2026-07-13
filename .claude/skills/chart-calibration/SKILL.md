---
name: chart-calibration
description: Use this skill when calibrating a POH chart image so computed results can be drawn as an accurate trace overlay on top of it, when a trace/lattice looks misaligned on an existing *-trace-overlay.html page, or when adding trace-overlay support for a new chart image. Triggers on phrases like "calibrate this chart", "the trace is off", "the lattice doesn't line up", "add a trace overlay for [chart]", or "why is my line in the wrong place".
---

# Chart Calibration & Trace Overlay

This skill documents how AVCalc draws a calculation's result as a line trace on top of
a scanned POH chart image (e.g. "show me where 5000ft/16°C lands on the printed climb
chart"), and — the harder part — how to *calibrate* a chart image precisely enough that
the trace actually lands on the correct spot. This was built and debugged over many
rounds with a human catching pixel-level errors by eye; the debugging *process* is as
important to preserve as the resulting code, because every new chart image will need it
again.

## Core principle: traces are data-driven, never curve-position-driven

The single most important idea in this whole system: **a trace's every point is
computed from the calc engine (`src/lib/*-calc.js`), in data space (°C, ft, kt, RPM,
yRef...). It never looks at where a curve is drawn in the image.** The only thing that
touches pixels is the *axis calibration* — a mapping from data coordinates to pixel
coordinates, derived once per chart image from the printed axis grid (not from the
curves).

This matters because:
- It's the only way to make this reliable. Asking a vision model to "read a value off
  a chart" by eye fails — that requires sub-pixel judgment models don't have. But
  computing the value from the calc engine and then placing a dot at the *right axis
  position* is just arithmetic once the axis mapping is known.
- It means a drawn trace landing next to (not on) a printed curve is diagnostic, not a
  bug: it's showing you the gap between the digitized lookup-table data and the
  original chart, in the same units, to scale. Don't "fix" a trace to make it hit the
  curve — fix the calibration (if the axes are wrong) or the digitized data (if the
  axes are right and the data is wrong). These are different failure modes and must be
  told apart (see "Two failure modes" below).

## Architecture

```
src/lib/chart-calibration.js     — fitAffine() / dataToPx(): generic 2D affine fit + mapping
src/lib/chart-calibrations.js    — per-chart-image calibration data (the actual anchors)
src/lib/chart-trace.js           — pure builders: calc-engine output -> polylines/dots in DATA space
src/ChartTraceOverlay.jsx        — renders chart <img> + SVG overlay in the app, using the above
test/trace-overlay-common.js/.css — shared helpers for the verification pages
test/<aircraft>-<chart>-trace-overlay.html — one verification page per chart image
scripts/analyze-chart-image.mjs  — dependency-free PNG decoder + gridline detector (the core tool)
scripts/trace-gridline-angle.mjs — precise gridline-angle tracer (least-squares, for skew)
scripts/audit-calibration-pitch.mjs — sanity-checks all calibrations' units-per-gridline
```

### Data flow for one trace point

1. App/test page calls a builder in `chart-trace.js` (e.g. `buildClimbTraces`), passing
   the aircraft's data module and the calibration entry for that chart.
2. The builder calls the calc engine (`getClimbYRef`, `getDist`, `getCruiseTAS`,
   `getEngineRPM`, ...) to get real numbers — yRef, dist, TAS, RPM, whatever the chart's
   axes are.
3. The builder returns `{ id, inputs, polylines: [{panel, points:[{x,y},...]}],
   dots: [{panel, x, y, label}] }` — everything in DATA space, tagged with which panel
   (`oat`, `output`, `tas`, `rpm`, ...) each point belongs to.
4. `ChartTraceOverlay.jsx` (app) or `trace-overlay-common.js`'s `drawTraces()` (test
   pages) fits an affine transform per panel via `fitAffine()` and maps each point to
   pixels via `dataToPx()`, drawing into an SVG whose `viewBox` matches the image's
   *natural* pixel dimensions (so it scales correctly at any display size).

### The calibration data model (`chart-calibrations.js`)

```js
'pa28-161': {
  climb: {                                   // one entry per chart TYPE per aircraft
    image: { width: 2022, height: 1228 },    // natural PNG pixel dimensions
    panels: {
      oat: {                                  // one "panel" per axis-pair on the image
        xRange: [-40, 40],                    // data-space extent (for lattice drawing)
        yRange: [0, 60],
        refPoints: [                          // >=3 (data,px) pairs; fitAffine() least-
          { data: {x:-40,y:0},  px:{x:289.1,y:1132.7} },  // squares fits an affine from these
          { data: {x:40, y:0},  px:{x:794.4,y:1132.7} },
          { data: {x:-40,y:60}, px:{x:289.1,y:361.0} },
          { data: {x:40, y:60}, px:{x:794.4,y:361.0} },
        ],
      },
      output: { ... },                        // second panel, e.g. fuel/time/dist axis
    },
  },
},
```

Most charts have 2 panels side by side on one scanned page (e.g. OAT-vs-yRef on the
left, output-value-vs-yRef on the right) that share the same yRef axis rows but have
independent x-axes — hence separate `refPoints` per panel, all four corners.

**Every anchor's pixel position must be justified in a comment** — which detection
method found it, and what independently cross-checked it. Anchors with no justification
are exactly how the bugs in this doc's "lessons learned" section got in undetected.

## Tools

### `scripts/analyze-chart-image.mjs` — the foundational tool

A dependency-free PNG decoder (manual `node:zlib` inflate + unfilter, no npm packages)
plus a darkness-profile gridline detector. Exports `decodePng`, `profile`, `findPeaks`
for reuse in other scripts (import them, don't shell out), and also runs as a CLI:

```bash
node scripts/analyze-chart-image.mjs <image.png> cols <yBand0> <yBand1> [approxX...]
node scripts/analyze-chart-image.mjs <image.png> rows <xBand0> <xBand1> [approxY...]
```

- `cols`/`rows` selects whether you're finding vertical (column) or horizontal (row)
  gridlines.
- The band arguments say which *perpendicular* pixel range to sum darkness over — e.g.
  for `cols` with band `(220,1080)`, for every column x it computes what fraction of
  pixels in rows 220..1080 at that x are dark, then finds local maxima (`findPeaks`,
  threshold via `MINSTR` env var, default 0.5, lighter scans need ~0.25-0.35).
- With no approx-position arguments, it lists every detected line. With approx
  positions given, it snaps each to the nearest detected line and reports the delta —
  useful for a quick eyeball-vs-detected sanity check, but **not sufficient alone** (see
  lessons below).

**Critical technique: full-height/full-width detection isolates true gridlines from
curve crossings.** A real printed gridline is dark across (nearly) the *entire* panel
height (for a vertical line) or width (for a horizontal one). A diagonal curve crossing
a given column only darkens it over a short local range. So setting the band to span
almost the *whole* panel (not a narrow interior strip) makes true gridlines stand out
as consistently-high-strength peaks while curve crossings wash out. This was the single
biggest accuracy improvement over naively sampling a narrow band.

### `scripts/trace-gridline-angle.mjs` — precise angle/skew tracing

```bash
node scripts/trace-gridline-angle.mjs <image.png> <approxX> <y0> <y1> [sliceHeight=15] [searchRadius=12]
```

Slices the panel height into many thin bands (default 15px), finds the peak near
`approxX` in each slice (tracking a moving target, so it follows a sloped line), then
least-squares fits `x = m·y + b` across all slices. Reports the fitted position at `y0`
and `y1` plus the fit's RMS residual (should be well under 1-2px for a real gridline).

Use this whenever a chart's grid might be rotated/skewed relative to the image
(scanned pages very often are, by a fraction of a degree) — see "Lesson: scans can be
skewed" below. If the residual is unexpectedly high (a few px) or the slope doesn't
match neighboring lines' slopes, **lower `searchRadius`** — a wide radius can let the
tracker wander onto a nearby curve partway through and corrupt the fit; a tight radius
that still finds >30 points and gets a clean sub-1px residual is more trustworthy than
a wide one with a suspicious result.

### `scripts/audit-calibration-pitch.mjs` — systemic sanity check

Runs after every calibration change. For each panel, measures the actual printed
gridline pitch (again via full-height/width detection) and compares
`pitch / pxPerDataUnit` against a list of "clean" human-friendly ratios (1, 2, 2.5, 5,
10, 20, ..., plus unit-conversion ratios like 5.556 for a 10°F gridline expressed in
°C). Flags `*** SUSPECT` when the nearest clean ratio is more than ~6% off.

**This check is necessary but not sufficient** — see the lessons below for exactly
which class of bug it cannot catch (a uniform anchor offset by whole gridlines still
produces a "clean" pitch ratio). Never treat an "ok" from this script as proof of
correctness on its own; it only rules out gross scale errors.

## Step-by-step: calibrating a new chart image

1. **View the image directly** (`Read` tool on the PNG). Note the axis ranges, units,
   any dual-unit axes (e.g. °F primary with a °C secondary scale, or MPH with a KTS
   ruler), and whether there's a printed worked example (text box with concrete
   input/output numbers, and/or dashed annotation lines with arrows on the chart
   itself).
2. **Full-height/width detection** for each axis (see tool section above) to get a
   clean list of true gridline positions and the dominant pitch.
3. **Identify which detected line is which data value.** Do not assume — this is where
   most bugs happened. Use at least one of:
   - **Direct label cross-check**: crop the image with candidate pixel positions
     marked as dashed lines burned into the image, then `Read` the crop and visually
     confirm the dashed marker lands on the correct printed digit label (see "Lesson:
     off-by-one-gridline" below for why *this specific check*, not just "lands on
     some gridline", is required).
   - **Interval counting**: count the total number of detected gridlines between two
     known-good anchors (e.g. frame borders) and check it divides evenly into a clean
     data range.
   - **Printed worked example cross-check**: if the chart has a textual example (e.g.
     "Cruise pressure altitude: 5000 ft, Cruise OAT: 16°C, ... 122.5 KTS"), compute the
     expected axis values yourself using the calc engine (`getClimbYRef`,
     `getCruiseYRef`/`getCruiseTAS`, `getEngineYRef`/`getEngineRPM`, ...) with those
     exact inputs, then check that value's position (or its annotation dash row/column,
     often found in the empty gap *between* two panels, away from grid clutter) matches
     your hypothesis.
4. **Check for skew.** Trace at least two well-separated gridlines per panel across the
   full height with `trace-gridline-angle.mjs`. If the fitted slope is non-negligible
   (more than a fraction of a px per 100px of height) and consistent across multiple
   traced lines in that panel, the scan is rotated/sheared — build the panel's
   `refPoints` from the *extrapolated* per-line fits at the true top/bottom frame rows,
   not from a single shared x for both rows (see "Lesson: scans can be skewed" below).
   Note the skew can differ *per panel* on the same page (each printed grid may have
   its own slight misalignment) — don't assume one global rotation applies everywhere.
5. **Write the calibration entry** in `chart-calibrations.js` with a comment explaining
   how each anchor was derived and cross-checked (method + numeric evidence, e.g. "RMS
   residual 0.38px" or "matches printed label within 1px, see crop").
6. **Run `audit-calibration-pitch.mjs`** — expect `ok` with a ratio matching a clean
   value (including possible unit-conversion ratios).
7. **Build a verification page** (see below) and inspect it yourself before handing it
   back for human review — check the lattice against the print, the digitized curves
   against the print, and the "points depicted" readout against your hand-computed
   expected values.
8. **Still expect the human reviewer to catch things you didn't.** Every one of the
   lessons below was caught by a human looking at the rendered page or doing simple
   arithmetic on the reported dot values, after this same process had already been
   followed. Treat their correction as a search for *which* systematic error class
   applies, not a one-off pixel nudge.

## Lessons learned (each of these was a real bug, found and fixed this way)

### 1. Matching "a" detected gridline is not matching "the right" gridline

Early calibrations verified an anchor by checking it landed on *some* real full-height
detected line. That's necessary but not sufficient: if every gridline is evenly spaced,
an anchor can be **exactly one gridline off** (a systematic shift) and still land
precisely on a true line — the pitch/spacing check passes, nothing looks "noisy," and
it's still wrong by a full gridline's worth of data value.

This happened twice: PA-28-161's engine RPM axis (2200 anchored at what was actually
2250) and PA-28-181's engine RPM axis (2200 anchored at what was actually 2250, same
off-by-one-line class of error). Both were caught only when a human read the actual
printed digit label position and compared by eye — not by any pitch/consistency check.

**Fix / prevention**: independently verify against the actual printed label (crop with
candidate positions marked, visually confirm alignment against the digit glyphs — not
just against "a" gridline), or against multiple independent printed landmarks (e.g.
three different labels, all consistent with one hypothesis and not another).

### 2. Assumed frame extents can be wrong even when internally self-consistent

Several PA-28-151 charts (climb, cruise, engine) were calibrated assuming the chart's
top grid frame corresponded to that aircraft's own maximum digitized yRef value (24).
The actual printed grid — same physical template used across all charts in this POH —
goes to yRef 28, with the digitized data simply not using the top of the available
range. The *pixel positions* of the frame borders were already correct; only the
*data-value label* assigned to the top frame was wrong.

**Fix / prevention**: don't assume the chart's frame matches your dataset's own max
value. Independently count total gridline intervals across the whole frame height
(full-width row detection) and cross-check with the chart's own printed worked example
via the calc engine (see step 3 above) — the annotation dash row's *predicted* pixel
position under each hypothesis should match measurement to ~1px only for the correct
one.

### 3. Scans can be genuinely skewed/rotated — don't assume vertical/horizontal

All three PA-28-151 charts had a small, real, per-panel rotation (roughly 0.003-0.011
px of horizontal shift per pixel of height, i.e. a small fraction of a degree) that had
been silently discarded because gridline x-positions were found by averaging darkness
over a *wide* height band (which finds one x per column-sum, not the true position at
any specific height) and then reused as-is for both the top and bottom frame rows —
building a perfect, unrotated rectangle that didn't match the slightly-rotated print.

Symptom as reported by a human reviewer: the calibration lattice's vertical lines
"slanted slightly to the left at the bottom, and to the right at the top" compared to
the actual chart image. That specific description — opposite-direction lean at top vs.
bottom — is the signature of exactly this bug class (an unrotated overlay compared
against a genuinely rotated print).

**Fix / prevention**: use `trace-gridline-angle.mjs` to fit each gridline's true
`x = m·y + b` across many slices spanning the full panel height, then extrapolate to
the exact top-frame-row and bottom-frame-row y-pixel values to get two *different*
x-positions for the same data-x value (not one shared value). Do this per panel, since
different panels on the same scanned page can have measurably different skew.

### 4. Watch for the tracer itself wandering onto a curve

While chasing lesson 3's fix, one traced line (151 engine's 100°F gridline) came back
with a near-zero slope and a conspicuously higher residual than its sibling lines on
the same panel — inconsistent with the other lines' consistent ~0.003-0.005 slope.
Re-running with a tighter `searchRadius` (6px instead of the default 12px) fixed it:
the wide radius had let the per-slice peak search latch onto a nearby curve for part of
the height range, corrupting the fit.

**Fix / prevention**: when one traced line's slope or residual is an outlier compared
to other lines measured on the *same* panel (which should have similar, though not
necessarily identical, skew), don't trust it blindly — re-run with a smaller radius and
confirm the result stabilizes and matches its siblings' general magnitude.

### 5. A trace landing off a printed curve can be a *data* problem, not calibration

On PA-28-181's climb chart, the digitized `climbDistLookup`'s last point (`dist: 68.0`
at `yRef: 28`) required a pixel position *past the chart's own printed frame* — a
strong signal the calibration's frame-edge measurement was right and the *digitized
data point* was the thing that was wrong (confirmed by cropping the actual top-right
corner of the scan and observing the printed curve terminates essentially exactly at
the frame corner, not beyond it). The value was corrected from 68.0 to 64.0 directly in
`pa28-181-climb-data.js` — a data fix, not a calibration fix.

**Fix / prevention**: when a drawn point or digitized-curve endpoint falls outside the
chart's own printed grid extent (which you can measure independently), suspect the
*data*, not the calibration — especially if the calibration's frame edges are otherwise
well cross-validated. Don't "extend" or fudge the calibration's range to accommodate an
out-of-bounds data point.

### 6. Give the human a "what is this line actually claiming" readout

Trace dots alone (little colored circles on an image) are hard to audit visually to
the precision needed to catch the above bugs. `chart-trace.js`'s builders attach a
`label` and echo their `inputs` on every trace/dot; `trace-overlay-common.js`'s
`renderTracePoints()` renders these as plain "value on this axis, this panel" text
under the image. This is what makes it *possible* for a human reviewer to say "you
placed 2242.3 at a pixel matching 2390" instead of just "that dot looks off" — always
keep this readout present and accurate when adding a new trace builder or chart.

## Verification page pattern (`test/*-trace-overlay.html`)

Each page (see `test/pa28-161-climb-trace-overlay.html` for the canonical example, or
the shared helpers' usage in any sibling `*-trace-overlay.html`) does, using
`test/trace-overlay-common.js`:

1. `setupStage()` — points the chart `<img>` at `public/charts/<file>.png` and sizes an
   overlay `<svg>` to the image's natural pixel dimensions.
2. `fitPanels()` — fits every panel's affine transform and reports each one's RMS
   residual (should be near-zero for a well-anchored panel — a few points essentially
   always fit an affine almost exactly; the residual matters most when a panel has
   more refPoints than the minimum, e.g. the smoothed noisy-tick cases).
3. `drawLattice()` — draws a red reference grid at a chosen step size in *data* units,
   through the calibration, on top of the real image. Misalignment against the printed
   grid is the primary tuning signal.
4. Draws every digitized curve (`addPolyline`) from the aircraft's data module through
   the same calibration — this doubles as a data-quality check (a correctly-calibrated
   chart with correct data draws its curves exactly on the print).
5. `drawTraces()` — draws an example calculation (using the chart's own printed worked
   example inputs where available, so the trace should match the chart's own printed
   annotation arrows) plus `renderTracePoints()` for the plain-text audit trail (lesson
   6 above).
6. `installClickReadout()` — click anywhere on the image to read natural-pixel
   coordinates, for finding new anchor candidates by hand.

When adding a new chart image's page, copy an existing one of the same chart type
(climb/cruise/engine/airspeedCal — the generator pattern in earlier work built the
cruise/engine pages from one parameterized template) and update the aircraft id, image
filename, data import, and the worked-example inputs.

## Extending to a new chart or aircraft

1. Calibrate per the step-by-step section above.
2. Add the calibration entry to `chart-calibrations.js` under the right aircraft/chart
   key, with justification comments.
3. If it's a genuinely new chart *type* (not climb/cruise/engine/airspeedCal), add a
   new builder function to `chart-trace.js` following the existing ones' shape —
   compute everything from the calc engine, tag each point/dot with its `panel`, return
   `[]`/`null` when the input is off-chart rather than drawing something misleading.
4. Wire it into `ChartTraceOverlay.jsx`'s call sites in `App.jsx` if it should appear
   live in the app, gated on `getChartCalibration()` returning non-null so uncalibrated
   charts keep rendering as plain images.
5. Add the verification page and link it from `test/index.html`.
6. Run `audit-calibration-pitch.mjs`, then get a human to actually look at the page —
   this skill exists because that step keeps finding real bugs.

// Per-chart-image calibration anchors: reference points pairing known chart data
// coordinates with pixel coordinates in the image's NATURAL resolution.
//
// IMPORTANT: each entry is bound to the exact PNG it was calibrated against
// (public/charts/*). Replacing or re-scanning an image invalidates its entry.
// Verify/tune anchors with the matching test page (test/*-trace-overlay.html),
// which draws a reference lattice and the digitized curves through this
// calibration on top of the actual image — misalignment is immediately visible.
//
// Panel notes for pa28-161 climb (PA28-161-ClimbPerformanceChart.png, 2022x1228):
// - The printed grid is one continuous lattice spanning both panels; yRef 0 is the
//   bottom frame line. The digitized data clips at yRef 60, which sits at the 12th
//   major gridline up — NOT the top border of the grid (the grid continues above
//   the usable curve area, behind the title boxes).
// - Pixel values below are initial estimates from image inspection, tuned via the
//   test page. Treat them as calibration data, not derived values.

// Anchor pixel positions below were measured with scripts/analyze-chart-image.mjs
// (gridline detection via darkness profiles), then cross-validated against printed
// landmarks (curve endpoints at known data values, worked-example arrows). Where an
// axis's detected ticks were noisy (curves crossing the detection band), more than
// 4 refPoints are provided and the least-squares fit in fitAffine() smooths them.
const CALIBRATIONS = {
    'pa28-151': {
        // PA28-151-CruisePerformanceChart.png. °F-primary OAT axis (°C anchors at
        // -20 °F / 100 °F). Y-axis: top frame = yRef 28, not 24 (see climb
        // comment). SKEW CORRECTED (see climb comment for method): each anchor
        // traced across ~37 height slices and least-squares fit, sub-1.3px
        // residuals throughout.
        cruise: {
            image: { width: 973, height: 1305 },
            panels: {
                oat: {
                    xRange: [-28.9, 37.8],
                    yRange: [0, 28],
                    refPoints: [
                        { data: { x: -28.9, y: 0 },  px: { x: 63.27,  y: 805.0 } },
                        { data: { x: 37.8,  y: 0 },  px: { x: 312.43, y: 805.0 } },
                        { data: { x: -28.9, y: 28 }, px: { x: 59.93,  y: 220.3 } },
                        { data: { x: 37.8,  y: 28 }, px: { x: 308.67, y: 220.3 } },
                    ],
                },
                tas: {
                    xRange: [88, 122],
                    yRange: [0, 28],
                    refPoints: [
                        { data: { x: 90,  y: 0 },  px: { x: 566.22, y: 805.0 } },
                        { data: { x: 120, y: 0 },  px: { x: 817.11, y: 805.0 } },
                        { data: { x: 90,  y: 28 }, px: { x: 559.81, y: 220.3 } },
                        { data: { x: 120, y: 28 }, px: { x: 811.75, y: 220.3 } },
                    ],
                },
            },
        },
        // PA28-151-EnginePerformanceChart.png. Y-AXIS CORRECTED: grid top frame
        // is yRef 28, not 24 (same mis-assumption as climb/cruise). Confirmed by
        // full-width row detection (28 consistent intervals, pixel endpoints
        // 241.0/851.1 essentially unchanged) and cross-checked against the
        // printed example (5000ft/60°F -> yRef 11.83, RPM 2632 vs chart's
        // printed 2645 — within normal digitization tolerance). SKEW CORRECTED
        // (see climb comment for method). RPM panel's four interior anchors
        // (2300/2400/2500/2600) are linearly interpolated between the precisely
        // traced 2200/2700 endpoints at each row — the underlying scan distortion
        // is smooth/continuous across the panel width, and label positions
        // already independently confirmed those six values are correct.
        engine: {
            image: { width: 937, height: 1302 },
            panels: {
                oat: {
                    xRange: [-28.9, 37.8],
                    yRange: [0, 28],
                    refPoints: [
                        { data: { x: -28.9, y: 0 },  px: { x: 30.82, y: 851.1 } },
                        { data: { x: 37.8,  y: 0 },  px: { x: 291.35, y: 851.1 } },
                        { data: { x: -28.9, y: 28 }, px: { x: 28.81, y: 241.0 } },
                        { data: { x: 37.8,  y: 28 }, px: { x: 289.54, y: 241.0 } },
                    ],
                },
                rpm: {
                    xRange: [2150, 2700],
                    yRange: [0, 28],
                    refPoints: [
                        { data: { x: 2200, y: 0 },  px: { x: 425.13, y: 851.1 } },
                        { data: { x: 2300, y: 0 },  px: { x: 512.68, y: 851.1 } },
                        { data: { x: 2400, y: 0 },  px: { x: 600.23, y: 851.1 } },
                        { data: { x: 2500, y: 0 },  px: { x: 687.78, y: 851.1 } },
                        { data: { x: 2600, y: 0 },  px: { x: 775.33, y: 851.1 } },
                        { data: { x: 2700, y: 0 },  px: { x: 862.88, y: 851.1 } },
                        { data: { x: 2200, y: 28 }, px: { x: 422.79, y: 241.0 } },
                        { data: { x: 2300, y: 28 }, px: { x: 510.23, y: 241.0 } },
                        { data: { x: 2400, y: 28 }, px: { x: 597.68, y: 241.0 } },
                        { data: { x: 2500, y: 28 }, px: { x: 685.12, y: 241.0 } },
                        { data: { x: 2600, y: 28 }, px: { x: 772.57, y: 241.0 } },
                        { data: { x: 2700, y: 28 }, px: { x: 860.01, y: 241.0 } },
                    ],
                },
            },
        },
        // PA28-151-AirspeedCalChart.png. Single panel, KTS axes 40-180 both ways
        // (x = IAS, y = CAS). The grid extends above the 180 label; anchors are the
        // frame lines (IAS 40 left / 180 right, CAS 40 bottom) plus the detected
        // CAS-180 gridline.
        airspeedCal: {
            image: { width: 879, height: 1222 },
            panels: {
                cal: {
                    xRange: [40, 180],
                    yRange: [40, 180],
                    refPoints: [
                        { data: { x: 40,  y: 40 },  px: { x: 168.0, y: 974.0 } },
                        { data: { x: 180, y: 40 },  px: { x: 727.6, y: 974.0 } },
                        { data: { x: 40,  y: 180 }, px: { x: 168.0, y: 419.0 } },
                        { data: { x: 180, y: 180 }, px: { x: 727.6, y: 419.0 } },
                    ],
                },
            },
        },
        // PA28-151-ClimbPerformanceChart.png. Primary OAT axis is °F; our data is
        // °C, so anchors use the °C-exact °F gridlines: -28.9 °C = -20 °F (left
        // frame) and 37.8 °C = 100 °F. Output axis: values 20/40 (2.5-unit minor
        // gridlines, confirmed earlier). Y-AXIS: top frame = yRef 28 (see prior
        // note — mis-assumed 24 originally). SKEW CORRECTED: the scan is rotated
        // a small, real amount — user-caught (calibration lattice visibly slanted
        // vs. the print). Each anchor's pixel position was previously the SAME
        // for both frame rows (assumed perfectly vertical gridlines); re-measured
        // by tracing each gridline's actual x-position across ~39 height slices
        // and least-squares fitting x=m*y+b (sub-1px residuals) — this is a
        // per-panel skew (~0.003 px_x/px_y on oat, ~0.006 on output; NOT a single
        // global rotation, each panel's own affine transform captures its own).
        climb: {
            image: { width: 969, height: 1314 },
            panels: {
                oat: {
                    xRange: [-28.9, 37.8],
                    yRange: [0, 28],
                    refPoints: [
                        { data: { x: -28.9, y: 0 },  px: { x: 60.93, y: 863.0 } },
                        { data: { x: 37.8,  y: 0 },  px: { x: 321.83, y: 863.0 } },
                        { data: { x: -28.9, y: 28 }, px: { x: 58.99, y: 251.0 } },
                        { data: { x: 37.8,  y: 28 }, px: { x: 319.93, y: 251.0 } },
                    ],
                },
                output: {
                    xRange: [0, 55],
                    yRange: [0, 28],
                    refPoints: [
                        { data: { x: 20, y: 0 },  px: { x: 632.16, y: 863.0 } },
                        { data: { x: 40, y: 0 },  px: { x: 808.51, y: 863.0 } },
                        { data: { x: 20, y: 28 }, px: { x: 628.93, y: 251.0 } },
                        { data: { x: 40, y: 28 }, px: { x: 804.50, y: 251.0 } },
                    ],
                },
            },
        },
    },
    'pa28-161': {
        // PA28-161-CruisePerfPowerChart.png. °C-primary OAT axis. yRef 0-80 spans
        // bottom frame to top frame at exactly 14.0 px/unit (16 majors x 5); the
        // printed example dash (5000 ft / 16 °C -> yRef 28, per the data file's own
        // calibration comment) was detected at exactly the yRef-28 row. TAS ticks
        // carry ~±5 px scan jitter, smoothed by least squares over all five.
        cruise: {
            image: { width: 2236, height: 1361 },
            panels: {
                oat: {
                    xRange: [-40, 40],
                    yRange: [0, 80],
                    refPoints: [
                        { data: { x: -40, y: 0 },  px: { x: 368.5, y: 1242.0 } },
                        { data: { x: 0,   y: 0 },  px: { x: 648.1, y: 1242.0 } },
                        { data: { x: 40,  y: 0 },  px: { x: 927.9, y: 1242.0 } },
                        { data: { x: -40, y: 80 }, px: { x: 368.5, y: 122.0 } },
                        { data: { x: 0,   y: 80 }, px: { x: 648.1, y: 122.0 } },
                        { data: { x: 40,  y: 80 }, px: { x: 927.9, y: 122.0 } },
                    ],
                },
                // TAS axis: 1 kt per printed line, 14.14 px/kt. Anchored on the
                // gridline at the printed "90" label (1348.0, crop-verified) and
                // a user-verified reading: pixel column 1793.4 sits at printed
                // 121.5 kt. This scale matches the measured line pitch (14.0-14.1)
                // and puts the full-throttle curve's foot (data: 126 kt) at 1857.
                // History: v1 anchored on %-power-line crossings (11.7 px/kt);
                // v2 anchored the example drop at a detection (1801.9) that was
                // ~0.4 kt off — the drop's true position is ~1807.5.
                tas: {
                    xRange: [88, 132],
                    yRange: [0, 80],
                    refPoints: [
                        { data: { x: 90,    y: 0 },  px: { x: 1348.0, y: 1242.0 } },
                        { data: { x: 121.5, y: 0 },  px: { x: 1793.4, y: 1242.0 } },
                        { data: { x: 90,    y: 80 }, px: { x: 1348.0, y: 122.0 } },
                        { data: { x: 121.5, y: 80 }, px: { x: 1793.4, y: 122.0 } },
                    ],
                },
            },
        },
        // PA28-161-EnginePerformanceChart.png. Same yRef 0-80 frame-to-frame
        // convention as the cruise chart (yRef = 1 minor gridline, 11.3 px).
        engine: {
            image: { width: 1874, height: 1093 },
            panels: {
                oat: {
                    xRange: [-40, 40],
                    yRange: [0, 80],
                    refPoints: [
                        { data: { x: -40, y: 0 },  px: { x: 372.3, y: 1018.4 } },
                        { data: { x: 0,   y: 0 },  px: { x: 597.6, y: 1018.4 } },
                        { data: { x: 40,  y: 0 },  px: { x: 824.6, y: 1018.4 } },
                        { data: { x: -40, y: 80 }, px: { x: 372.3, y: 111.8 } },
                        { data: { x: 0,   y: 80 }, px: { x: 597.6, y: 111.8 } },
                        { data: { x: 40,  y: 80 }, px: { x: 824.6, y: 111.8 } },
                    ],
                },
                // RPM axis: 10 RPM per printed line, thicker lines at the 100s.
                // User-verified correction: earlier anchors (2400->1291, 2600->
                // 1519.8) had each snapped one line RIGHT of the labeled lines,
                // drawing every RPM value ~10 high on the grid. Corrected anchors
                // put 2600 on the detected line at 1507.8, consistent with the
                // strong 2700 line at 1623.0 (all three least-squared).
                rpm: {
                    xRange: [2150, 2700],
                    yRange: [0, 80],
                    refPoints: [
                        { data: { x: 2200, y: 0 },  px: { x: 1051.3, y: 1018.4 } },
                        { data: { x: 2600, y: 0 },  px: { x: 1507.8, y: 1018.4 } },
                        { data: { x: 2700, y: 0 },  px: { x: 1623.0, y: 1018.4 } },
                        { data: { x: 2200, y: 80 }, px: { x: 1051.3, y: 111.8 } },
                        { data: { x: 2600, y: 80 }, px: { x: 1507.8, y: 111.8 } },
                        { data: { x: 2700, y: 80 }, px: { x: 1623.0, y: 111.8 } },
                    ],
                },
            },
        },
        // PA28-161-AirspeedCalChart.png. Single panel, KTS axes 40-180 both ways.
        // The CAS-180 row pixel (421.0) is derived from the detected bottom frame
        // and minor-grid pitch rather than directly detected — tune on its page if
        // the horizontal lattice looks shifted.
        airspeedCal: {
            image: { width: 739, height: 1186 },
            panels: {
                cal: {
                    xRange: [40, 180],
                    yRange: [40, 180],
                    refPoints: [
                        { data: { x: 40,  y: 40 },  px: { x: 123.5, y: 928.5 } },
                        { data: { x: 180, y: 40 },  px: { x: 633.5, y: 928.5 } },
                        { data: { x: 40,  y: 180 }, px: { x: 123.5, y: 421.0 } },
                        { data: { x: 180, y: 180 }, px: { x: 633.5, y: 421.0 } },
                    ],
                },
            },
        },
        // PA28-161-ClimbPerformanceChart.png. Grid pitch is ~12.9 px/line in both
        // directions; yRef = printed line count (1/line), output axis = 2 units/
        // line. y anchored on the bottom frame (yRef 0, full-width row detection:
        // 1132.65-1132.7, matches prior anchor) and printed gridline 28, counted
        // up from that same bottom frame through a clean, gap-free, evenly-spaced
        // (~12.5-14.3px) sequence of 34 full-width-detected horizontal lines —
        // lands at y=781.25, not the previously anchored 775.1 (roughly half a
        // gridline higher: 775.1 sits in the trough between real lines 28
        // (781.25) and 29 (767.95), which had been silently pulling every yRef
        // in both panels ~half a line high). Independently confirmed against the
        // printed CRUISE ALTITUDE example (5000 ft / 16 °C -> yRef 28 via
        // getClimbYRef) and against left/right-half row detection agreeing to
        // ~1px (no meaningful skew in this panel). Output x anchored on the
        // printed 0 tick and the 80 line at the panel's right frame (1688.0) —
        // an earlier anchor mistakenly snapped to the page sidebar rule at
        // ~1988, which stretched all output values rightward.
        climb: {
            image: { width: 2022, height: 1228 },
            panels: {
                oat: {
                    xRange: [-40, 40],
                    yRange: [0, 60],
                    refPoints: [
                        { data: { x: -40, y: 0 },  px: { x: 289.1, y: 1132.7 } },
                        { data: { x: 40,  y: 0 },  px: { x: 794.4, y: 1132.7 } },
                        { data: { x: -40, y: 28 }, px: { x: 289.1, y: 781.25 } },
                        { data: { x: 40,  y: 28 }, px: { x: 794.4, y: 781.25 } },
                    ],
                },
                output: {
                    xRange: [0, 80],
                    yRange: [0, 60],
                    refPoints: [
                        { data: { x: 0,  y: 0 },  px: { x: 1177.5, y: 1132.7 } },
                        { data: { x: 80, y: 0 },  px: { x: 1688.0, y: 1132.7 } },
                        { data: { x: 0,  y: 28 }, px: { x: 1177.5, y: 781.25 } },
                        { data: { x: 80, y: 28 }, px: { x: 1688.0, y: 781.25 } },
                    ],
                },
            },
        },
    },
    'pa28-181': {
        // PA28-181-CruisePerfPowerChart.png. °F-primary OAT + MPH-primary TAS with
        // KTS rulers; our data is °C/KTS. TAS majors are 2.5 MPH (validated by the
        // full-throttle curve foot at 127.7 kt = 147 MPH landing on the printed
        // "100" MPH line origin); KTS refPoints below are the 100/140 MPH lines
        // expressed in knots. yRef 0-28 spans bottom to top frame (validated by
        // the 55%-power line endpoints at 91.5 kt / 109 kt).
        cruise: {
            image: { width: 1970, height: 1654 },
            panels: {
                oat: {
                    xRange: [-28.9, 37.8],
                    yRange: [0, 28],
                    refPoints: [
                        { data: { x: -28.9, y: 0 },  px: { x: 99.0,  y: 1407.0 } },
                        { data: { x: 37.8,  y: 0 },  px: { x: 643.9, y: 1407.0 } },
                        { data: { x: -28.9, y: 28 }, px: { x: 99.0,  y: 174.1 } },
                        { data: { x: 37.8,  y: 28 }, px: { x: 643.9, y: 174.1 } },
                    ],
                },
                // 100 MPH (86.90 kt) matches a full-height-detected line exactly
                // at 1003.5. Minor gridline pitch measured at ~44.9px = 2.5 MPH
                // (2.172 kt); counting 16 minor lines forward (=40 MPH=140 MPH)
                // lands on the detected line at 1722.6, not the previously
                // anchored 1726.7 (a small ~4px anchor-identification error,
                // same class of bug as 161 cruise's TAS axis).
                tas: {
                    xRange: [88, 130],
                    yRange: [0, 28],
                    refPoints: [
                        { data: { x: 86.90,  y: 0 },  px: { x: 1003.5, y: 1407.0 } },
                        { data: { x: 121.68, y: 0 },  px: { x: 1722.6, y: 1407.0 } },
                        { data: { x: 86.90,  y: 28 }, px: { x: 1003.5, y: 174.1 } },
                        { data: { x: 121.68, y: 28 }, px: { x: 1722.6, y: 174.1 } },
                    ],
                },
            },
        },
        // PA28-181-EnginePerformanceChart.png. yRef 0-28 bottom-to-top frame
        // (yRef = 1 minor gridline, ~17.3 px). All three axes (oat, rpm, yRef)
        // re-verified via full-height/full-width true-gridline detection
        // (isolating lines dark across the whole panel from the diagonal power
        // lines, which only darken a column/row locally) — every anchor below
        // lands within 0.3px of a detected true gridline. An earlier narrow-band
        // tick-detection pass had flagged the RPM axis as noisy/low-confidence;
        // that concern doesn't hold up under this more reliable method.
        engine: {
            image: { width: 858, height: 1137 },
            panels: {
                oat: {
                    xRange: [-28.9, 37.8],
                    yRange: [0, 28],
                    refPoints: [
                        { data: { x: -28.9, y: 0 },  px: { x: 87.4,  y: 696.5 } },
                        { data: { x: 37.8,  y: 0 },  px: { x: 300.5, y: 696.5 } },
                        { data: { x: -28.9, y: 28 }, px: { x: 87.4,  y: 212.8 } },
                        { data: { x: 37.8,  y: 28 }, px: { x: 300.5, y: 212.8 } },
                    ],
                },
                // RPM axis, corrected: user caught the drawn dot landing ~1
                // gridline (50 RPM) too far right. The previous anchors (492.5,
                // 632.7) DID land on true detected gridlines — but on the wrong
                // ones. Cross-checked against three independent printed labels
                // (2000@404.5, 2400@545.5, 2600@615.4, all within ~1px of a
                // detected line at the confirmed 50RPM/17.7px pitch) — 2200 is
                // actually at 474.5, one line left of the old anchor. The "2200"
                // label itself isn't centered under its own tick on this print,
                // which is what made the wrong anchor look plausible up close.
                rpm: {
                    xRange: [2050, 2700],
                    yRange: [0, 28],
                    refPoints: [
                        { data: { x: 2200, y: 0 },  px: { x: 474.5, y: 696.5 } },
                        { data: { x: 2600, y: 0 },  px: { x: 615.4, y: 696.5 } },
                        { data: { x: 2200, y: 28 }, px: { x: 474.5, y: 212.8 } },
                        { data: { x: 2600, y: 28 }, px: { x: 615.4, y: 212.8 } },
                    ],
                },
            },
        },
        // PA28-181-AirspeedCalChart.png. TWO sub-charts on one page: top = wing
        // flaps 40° (MPH axes 60-120), bottom = flaps 0°/up (MPH axes 60-150),
        // each with KTS rulers. Calibrated in KTS (how the app consumes the data):
        // 60 MPH = 52.14 kt, 120 MPH = 104.27 kt, 150 MPH = 130.35 kt.
        // DATA-QUALITY FLAG: the digitized pairs in airspeedcal-data.js match MPH
        // readings of this chart 1:1 (e.g. 100->100, 130->127) but are labeled and
        // consumed as knots — the overlay will show the digitized curves offset
        // from the printed ones. See FlightPlanner review discussion before
        // "fixing" either the data or this calibration.
        airspeedCal: {
            image: { width: 932, height: 1263 },
            panels: {
                flapsUp: {
                    xRange: [52.14, 130.35],
                    yRange: [52.14, 130.35],
                    refPoints: [
                        { data: { x: 52.14,  y: 52.14 },  px: { x: 239.5, y: 1043.0 } },
                        { data: { x: 130.35, y: 52.14 },  px: { x: 591.5, y: 1043.0 } },
                        { data: { x: 52.14,  y: 130.35 }, px: { x: 239.5, y: 694.0 } },
                        { data: { x: 130.35, y: 130.35 }, px: { x: 591.5, y: 694.0 } },
                    ],
                },
                flaps40: {
                    xRange: [52.14, 104.27],
                    yRange: [52.14, 104.27],
                    refPoints: [
                        { data: { x: 52.14,  y: 52.14 },  px: { x: 295.0, y: 581.5 } },
                        { data: { x: 104.27, y: 52.14 },  px: { x: 528.5, y: 581.5 } },
                        { data: { x: 52.14,  y: 104.27 }, px: { x: 295.0, y: 349.4 } },
                        { data: { x: 104.27, y: 104.27 }, px: { x: 528.5, y: 349.4 } },
                    ],
                },
            },
        },
        // PA28-181-ClimbPerformanceChart.png. Same °F-primary/°C-data convention
        // as the 151 (-28.9 °C = -20 °F left frame, 37.8 °C = 100 °F). Grid top
        // frame = yRef 28 (validated by fuel/time curve endpoints). Output-axis
        // ticks were noisy under the curve bundle, so all four detected ticks are
        // given per frame row and least-squares smooths them.
        climb: {
            image: { width: 1566, height: 1336 },
            panels: {
                oat: {
                    xRange: [-28.9, 37.8],
                    yRange: [0, 28],
                    refPoints: [
                        { data: { x: -28.9, y: 0 },  px: { x: 57.0,  y: 1130.9 } },
                        { data: { x: 37.8,  y: 0 },  px: { x: 490.1, y: 1130.9 } },
                        { data: { x: -28.9, y: 28 }, px: { x: 57.0,  y: 147.0 } },
                        { data: { x: 37.8,  y: 28 }, px: { x: 490.1, y: 147.0 } },
                    ],
                },
                // Output axis: minor gridline = 2.5 data units, NOT the 2 or 5
                // guessed earlier. Full-height line detection (isolating true
                // vertical gridlines from diagonal curve crossings, which only
                // darken a column locally) found 25 evenly-spaced lines from the
                // "0" frame out to a line at x=1419.6, and 0/20/40/60 all land
                // exactly on detected lines at that pitch (indices 0/8/16/24).
                // The prior anchors (20->886.5, 30->1061.4, 50->1382.9) were
                // mutually inconsistent guesses — they implied 5.83 px/unit
                // between 20-30 but 16.08 px/unit between 30-50 — which is what
                // caused the plotted trace to drift further right of the
                // printed value as the output value increased.
                output: {
                    xRange: [0, 65],
                    yRange: [0, 28],
                    refPoints: [
                        { data: { x: 0,  y: 0 },  px: { x: 561.6,  y: 1130.9 } },
                        { data: { x: 20, y: 0 },  px: { x: 849.5,  y: 1130.9 } },
                        { data: { x: 40, y: 0 },  px: { x: 1134.0, y: 1130.9 } },
                        { data: { x: 60, y: 0 },  px: { x: 1419.6, y: 1130.9 } },
                        { data: { x: 0,  y: 28 }, px: { x: 561.6,  y: 147.0 } },
                        { data: { x: 20, y: 28 }, px: { x: 849.5,  y: 147.0 } },
                        { data: { x: 40, y: 28 }, px: { x: 1134.0, y: 147.0 } },
                        { data: { x: 60, y: 28 }, px: { x: 1419.6, y: 147.0 } },
                    ],
                },
            },
        },
    },
};

/*
 * getChartCalibration(aircraftType, chartType)
 * Intent: Look up the calibration entry for one chart image, mirroring the
 *         aircraft-registry indirection pattern. Charts without an entry simply
 *         have no trace overlay (callers must handle null).
 * Params: aircraftType — e.g. 'pa28-161'; chartType — e.g. 'climb'.
 * Returns: calibration object { image, panels } or null if not calibrated.
 */
export function getChartCalibration(aircraftType, chartType) {
    return CALIBRATIONS[aircraftType]?.[chartType] ?? null;
}

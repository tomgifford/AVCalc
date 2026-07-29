// Run with: node test/nav-test.js  (from server/ directory)
import { calculateWindTriangle } from '../src/lib/nav-calc.js';

const TOLERANCE    = 0.5;   // acceptable difference (kt or degrees)
const LARGE_ERROR  = 1.0;   // threshold for LARGE ERROR flag

const SCENARIOS = [
    // Analytically exact cases
    {
        name:        'Direct tailwind — GS = TAS + WS, no crab',
        tas: 100, windDir: 180, windSpeed: 10, trueCourse: 0,
        expTH: 0, expGS: 110, expWCA: 0,
    },
    {
        name:        'Direct headwind — GS = TAS - WS, no crab',
        tas: 100, windDir: 0,   windSpeed: 10, trueCourse: 0,
        expTH: 0, expGS: 90,  expWCA: 0,
    },
    {
        name:        'Crosswind from right — crab right (TH > TC)',
        tas: 100, windDir: 90,  windSpeed: 10, trueCourse: 0,
        expTH: 5.7, expGS: 99.5, expWCA: 5.7,
    },
    {
        name:        'Crosswind from left — crab left (TH < TC)',
        tas: 100, windDir: 270, windSpeed: 10, trueCourse: 0,
        expTH: 354.3, expGS: 99.5, expWCA: -5.7,
    },
    {
        name:        'Zero wind — TH equals TC, GS equals TAS',
        tas: 100, windDir: 0,   windSpeed: 0,  trueCourse: 45,
        expTH: 45, expGS: 100, expWCA: 0,
    },
    {
        // ESE tailwind on WNW course (KMKC→KHDE flight planning scenario).
        // Verified by law-of-cosines and vector decomposition.
        name:        'KMKC→KHDE cruise — ESE tailwind on WNW course',
        tas: 112.7, windDir: 118, windSpeed: 9.3, trueCourse: 291.5,
        expTH: 291, expGS: 121.9, expWCA: -0.5,
    },
    {
        // North course with tailwind from the south at a non-trivial angle
        name:        'Near-tailwind from SSE on northbound course',
        tas: 120, windDir: 160, windSpeed: 15, trueCourse: 0,
        // cos(160°) = -0.9397 → GS ≈ 120 - 15×(-0.9397) = 120 + 14.1 = 134.1
        // sin(160°) = 0.342  → sin(WCA) = 15×0.342/120 = 0.04275 → WCA ≈ 2.45°
        expTH: 2.5, expGS: 134.1, expWCA: 2.5,
    },
];

let passed = 0;
let failed = 0;

console.log('');
console.log('calculateWindTriangle — nav-calc.js');
console.log('─'.repeat(100));
console.log(
    'Scenario'.padEnd(52),
    'TH'.padStart(6), '(exp)'.padStart(7),
    'GS'.padStart(7), '(exp)'.padStart(7),
    'WCA'.padStart(6), '(exp)'.padStart(6),
    '  Result'
);
console.log('─'.repeat(100));

for (const s of SCENARIOS) {
    const { trueHeading, groundSpeed, windCorrectionAngle } =
        calculateWindTriangle(s.tas, s.windDir, s.windSpeed, s.trueCourse);

    // Heading comparison needs wrap-around awareness
    const headingDiff = (h1, h2) => {
        const d = Math.abs(((h1 - h2) + 540) % 360 - 180);
        return d;
    };

    const thErr  = headingDiff(trueHeading, s.expTH);
    const gsErr  = Math.abs(groundSpeed - s.expGS);
    const wcaErr = Math.abs(windCorrectionAngle - s.expWCA);

    const isLarge = thErr > LARGE_ERROR || gsErr > LARGE_ERROR || wcaErr > LARGE_ERROR;
    const isFail  = thErr > TOLERANCE   || gsErr > TOLERANCE   || wcaErr > TOLERANCE;

    const flag = isLarge ? ' ✗ LARGE ERROR' : isFail ? ' ✗ FAIL' : ' ✓';
    if (isFail) failed++; else passed++;

    console.log(
        s.name.substring(0, 51).padEnd(52),
        String(trueHeading.toFixed(1)).padStart(6),
        ('(' + s.expTH + ')').padStart(7),
        String(groundSpeed.toFixed(1)).padStart(7),
        ('(' + s.expGS + ')').padStart(7),
        String(windCorrectionAngle.toFixed(1)).padStart(6),
        ('(' + s.expWCA + ')').padStart(6),
        flag
    );
}

console.log('─'.repeat(100));
console.log(`${passed} passed, ${failed} failed`);
console.log('');

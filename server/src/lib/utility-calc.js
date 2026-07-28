/**
 * Converts True Airspeed (TAS) to Calibrated Airspeed (CAS).
 *
 * @param {number} tasKt - True Airspeed in knots
 * @param {number} pressAltFt - Pressure Altitude in feet (valid below ~36,089 ft / troposphere only)
 * @param {number} oatC - Outside Air Temperature in Celsius
 * @returns {number} Calibrated Airspeed (CAS) in knots
 */
export function convertTasToCas(tasKt, pressAltFt, oatC) {
    const P0 = 29.92126;
    const T0 = 288.15;
    const TAS_TO_FPS = 1.68781;
    const a0 = 1116.45;

    const T = oatC + 273.15;
    const delta = Math.pow(1 - (6.8755856e-6 * pressAltFt), 5.25588);
    const P = P0 * delta;
    const a = a0 * Math.sqrt(T / T0);

    const tasFps = tasKt * TAS_TO_FPS;
    const M = tasFps / a;

    let qc;
    if (M === 0) {
        qc = 0;
    } else {
        qc = P * (Math.pow(1 + 0.2 * M * M, 3.5) - 1);
    }

    let casKt;
    if (qc <= 0) {
        casKt = 0;
    } else {
        const casFps = a0 * Math.sqrt(5 * (Math.pow(qc / P0 + 1, 2 / 7) - 1));
        casKt = casFps / TAS_TO_FPS;
    }

    return casKt;
}

/**
 * Converts Calibrated Airspeed (CAS) to True Airspeed (TAS).
 * Inverse of convertTasToCas using the standard ICAO compressibility formula.
 *
 * @param {number} casKt       - Calibrated Airspeed in knots
 * @param {number} pressAltFt  - Pressure Altitude in feet (troposphere only, below ~36,089 ft)
 * @param {number} oatC        - Outside Air Temperature in Celsius
 * @returns {number} True Airspeed (TAS) in knots
 */
export function convertCasToTas(casKt, pressAltFt, oatC) {
    const P0 = 29.92126;
    const T0 = 288.15;
    const TAS_TO_FPS = 1.68781;
    const a0 = 1116.45;  // speed of sound at SL in fps

    const T = oatC + 273.15;
    const delta = Math.pow(1 - (6.8755856e-6 * pressAltFt), 5.25588);
    const P = P0 * delta;
    const a = a0 * Math.sqrt(T / T0);  // local speed of sound in fps

    // CAS → impact pressure qc
    const casFps = casKt * TAS_TO_FPS;
    const qc = P0 * (Math.pow(1 + 0.2 * Math.pow(casFps / a0, 2), 3.5) - 1);

    // qc + local pressure → Mach
    const M = Math.sqrt(5 * (Math.pow(qc / P + 1, 2 / 7) - 1));

    return (M * a) / TAS_TO_FPS;
}
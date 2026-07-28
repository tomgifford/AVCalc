/**
 * calculateWindTriangle — solves the standard E6B wind triangle.
 *
 * Given an aircraft's true airspeed, wind (direction it blows FROM and speed),
 * and the desired true course, returns the true heading the aircraft must fly
 * and the resulting ground speed.
 *
 * Convention: all directions are degrees true, measured clockwise from north (0–360).
 * windDirDeg is the direction the wind comes FROM (standard aviation convention).
 *
 * @param {number} tas          - True airspeed (knots)
 * @param {number} windDirDeg   - Wind direction, FROM (degrees true, 0–360)
 * @param {number} windSpeedKt  - Wind speed (knots)
 * @param {number} trueCourseDeg - Desired true course (degrees true, 0–360)
 * @returns {{ trueHeading: number, windCorrectionAngle: number, groundSpeed: number }}
 *          trueHeading: heading to fly (degrees true, 0–360)
 *          windCorrectionAngle: correction applied (positive = wind from left, i.e. turn right)
 *          groundSpeed: resulting ground speed (knots)
 */
export function calculateWindTriangle(tas, windDirDeg, windSpeedKt, trueCourseDeg) {
    const toRad = d => d * Math.PI / 180;
    const toDeg = r => r * 180 / Math.PI;

    // angle between wind direction (FROM) and course
    const alpha = toRad(windDirDeg - trueCourseDeg);

    // wind correction angle: positive when wind is from the left of course
    const sinWCA = (windSpeedKt * Math.sin(alpha)) / tas;
    const wcaDeg = toDeg(Math.asin(Math.max(-1, Math.min(1, sinWCA))));

    const trueHeading = ((trueCourseDeg - wcaDeg) + 360) % 360;
    const groundSpeed = tas * Math.cos(toRad(wcaDeg)) + windSpeedKt * Math.cos(alpha);

    return {
        trueHeading: Math.round(trueHeading * 10) / 10,
        windCorrectionAngle: Math.round(wcaDeg * 10) / 10,
        groundSpeed: Math.round(groundSpeed * 10) / 10,
    };
}

/**
 * calculateGreatCircle — computes the great-circle distance and initial true course
 * between two geographic points using the haversine formula.
 *
 * @param {number} lat1 - Departure latitude (decimal degrees, + = N)
 * @param {number} lon1 - Departure longitude (decimal degrees, + = E)
 * @param {number} lat2 - Destination latitude (decimal degrees, + = N)
 * @param {number} lon2 - Destination longitude (decimal degrees, + = E)
 * @returns {{ distanceNm: number, trueCourse: number }}
 *          distanceNm: great-circle distance in nautical miles
 *          trueCourse: initial true course in degrees (0–360)
 */
export function calculateGreatCircle(lat1, lon1, lat2, lon2) {
    const toRad = d => d * Math.PI / 180;
    const toDeg = r => r * 180 / Math.PI;
    const R_NM = 3440.065;  // Earth mean radius in nautical miles

    const φ1 = toRad(lat1), φ2 = toRad(lat2);
    const Δφ = toRad(lat2 - lat1);
    const Δλ = toRad(lon2 - lon1);

    const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distanceNm = R_NM * c;

    // initial bearing (0–360)
    const y = Math.sin(Δλ) * Math.cos(φ2);
    const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
    const bearing = (toDeg(Math.atan2(y, x)) + 360) % 360;

    return {
        distanceNm: Math.round(distanceNm * 10) / 10,
        trueCourse: Math.round(bearing * 10) / 10,
    };
}

/**
 * interpolateWindsAloft — linearly interpolates wind speed and temperature between
 * two pressure altitude levels, using vector interpolation for wind direction to
 * correctly handle the 0°/360° wrap boundary.
 *
 * @param {number} lowAlt     - Lower altitude (ft MSL)
 * @param {number} lowDir     - Wind direction at lower altitude, FROM (degrees true)
 * @param {number} lowSpd     - Wind speed at lower altitude (knots)
 * @param {number} highAlt    - Upper altitude (ft MSL)
 * @param {number} highDir    - Wind direction at upper altitude, FROM (degrees true)
 * @param {number} highSpd    - Wind speed at upper altitude (knots)
 * @param {number} targetAlt  - Target altitude to interpolate to (ft MSL)
 * @param {number} [lowTempC]  - OAT at lower altitude (°C); if omitted tempC not returned
 * @param {number} [highTempC] - OAT at upper altitude (°C); if omitted tempC not returned
 * @returns {{ dir: number, speed: number, tempC?: number }}
 *          dir: interpolated wind direction FROM (degrees true, 0–360)
 *          speed: interpolated wind speed (knots)
 *          tempC: interpolated OAT (°C), present only when both lowTempC and highTempC provided
 */
export function interpolateWindsAloft(lowAlt, lowDir, lowSpd, highAlt, highDir, highSpd, targetAlt, lowTempC, highTempC) {
    const toRad = d => d * Math.PI / 180;
    const toDeg = r => r * 180 / Math.PI;

    const frac = (targetAlt - lowAlt) / (highAlt - lowAlt);

    // vector interpolation for direction avoids 0°/360° wrap errors
    const sinInterp = (1 - frac) * Math.sin(toRad(lowDir)) + frac * Math.sin(toRad(highDir));
    const cosInterp = (1 - frac) * Math.cos(toRad(lowDir)) + frac * Math.cos(toRad(highDir));
    const dir = (toDeg(Math.atan2(sinInterp, cosInterp)) + 360) % 360;

    const speed = (1 - frac) * lowSpd + frac * highSpd;

    const result = {
        dir: Math.round(dir),
        speed: Math.round(speed * 10) / 10,
    };

    if (lowTempC !== undefined && highTempC !== undefined) {
        result.tempC = Math.round(((1 - frac) * lowTempC + frac * highTempC) * 10) / 10;
    }

    return result;
}

// Thin async wrapper around the native AvCalcEngine Capacitor plugin — the drop-in
// replacement for the direct climb-calc.js/cruise-calc.js/engine-calc.js/aircraft-registry.js
// imports App.jsx used to call synchronously. The calc engine and digitized POH data now
// live natively (ios/AvCalcEngineKit), reachable only through this bridge.
import { registerPlugin } from '@capacitor/core';

const AvCalcEngine = registerPlugin('AvCalcEngine');

export async function getClimbChartLimits(aircraftType) {
    return AvCalcEngine.getClimbChartLimits({ aircraftType });
}

export async function calcStartClimbTemp(cruiseTemp, altitude, startAlt, altimeter) {
    const { startClimbTemp } = await AvCalcEngine.calcStartClimbTemp({ cruiseTemp, altitude, startAlt, altimeter });
    return startClimbTemp;
}

export async function calculateClimb(params) {
    return AvCalcEngine.calculateClimb(params);
}

export async function calculateCruise(params) {
    return AvCalcEngine.calculateCruise(params);
}

export async function calculateEngine(params) {
    return AvCalcEngine.calculateEngine(params);
}

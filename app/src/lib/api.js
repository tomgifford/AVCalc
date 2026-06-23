async function post(path, body, signal) {
    const res = await fetch(`/v1${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal,
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error ?? `HTTP ${res.status}`);
    }
    return res.json();
}

async function get(path, signal) {
    const res = await fetch(`/v1${path}`, { signal });
    if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error ?? `HTTP ${res.status}`);
    }
    return res.json();
}

export function fetchAircraftLimits(aircraftType, signal) {
    return get(`/aircraft/${aircraftType}/limits`, signal);
}

export function fetchStartClimbTemp({ cruiseTemp, altitude, startAlt, altimeter }, signal) {
    return post('/start-climb-temp', { cruiseTemp, altitude, startAlt, altimeter }, signal);
}

export function fetchClimbResults({ aircraftType, altitude, altimeter, cruiseTemp, startAlt, startClimbTemp }, signal) {
    return post('/climb', { aircraftType, altitude, altimeter, cruiseTemp, startAlt, startClimbTemp }, signal);
}

export function fetchCruiseResults({ aircraftType, altitude, altimeter, oat, power, wheelFairings }, signal) {
    return post('/cruise', { aircraftType, altitude, altimeter, oat, power, wheelFairings }, signal);
}

export function fetchEngineResults({ aircraftType, altitude, altimeter, oat, power }, signal) {
    return post('/engine', { aircraftType, altitude, altimeter, oat, power }, signal);
}

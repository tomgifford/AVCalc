function extrap(p0, p1, inputField, outputField, value) {
    const slope = (p1[outputField] - p0[outputField]) / (p1[inputField] - p0[inputField]);
    return p0[outputField] + slope * (value - p0[inputField]);
}

function interp(table, inputField, outputField, value) {
    if (value < table[0][inputField])
        return extrap(table[0], table[1], inputField, outputField, value);
    if (value > table.at(-1)[inputField])
        return extrap(table.at(-2), table.at(-1), inputField, outputField, value);
    for (let i = 0; i < table.length - 1; i++) {
        const p0 = table[i], p1 = table[i + 1];
        if (value >= p0[inputField] && value <= p1[inputField]) {
            return p0[outputField] + (p1[outputField] - p0[outputField]) *
                   (value - p0[inputField]) / (p1[inputField] - p0[inputField]);
        }
    }
    return null;
}

// Returns CAS given IAS and flap setting.
export function getCASfromIAS(data, ias, flaps = 'flapsUp') {
    const table = data[flaps];
    if (!table) return null;
    return interp(table, 'ias', 'cas', ias);
}

// Returns IAS given CAS and flap setting.
export function getIASfromCAS(data, cas, flaps = 'flapsUp') {
    const table = data[flaps];
    if (!table) return null;
    return interp(table, 'cas', 'ias', cas);
}

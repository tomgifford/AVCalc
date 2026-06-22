// Airspeed calibration data from POH airspeed correction tables.
// Each entry maps indicated airspeed (ias) to calibrated airspeed (cas), in knots.
// Linear interpolation is used between entries; clamps to nearest end when out of range.

export const airspeedCalData = {
    'pa28-151': {
        flapsUp: [
            { ias:  50, cas: 58 },
            { ias:  60, cas: 64.5 },
            { ias:  70, cas: 72.5 },
            { ias:  80, cas: 81.5 },
            { ias: 100, cas: 98.5 },
            { ias: 120, cas: 117 },
            { ias: 160, cas: 153 },
        ],
        flaps40: [
            { ias:  43.5, cas: 50 },
            { ias:  60, cas: 62 },
            { ias:  70, cas: 70 },
            { ias:  103, cas: 100 },
        ],
    },
    'pa28-161': {
        flapsUp: [
            { ias:  50, cas:  58 },
            { ias:  60, cas:  65 },
            { ias:  70, cas:  73 },
            { ias:  80, cas:  82 },
            { ias: 100, cas:  99 },
            { ias: 120, cas:  117 },
            { ias: 140, cas:  135 },
            { ias: 160, cas:  153 },
        ],
        flaps40: [
            { ias:  43, cas:  50 },
            { ias:  60, cas:  62.5 },
            { ias:  80, cas:  79 },
            { ias:  104, cas:  100 },
        ],
    },
    'pa28-181': {
        flapsUp: [
            { ias:  70, cas:  75 },
            { ias:  80, cas:  82.5 },
            { ias:  90, cas:  91.5 },
            { ias: 100, cas:  100 },
            { ias: 110, cas:  109 },
            { ias: 120, cas:  118 },
            { ias: 130, cas:  127 },
            { ias: 150, cas:  145 },
        ],
        flaps40: [
            { ias:  60, cas:  64 },
            { ias:  90, cas:  92 },
            { ias:  105, cas:  105 },
            { ias:  115, cas:  112 },
        ],
    },
};
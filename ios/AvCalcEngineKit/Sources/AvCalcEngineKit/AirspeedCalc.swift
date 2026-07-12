// Ported 1:1 from src/lib/airspeedcal-calc.js.

import Foundation

public enum AirspeedCalc {
    /// JS `extrap`: linear extrapolation from two reference points.
    static func extrap(_ p0: IasCasPoint, _ p1: IasCasPoint, useIasAsInput: Bool, value: Double) -> Double {
        if useIasAsInput {
            let slope = (p1.cas - p0.cas) / (p1.ias - p0.ias)
            return p0.cas + slope * (value - p0.ias)
        } else {
            let slope = (p1.ias - p0.ias) / (p1.cas - p0.cas)
            return p0.ias + slope * (value - p0.cas)
        }
    }

    /// JS `interp(table, inputField, outputField, value)` — `useIasAsInput` selects which
    /// field (ias or cas) is the lookup key, mirroring the two call sites below.
    static func interp(_ table: [IasCasPoint], useIasAsInput: Bool, value: Double) -> Double? {
        let input: (IasCasPoint) -> Double = useIasAsInput ? { $0.ias } : { $0.cas }
        let output: (IasCasPoint) -> Double = useIasAsInput ? { $0.cas } : { $0.ias }

        if value < input(table[0]) {
            return extrap(table[0], table[1], useIasAsInput: useIasAsInput, value: value)
        }
        if value > input(table[table.count - 1]) {
            return extrap(table[table.count - 2], table[table.count - 1], useIasAsInput: useIasAsInput, value: value)
        }
        for i in 0..<(table.count - 1) {
            let p0 = table[i], p1 = table[i + 1]
            if value >= input(p0) && value <= input(p1) {
                return output(p0) + (output(p1) - output(p0)) * (value - input(p0)) / (input(p1) - input(p0))
            }
        }
        return nil
    }

    static func table(for flaps: String, in data: AirspeedCalData) -> [IasCasPoint]? {
        switch flaps {
        case "flapsUp": return data.flapsUp
        case "flaps40": return data.flaps40
        default: return nil
        }
    }

    /// Returns CAS given IAS and flap setting.
    public static func getCASfromIAS(_ data: AirspeedCalData, _ ias: Double, flaps: String = "flapsUp") -> Double? {
        guard let table = table(for: flaps, in: data) else { return nil }
        return interp(table, useIasAsInput: true, value: ias)
    }

    /// Returns IAS given CAS and flap setting.
    public static func getIASfromCAS(_ data: AirspeedCalData, _ cas: Double, flaps: String = "flapsUp") -> Double? {
        guard let table = table(for: flaps, in: data) else { return nil }
        return interp(table, useIasAsInput: false, value: cas)
    }
}

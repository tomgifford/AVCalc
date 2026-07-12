// Ported 1:1 from src/lib/utility-calc.js.

import Foundation

public enum UtilityCalc {
    /// Converts True Airspeed (TAS) to Calibrated Airspeed (CAS).
    /// - Parameters:
    ///   - tasKt: True Airspeed in knots
    ///   - pressAltFt: Pressure Altitude in feet (valid below ~36,089 ft / troposphere only)
    ///   - oatC: Outside Air Temperature in Celsius
    /// - Returns: Calibrated Airspeed (CAS) in knots
    public static func convertTasToCas(_ tasKt: Double, _ pressAltFt: Double, _ oatC: Double) -> Double {
        let P0 = 29.92126
        let T0 = 288.15
        let TAS_TO_FPS = 1.68781
        let a0 = 1116.45

        let T = oatC + 273.15
        let delta = pow(1 - (6.8755856e-6 * pressAltFt), 5.25588)
        let P = P0 * delta
        let a = a0 * sqrt(T / T0)

        let tasFps = tasKt * TAS_TO_FPS
        let M = tasFps / a

        let qc: Double
        if M == 0 {
            qc = 0
        } else {
            qc = P * (pow(1 + 0.2 * M * M, 3.5) - 1)
        }

        let casKt: Double
        if qc <= 0 {
            casKt = 0
        } else {
            let casFps = a0 * sqrt(5 * (pow(qc / P0 + 1, 2.0 / 7.0) - 1))
            casKt = casFps / TAS_TO_FPS
        }

        return casKt
    }
}

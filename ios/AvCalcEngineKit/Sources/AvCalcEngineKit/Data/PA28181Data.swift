// GENERATED FILE — do not hand-edit.
// Produced by scripts/generate-swift-data.mjs from src/lib/pa28-181-{climb,cruise,engine}-data.js
// and src/lib/airspeedcal-data.js. Regenerate with: node scripts/generate-swift-data.mjs

enum PA28181Data {
    static let climb = ClimbData(
            yRefLookup: [
                PaYRefRow(pa: 0.0, points: [YRefPoint(t: 14.5, yRef: 0.0), YRefPoint(t: 37.8, yRef: 0.0)]),
                PaYRefRow(pa: 1000.0, points: [YRefPoint(t: 4.4, yRef: 0.0), YRefPoint(t: 13.0, yRef: 2.0), YRefPoint(t: 37.8, yRef: 7.4)]),
                PaYRefRow(pa: 2000.0, points: [YRefPoint(t: -5.6, yRef: 0.0), YRefPoint(t: 11.0, yRef: 4.1), YRefPoint(t: 37.8, yRef: 10.0)]),
                PaYRefRow(pa: 3000.0, points: [YRefPoint(t: -15.0, yRef: 0.0), YRefPoint(t: 9.0, yRef: 5.8), YRefPoint(t: 37.8, yRef: 12.3)]),
                PaYRefRow(pa: 4000.0, points: [YRefPoint(t: -23.9, yRef: 0.0), YRefPoint(t: 7.0, yRef: 7.9), YRefPoint(t: 37.8, yRef: 14.8)]),
                PaYRefRow(pa: 5000.0, points: [YRefPoint(t: -28.9, yRef: 1.6), YRefPoint(t: 5.0, yRef: 10.0), YRefPoint(t: 37.8, yRef: 17.3)]),
                PaYRefRow(pa: 6000.0, points: [YRefPoint(t: -28.9, yRef: 4.0), YRefPoint(t: -12.0, yRef: 8.3), YRefPoint(t: -1.0, yRef: 11.0), YRefPoint(t: 3.0, yRef: 12.0), YRefPoint(t: 10.0, yRef: 13.6), YRefPoint(t: 37.8, yRef: 19.6)]),
                PaYRefRow(pa: 8000.0, points: [YRefPoint(t: -28.9, yRef: 9.0), YRefPoint(t: -17.0, yRef: 12.0), YRefPoint(t: -6.7, yRef: 14.8), YRefPoint(t: -1.0, yRef: 16.3), YRefPoint(t: 10.0, yRef: 18.7), YRefPoint(t: 21.0, yRef: 21.0), YRefPoint(t: 37.8, yRef: 24.5)]),
                PaYRefRow(pa: 10000.0, points: [YRefPoint(t: -28.9, yRef: 14.0), YRefPoint(t: -5.0, yRef: 20.0), YRefPoint(t: 32.0, yRef: 28.0)]),
                PaYRefRow(pa: 12000.0, points: [YRefPoint(t: -28.9, yRef: 19.0), YRefPoint(t: -9.0, yRef: 24.0), YRefPoint(t: 9.0, yRef: 28.0)]),
                PaYRefRow(pa: 14000.0, points: [YRefPoint(t: -28.9, yRef: 24.0), YRefPoint(t: -23.3, yRef: 25.4), YRefPoint(t: -17.8, yRef: 26.8), YRefPoint(t: -13.0, yRef: 28.0)])
            ],
            climbDistLookup: [YRefValue(yRef: 0.0, value: 0.0), YRefValue(yRef: 1.0, value: 0.8), YRefValue(yRef: 2.0, value: 1.5), YRefValue(yRef: 3.0, value: 2.4), YRefValue(yRef: 4.0, value: 3.2), YRefValue(yRef: 6.0, value: 5.2), YRefValue(yRef: 8.0, value: 7.5), YRefValue(yRef: 10.0, value: 10.3), YRefValue(yRef: 12.0, value: 13.4), YRefValue(yRef: 14.0, value: 16.8), YRefValue(yRef: 16.0, value: 20.2), YRefValue(yRef: 18.0, value: 25.0), YRefValue(yRef: 20.0, value: 30.0), YRefValue(yRef: 22.0, value: 36.2), YRefValue(yRef: 24.0, value: 43.2), YRefValue(yRef: 26.0, value: 52.5), YRefValue(yRef: 27.0, value: 57.9), YRefValue(yRef: 28.0, value: 68.0)],
            timeLookup: [YRefValue(yRef: 0.0, value: 0.0), YRefValue(yRef: 1.0, value: 0.7), YRefValue(yRef: 2.0, value: 1.25), YRefValue(yRef: 4.0, value: 2.6), YRefValue(yRef: 6.0, value: 4.0), YRefValue(yRef: 8.0, value: 5.8), YRefValue(yRef: 10.0, value: 7.6), YRefValue(yRef: 12.0, value: 9.7), YRefValue(yRef: 14.0, value: 12.1), YRefValue(yRef: 16.0, value: 15.0), YRefValue(yRef: 18.0, value: 18.2), YRefValue(yRef: 20.0, value: 21.9), YRefValue(yRef: 22.0, value: 26.0), YRefValue(yRef: 24.0, value: 31.2), YRefValue(yRef: 26.0, value: 37.5), YRefValue(yRef: 28.0, value: 45.0)],
            fuelLookup: [YRefValue(yRef: 0.0, value: 0.0), YRefValue(yRef: 1.0, value: 0.1), YRefValue(yRef: 2.0, value: 0.2), YRefValue(yRef: 4.0, value: 0.5), YRefValue(yRef: 6.0, value: 0.9), YRefValue(yRef: 8.0, value: 1.35), YRefValue(yRef: 10.0, value: 1.8), YRefValue(yRef: 12.0, value: 2.3), YRefValue(yRef: 13.0, value: 2.55), YRefValue(yRef: 14.0, value: 2.8), YRefValue(yRef: 16.0, value: 3.35), YRefValue(yRef: 18.0, value: 4.0), YRefValue(yRef: 20.0, value: 4.75), YRefValue(yRef: 22.0, value: 5.55), YRefValue(yRef: 24.0, value: 6.35), YRefValue(yRef: 26.0, value: 7.45), YRefValue(yRef: 28.0, value: 8.5)]
        )

    static let cruise = CruiseData(
            cruiseYRefLookup: [
                PaYRefRow(pa: 0.0, points: [YRefPoint(t: 14.5, yRef: 0.0), YRefPoint(t: 37.8, yRef: 0.0)]),
                PaYRefRow(pa: 1000.0, points: [YRefPoint(t: 4.4, yRef: 0.0), YRefPoint(t: 13.0, yRef: 2.0), YRefPoint(t: 37.8, yRef: 7.4)]),
                PaYRefRow(pa: 2000.0, points: [YRefPoint(t: -5.6, yRef: 0.0), YRefPoint(t: 11.0, yRef: 4.1), YRefPoint(t: 37.8, yRef: 10.0)]),
                PaYRefRow(pa: 3000.0, points: [YRefPoint(t: -15.0, yRef: 0.0), YRefPoint(t: 9.0, yRef: 5.8), YRefPoint(t: 37.8, yRef: 12.3)]),
                PaYRefRow(pa: 4000.0, points: [YRefPoint(t: -23.9, yRef: 0.0), YRefPoint(t: 7.0, yRef: 7.9), YRefPoint(t: 37.8, yRef: 14.8)]),
                PaYRefRow(pa: 5000.0, points: [YRefPoint(t: -28.9, yRef: 1.6), YRefPoint(t: 5.0, yRef: 10.0), YRefPoint(t: 37.8, yRef: 17.3)]),
                PaYRefRow(pa: 6000.0, points: [YRefPoint(t: -28.9, yRef: 4.0), YRefPoint(t: -12.0, yRef: 8.3), YRefPoint(t: -1.0, yRef: 11.0), YRefPoint(t: 3.0, yRef: 12.0), YRefPoint(t: 10.0, yRef: 13.6), YRefPoint(t: 37.8, yRef: 19.6)]),
                PaYRefRow(pa: 8000.0, points: [YRefPoint(t: -28.9, yRef: 9.0), YRefPoint(t: -17.0, yRef: 12.0), YRefPoint(t: -6.7, yRef: 14.8), YRefPoint(t: -1.0, yRef: 16.3), YRefPoint(t: 10.0, yRef: 18.7), YRefPoint(t: 21.0, yRef: 21.0), YRefPoint(t: 37.8, yRef: 24.5)]),
                PaYRefRow(pa: 10000.0, points: [YRefPoint(t: -28.9, yRef: 14.0), YRefPoint(t: -5.0, yRef: 20.0), YRefPoint(t: 32.0, yRef: 28.0)]),
                PaYRefRow(pa: 12000.0, points: [YRefPoint(t: -28.9, yRef: 19.0), YRefPoint(t: -9.0, yRef: 24.0), YRefPoint(t: 9.0, yRef: 28.0)]),
                PaYRefRow(pa: 14000.0, points: [YRefPoint(t: -28.9, yRef: 24.0), YRefPoint(t: -23.3, yRef: 25.4), YRefPoint(t: -17.8, yRef: 26.8), YRefPoint(t: -13.0, yRef: 28.0)])
            ],
            cruiseTASLookup: [
                55: [YRefValue(yRef: 0.0, value: 91.5), YRefValue(yRef: 28.0, value: 109.0)],
                65: [YRefValue(yRef: 0.0, value: 103.0), YRefValue(yRef: 14.0, value: 113.0), YRefValue(yRef: 24.0, value: 120.5)],
                75: [YRefValue(yRef: 0.0, value: 111.0), YRefValue(yRef: 18.0, value: 125.0)]
            ],
            cruiseMaxTAS: [YRefValue(yRef: 0.0, value: 127.7), YRefValue(yRef: 10.0, value: 127.3), YRefValue(yRef: 12.0, value: 127.0), YRefValue(yRef: 16.0, value: 126.0), YRefValue(yRef: 18.0, value: 125.0), YRefValue(yRef: 20.0, value: 123.8), YRefValue(yRef: 22.0, value: 122.5), YRefValue(yRef: 24.0, value: 120.5), YRefValue(yRef: 26.1, value: 117.3), YRefValue(yRef: 27.2, value: 115.1), YRefValue(yRef: 28.0, value: 113.0)],
            cruiseFuelGPH: [55: 7.8, 65: 9.0, 75: 10.5],
            noFairingsTASDeduction: 2.6
        )

    static let engine = EngineData(
            yRefLookup: [
                PaYRefRow(pa: 0.0, points: [YRefPoint(t: 14.5, yRef: 0.0), YRefPoint(t: 37.8, yRef: 0.0)]),
                PaYRefRow(pa: 1000.0, points: [YRefPoint(t: 4.4, yRef: 0.0), YRefPoint(t: 13.0, yRef: 2.0), YRefPoint(t: 37.8, yRef: 7.4)]),
                PaYRefRow(pa: 2000.0, points: [YRefPoint(t: -5.6, yRef: 0.0), YRefPoint(t: 11.0, yRef: 4.1), YRefPoint(t: 37.8, yRef: 10.0)]),
                PaYRefRow(pa: 3000.0, points: [YRefPoint(t: -15.0, yRef: 0.0), YRefPoint(t: 9.0, yRef: 5.8), YRefPoint(t: 37.8, yRef: 12.3)]),
                PaYRefRow(pa: 4000.0, points: [YRefPoint(t: -23.9, yRef: 0.0), YRefPoint(t: 7.0, yRef: 7.9), YRefPoint(t: 37.8, yRef: 14.8)]),
                PaYRefRow(pa: 5000.0, points: [YRefPoint(t: -28.9, yRef: 1.6), YRefPoint(t: 5.0, yRef: 10.0), YRefPoint(t: 37.8, yRef: 17.3)]),
                PaYRefRow(pa: 6000.0, points: [YRefPoint(t: -28.9, yRef: 4.0), YRefPoint(t: -12.0, yRef: 8.3), YRefPoint(t: -1.0, yRef: 11.0), YRefPoint(t: 3.0, yRef: 12.0), YRefPoint(t: 10.0, yRef: 13.6), YRefPoint(t: 37.8, yRef: 19.6)]),
                PaYRefRow(pa: 8000.0, points: [YRefPoint(t: -28.9, yRef: 9.0), YRefPoint(t: -17.0, yRef: 12.0), YRefPoint(t: -6.7, yRef: 14.8), YRefPoint(t: -1.0, yRef: 16.3), YRefPoint(t: 10.0, yRef: 18.7), YRefPoint(t: 21.0, yRef: 21.0), YRefPoint(t: 37.8, yRef: 24.5)]),
                PaYRefRow(pa: 10000.0, points: [YRefPoint(t: -28.9, yRef: 14.0), YRefPoint(t: -5.0, yRef: 20.0), YRefPoint(t: 32.0, yRef: 28.0)]),
                PaYRefRow(pa: 12000.0, points: [YRefPoint(t: -28.9, yRef: 19.0), YRefPoint(t: -9.0, yRef: 24.0), YRefPoint(t: 9.0, yRef: 28.0)]),
                PaYRefRow(pa: 14000.0, points: [YRefPoint(t: -28.9, yRef: 24.0), YRefPoint(t: -23.3, yRef: 25.4), YRefPoint(t: -17.8, yRef: 26.8), YRefPoint(t: -13.0, yRef: 28.0)])
            ],
            rpmLookup: [
                55: [YRefValue(yRef: 0.0, value: 2130.0), YRefValue(yRef: 28.0, value: 2450.0)],
                60: [YRefValue(yRef: 0.0, value: 2210.0), YRefValue(yRef: 26.5, value: 2550.0)],
                65: [YRefValue(yRef: 0.0, value: 2300.0), YRefValue(yRef: 24.0, value: 2595.0)],
                70: [YRefValue(yRef: 0.0, value: 2380.0), YRefValue(yRef: 21.0, value: 2630.0)],
                75: [YRefValue(yRef: 0.0, value: 2440.0), YRefValue(yRef: 18.0, value: 2660.0)]
            ],
            engineMaxRPM: [YRefValue(yRef: 0.0, value: 2700.0), YRefValue(yRef: 10.0, value: 2700.0), YRefValue(yRef: 12.0, value: 2693.0), YRefValue(yRef: 16.0, value: 2675.0), YRefValue(yRef: 18.0, value: 2660.0), YRefValue(yRef: 21.0, value: 2630.0), YRefValue(yRef: 24.0, value: 2595.0), YRefValue(yRef: 26.5, value: 2550.0), YRefValue(yRef: 28.0, value: 2450.0)]
        )

    static let airspeedCal = AirspeedCalData(
            flapsUp: [IasCasPoint(ias: 70.0, cas: 75.0), IasCasPoint(ias: 80.0, cas: 82.5), IasCasPoint(ias: 90.0, cas: 91.5), IasCasPoint(ias: 100.0, cas: 100.0), IasCasPoint(ias: 110.0, cas: 109.0), IasCasPoint(ias: 120.0, cas: 118.0), IasCasPoint(ias: 130.0, cas: 127.0), IasCasPoint(ias: 150.0, cas: 145.0)],
            flaps40: [IasCasPoint(ias: 60.0, cas: 64.0), IasCasPoint(ias: 90.0, cas: 92.0), IasCasPoint(ias: 105.0, cas: 105.0), IasCasPoint(ias: 115.0, cas: 112.0)]
        )
}

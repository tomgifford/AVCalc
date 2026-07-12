// GENERATED FILE — do not hand-edit.
// Produced by scripts/generate-swift-data.mjs from src/lib/pa28-151-{climb,cruise,engine}-data.js
// and src/lib/airspeedcal-data.js. Regenerate with: node scripts/generate-swift-data.mjs

enum PA28151Data {
    static let climb = ClimbData(
            yRefLookup: [
                PaYRefRow(pa: 0.0, points: [YRefPoint(t: 15.5, yRef: 0.0), YRefPoint(t: 37.8, yRef: 5.0)]),
                PaYRefRow(pa: 1000.0, points: [YRefPoint(t: 4.4, yRef: 0.0), YRefPoint(t: 37.8, yRef: 7.6)]),
                PaYRefRow(pa: 2000.0, points: [YRefPoint(t: -5.0, yRef: 0.0), YRefPoint(t: 37.8, yRef: 10.0)]),
                PaYRefRow(pa: 3000.0, points: [YRefPoint(t: -13.9, yRef: 0.0), YRefPoint(t: 37.8, yRef: 12.4)]),
                PaYRefRow(pa: 4000.0, points: [YRefPoint(t: -23.3, yRef: 0.0), YRefPoint(t: 37.8, yRef: 14.9)]),
                PaYRefRow(pa: 5000.0, points: [YRefPoint(t: -28.9, yRef: 1.1), YRefPoint(t: 37.8, yRef: 17.2)]),
                PaYRefRow(pa: 6000.0, points: [YRefPoint(t: -28.9, yRef: 4.0), YRefPoint(t: 37.8, yRef: 19.7)]),
                PaYRefRow(pa: 7000.0, points: [YRefPoint(t: -28.9, yRef: 6.4), YRefPoint(t: 37.8, yRef: 22.0)]),
                PaYRefRow(pa: 8000.0, points: [YRefPoint(t: -28.9, yRef: 8.9), YRefPoint(t: 34.4, yRef: 24.0)]),
                PaYRefRow(pa: 9000.0, points: [YRefPoint(t: -28.9, yRef: 11.3), YRefPoint(t: 23.3, yRef: 24.0)]),
                PaYRefRow(pa: 10000.0, points: [YRefPoint(t: -28.9, yRef: 13.8), YRefPoint(t: 11.7, yRef: 24.0)]),
                PaYRefRow(pa: 11000.0, points: [YRefPoint(t: -28.9, yRef: 16.8), YRefPoint(t: 0.8, yRef: 24.0)]),
                PaYRefRow(pa: 12000.0, points: [YRefPoint(t: -28.9, yRef: 19.1), YRefPoint(t: -9.4, yRef: 24.0)])
            ],
            climbDistLookup: [YRefValue(yRef: 0.0, value: 0.0), YRefValue(yRef: 2.0, value: 2.1), YRefValue(yRef: 4.0, value: 4.0), YRefValue(yRef: 6.0, value: 6.8), YRefValue(yRef: 8.0, value: 9.5), YRefValue(yRef: 10.0, value: 12.5), YRefValue(yRef: 12.0, value: 15.8), YRefValue(yRef: 14.0, value: 19.7), YRefValue(yRef: 16.0, value: 23.75), YRefValue(yRef: 18.0, value: 28.5), YRefValue(yRef: 20.0, value: 35.0), YRefValue(yRef: 22.0, value: 42.3), YRefValue(yRef: 24.0, value: 51.0)],
            timeLookup: [YRefValue(yRef: 0.0, value: 0.0), YRefValue(yRef: 2.0, value: 1.5), YRefValue(yRef: 4.0, value: 3.3), YRefValue(yRef: 6.0, value: 5.2), YRefValue(yRef: 8.0, value: 7.3), YRefValue(yRef: 10.0, value: 9.5), YRefValue(yRef: 12.0, value: 12.0), YRefValue(yRef: 14.0, value: 14.5), YRefValue(yRef: 16.0, value: 17.5), YRefValue(yRef: 18.0, value: 21.0), YRefValue(yRef: 20.0, value: 25.3), YRefValue(yRef: 22.0, value: 30.0), YRefValue(yRef: 24.0, value: 36.0)],
            fuelLookup: [YRefValue(yRef: 0.0, value: 0.0), YRefValue(yRef: 4.0, value: 0.7), YRefValue(yRef: 8.0, value: 1.5), YRefValue(yRef: 13.0, value: 2.5), YRefValue(yRef: 16.0, value: 3.1), YRefValue(yRef: 19.0, value: 3.75), YRefValue(yRef: 22.0, value: 5.0), YRefValue(yRef: 24.0, value: 6.0)]
        )

    static let cruise = CruiseData(
            cruiseYRefLookup: [
                PaYRefRow(pa: 0.0, points: [YRefPoint(t: 15.5, yRef: 0.0), YRefPoint(t: 37.8, yRef: 5.0)]),
                PaYRefRow(pa: 1000.0, points: [YRefPoint(t: 4.4, yRef: 0.0), YRefPoint(t: 37.8, yRef: 7.6)]),
                PaYRefRow(pa: 2000.0, points: [YRefPoint(t: -5.0, yRef: 0.0), YRefPoint(t: 37.8, yRef: 10.0)]),
                PaYRefRow(pa: 3000.0, points: [YRefPoint(t: -13.9, yRef: 0.0), YRefPoint(t: 37.8, yRef: 12.4)]),
                PaYRefRow(pa: 4000.0, points: [YRefPoint(t: -23.3, yRef: 0.0), YRefPoint(t: 37.8, yRef: 14.9)]),
                PaYRefRow(pa: 5000.0, points: [YRefPoint(t: -28.9, yRef: 1.1), YRefPoint(t: 37.8, yRef: 17.2)]),
                PaYRefRow(pa: 6000.0, points: [YRefPoint(t: -28.9, yRef: 4.0), YRefPoint(t: 37.8, yRef: 19.7)]),
                PaYRefRow(pa: 7000.0, points: [YRefPoint(t: -28.9, yRef: 6.4), YRefPoint(t: 37.8, yRef: 22.0)]),
                PaYRefRow(pa: 8000.0, points: [YRefPoint(t: -28.9, yRef: 8.9), YRefPoint(t: 34.4, yRef: 24.0)]),
                PaYRefRow(pa: 9000.0, points: [YRefPoint(t: -28.9, yRef: 11.3), YRefPoint(t: 23.3, yRef: 24.0)]),
                PaYRefRow(pa: 10000.0, points: [YRefPoint(t: -28.9, yRef: 13.8), YRefPoint(t: 11.7, yRef: 24.0)]),
                PaYRefRow(pa: 11000.0, points: [YRefPoint(t: -28.9, yRef: 16.8), YRefPoint(t: 0.8, yRef: 24.0)]),
                PaYRefRow(pa: 12000.0, points: [YRefPoint(t: -28.9, yRef: 19.1), YRefPoint(t: -9.4, yRef: 24.0)])
            ],
            cruiseTASLookup: [
                55: [YRefValue(yRef: 0.0, value: 92.0), YRefValue(yRef: 24.0, value: 95.5)],
                65: [YRefValue(yRef: 0.0, value: 101.0), YRefValue(yRef: 24.0, value: 108.5)],
                75: [YRefValue(yRef: 0.0, value: 107.8), YRefValue(yRef: 16.0, value: 115.0)]
            ],
            cruiseMaxTAS: [YRefValue(yRef: 0.0, value: 117.2), YRefValue(yRef: 16.0, value: 115.0), YRefValue(yRef: 17.0, value: 114.9), YRefValue(yRef: 18.0, value: 114.8), YRefValue(yRef: 20.0, value: 114.0), YRefValue(yRef: 22.3, value: 112.5), YRefValue(yRef: 24.0, value: 111.0)],
            cruiseFuelGPH: [55: 6.7, 65: 8.0, 75: 9.2],
            noFairingsTASDeduction: 2.0
        )

    static let engine = EngineData(
            yRefLookup: [
                PaYRefRow(pa: 0.0, points: [YRefPoint(t: 15.5, yRef: 0.0), YRefPoint(t: 37.8, yRef: 5.0)]),
                PaYRefRow(pa: 1000.0, points: [YRefPoint(t: 4.4, yRef: 0.0), YRefPoint(t: 37.8, yRef: 7.6)]),
                PaYRefRow(pa: 2000.0, points: [YRefPoint(t: -5.0, yRef: 0.0), YRefPoint(t: 37.8, yRef: 10.0)]),
                PaYRefRow(pa: 3000.0, points: [YRefPoint(t: -13.9, yRef: 0.0), YRefPoint(t: 37.8, yRef: 12.4)]),
                PaYRefRow(pa: 4000.0, points: [YRefPoint(t: -23.3, yRef: 0.0), YRefPoint(t: 37.8, yRef: 14.9)]),
                PaYRefRow(pa: 5000.0, points: [YRefPoint(t: -28.9, yRef: 1.1), YRefPoint(t: 37.8, yRef: 17.2)]),
                PaYRefRow(pa: 6000.0, points: [YRefPoint(t: -28.9, yRef: 4.0), YRefPoint(t: 37.8, yRef: 19.7)]),
                PaYRefRow(pa: 7000.0, points: [YRefPoint(t: -28.9, yRef: 6.4), YRefPoint(t: 37.8, yRef: 22.0)]),
                PaYRefRow(pa: 8000.0, points: [YRefPoint(t: -28.9, yRef: 8.9), YRefPoint(t: 34.4, yRef: 24.0)]),
                PaYRefRow(pa: 9000.0, points: [YRefPoint(t: -28.9, yRef: 11.3), YRefPoint(t: 23.3, yRef: 24.0)]),
                PaYRefRow(pa: 10000.0, points: [YRefPoint(t: -28.9, yRef: 13.8), YRefPoint(t: 11.7, yRef: 24.0)]),
                PaYRefRow(pa: 11000.0, points: [YRefPoint(t: -28.9, yRef: 16.8), YRefPoint(t: 0.8, yRef: 24.0)]),
                PaYRefRow(pa: 12000.0, points: [YRefPoint(t: -28.9, yRef: 19.1), YRefPoint(t: -9.4, yRef: 24.0)])
            ],
            rpmLookup: [
                55: [YRefValue(yRef: 0.0, value: 2194.0), YRefValue(yRef: 24.0, value: 2400.0)],
                65: [YRefValue(yRef: 0.0, value: 2320.0), YRefValue(yRef: 24.0, value: 2610.0)],
                75: [YRefValue(yRef: 0.0, value: 2440.0), YRefValue(yRef: 16.0, value: 2700.0)]
            ],
            engineMaxRPM: [YRefValue(yRef: 0.0, value: 2700.0), YRefValue(yRef: 16.0, value: 2700.0), YRefValue(yRef: 17.0, value: 2700.0), YRefValue(yRef: 18.0, value: 2700.0), YRefValue(yRef: 20.0, value: 2700.0), YRefValue(yRef: 22.3, value: 2687.0), YRefValue(yRef: 24.0, value: 2664.0)]
        )

    static let airspeedCal = AirspeedCalData(
            flapsUp: [IasCasPoint(ias: 50.0, cas: 58.0), IasCasPoint(ias: 60.0, cas: 64.5), IasCasPoint(ias: 70.0, cas: 72.5), IasCasPoint(ias: 80.0, cas: 81.5), IasCasPoint(ias: 100.0, cas: 98.5), IasCasPoint(ias: 120.0, cas: 117.0), IasCasPoint(ias: 160.0, cas: 153.0)],
            flaps40: [IasCasPoint(ias: 43.5, cas: 50.0), IasCasPoint(ias: 60.0, cas: 62.0), IasCasPoint(ias: 70.0, cas: 70.0), IasCasPoint(ias: 103.0, cas: 100.0)]
        )
}

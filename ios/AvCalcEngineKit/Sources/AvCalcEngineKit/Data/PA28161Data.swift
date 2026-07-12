// GENERATED FILE — do not hand-edit.
// Produced by scripts/generate-swift-data.mjs from src/lib/pa28-161-{climb,cruise,engine}-data.js
// and src/lib/airspeedcal-data.js. Regenerate with: node scripts/generate-swift-data.mjs

enum PA28161Data {
    static let climb = ClimbData(
            yRefLookup: [
                PaYRefRow(pa: 0.0, points: [YRefPoint(t: -40.0, yRef: 0.0), YRefPoint(t: 40.0, yRef: 0.0)]),
                PaYRefRow(pa: 1000.0, points: [YRefPoint(t: -40.0, yRef: 4.1), YRefPoint(t: -30.0, yRef: 4.2), YRefPoint(t: -20.0, yRef: 4.4), YRefPoint(t: -10.0, yRef: 4.6), YRefPoint(t: 0.0, yRef: 4.9), YRefPoint(t: 10.0, yRef: 5.0), YRefPoint(t: 20.0, yRef: 5.2), YRefPoint(t: 30.0, yRef: 5.8), YRefPoint(t: 40.0, yRef: 6.3)]),
                PaYRefRow(pa: 2000.0, points: [YRefPoint(t: -40.0, yRef: 8.8), YRefPoint(t: -30.0, yRef: 8.9), YRefPoint(t: -20.0, yRef: 9.1), YRefPoint(t: -10.0, yRef: 9.4), YRefPoint(t: 0.0, yRef: 9.8), YRefPoint(t: 10.0, yRef: 10.2), YRefPoint(t: 20.0, yRef: 11.0), YRefPoint(t: 30.0, yRef: 11.8), YRefPoint(t: 40.0, yRef: 13.1)]),
                PaYRefRow(pa: 3000.0, points: [YRefPoint(t: -40.0, yRef: 12.8), YRefPoint(t: -30.0, yRef: 13.0), YRefPoint(t: -20.0, yRef: 13.4), YRefPoint(t: -10.0, yRef: 14.0), YRefPoint(t: 0.0, yRef: 14.6), YRefPoint(t: 10.0, yRef: 15.5), YRefPoint(t: 20.0, yRef: 16.5), YRefPoint(t: 30.0, yRef: 18.2), YRefPoint(t: 40.0, yRef: 20.2)]),
                PaYRefRow(pa: 4000.0, points: [YRefPoint(t: -40.0, yRef: 16.0), YRefPoint(t: -30.0, yRef: 16.7), YRefPoint(t: -20.0, yRef: 17.6), YRefPoint(t: -10.0, yRef: 18.4), YRefPoint(t: 0.0, yRef: 19.5), YRefPoint(t: 10.0, yRef: 20.8), YRefPoint(t: 20.0, yRef: 22.6), YRefPoint(t: 30.0, yRef: 25.0), YRefPoint(t: 40.0, yRef: 28.6)]),
                PaYRefRow(pa: 5000.0, points: [YRefPoint(t: -40.0, yRef: 19.5), YRefPoint(t: -30.0, yRef: 20.5), YRefPoint(t: -20.0, yRef: 21.5), YRefPoint(t: -10.0, yRef: 23.0), YRefPoint(t: 0.0, yRef: 24.5), YRefPoint(t: 10.0, yRef: 26.5), YRefPoint(t: 20.0, yRef: 29.0), YRefPoint(t: 30.0, yRef: 32.1), YRefPoint(t: 40.0, yRef: 36.0)]),
                PaYRefRow(pa: 6000.0, points: [YRefPoint(t: -40.0, yRef: 22.7), YRefPoint(t: -30.0, yRef: 24.0), YRefPoint(t: -20.0, yRef: 25.6), YRefPoint(t: -10.0, yRef: 27.5), YRefPoint(t: 0.0, yRef: 29.6), YRefPoint(t: 10.0, yRef: 32.0), YRefPoint(t: 20.0, yRef: 35.5), YRefPoint(t: 30.0, yRef: 39.6), YRefPoint(t: 40.0, yRef: 44.2)]),
                PaYRefRow(pa: 7000.0, points: [YRefPoint(t: -40.0, yRef: 26.0), YRefPoint(t: -30.0, yRef: 27.8), YRefPoint(t: -20.0, yRef: 29.8), YRefPoint(t: -10.0, yRef: 32.1), YRefPoint(t: 0.0, yRef: 35.0), YRefPoint(t: 10.0, yRef: 38.2), YRefPoint(t: 20.0, yRef: 42.8), YRefPoint(t: 30.0, yRef: 48.0), YRefPoint(t: 40.0, yRef: 53.2)]),
                PaYRefRow(pa: 8000.0, points: [YRefPoint(t: -40.0, yRef: 29.8), YRefPoint(t: -30.0, yRef: 32.1), YRefPoint(t: -20.0, yRef: 34.8), YRefPoint(t: -10.0, yRef: 37.5), YRefPoint(t: 0.0, yRef: 40.5), YRefPoint(t: 10.0, yRef: 44.5), YRefPoint(t: 20.0, yRef: 50.0), YRefPoint(t: 30.0, yRef: 56.5), YRefPoint(t: 35.5, yRef: 60.0)]),
                PaYRefRow(pa: 9000.0, points: [YRefPoint(t: -40.0, yRef: 33.7), YRefPoint(t: -30.0, yRef: 36.4), YRefPoint(t: -20.0, yRef: 39.6), YRefPoint(t: -10.0, yRef: 43.0), YRefPoint(t: 0.0, yRef: 46.8), YRefPoint(t: 10.0, yRef: 51.4), YRefPoint(t: 20.0, yRef: 58.0), YRefPoint(t: 22.5, yRef: 60.0)]),
                PaYRefRow(pa: 10000.0, points: [YRefPoint(t: -40.0, yRef: 38.0), YRefPoint(t: -30.0, yRef: 41.0), YRefPoint(t: -20.0, yRef: 44.3), YRefPoint(t: -10.0, yRef: 48.0), YRefPoint(t: 0.0, yRef: 52.7), YRefPoint(t: 10.0, yRef: 59.0), YRefPoint(t: 11.0, yRef: 60.0)]),
                PaYRefRow(pa: 11000.0, points: [YRefPoint(t: -40.0, yRef: 42.5), YRefPoint(t: -30.0, yRef: 46.0), YRefPoint(t: -20.0, yRef: 49.5), YRefPoint(t: -10.0, yRef: 53.5), YRefPoint(t: 0.0, yRef: 59.0), YRefPoint(t: 2.0, yRef: 60.0)]),
                PaYRefRow(pa: 12000.0, points: [YRefPoint(t: -40.0, yRef: 46.8), YRefPoint(t: -30.0, yRef: 50.0), YRefPoint(t: -20.0, yRef: 54.3), YRefPoint(t: -10.0, yRef: 59.3), YRefPoint(t: -9.0, yRef: 60.0)])
            ],
            climbDistLookup: [YRefValue(yRef: 0.0, value: 0.0), YRefValue(yRef: 5.0, value: 2.0), YRefValue(yRef: 10.0, value: 5.0), YRefValue(yRef: 15.0, value: 7.8), YRefValue(yRef: 20.0, value: 10.5), YRefValue(yRef: 25.0, value: 14.0), YRefValue(yRef: 30.0, value: 17.0), YRefValue(yRef: 35.0, value: 21.5), YRefValue(yRef: 40.0, value: 27.0), YRefValue(yRef: 45.0, value: 34.0), YRefValue(yRef: 50.0, value: 43.0), YRefValue(yRef: 55.0, value: 56.5), YRefValue(yRef: 60.0, value: 77.0)],
            timeLookup: [YRefValue(yRef: 0.0, value: 0.0), YRefValue(yRef: 5.0, value: 2.0), YRefValue(yRef: 10.0, value: 4.0), YRefValue(yRef: 15.0, value: 6.0), YRefValue(yRef: 20.0, value: 8.0), YRefValue(yRef: 25.0, value: 10.5), YRefValue(yRef: 30.0, value: 13.0), YRefValue(yRef: 35.0, value: 16.0), YRefValue(yRef: 40.0, value: 19.0), YRefValue(yRef: 45.0, value: 24.0), YRefValue(yRef: 50.0, value: 30.0), YRefValue(yRef: 55.0, value: 39.0), YRefValue(yRef: 60.0, value: 50.0)],
            fuelLookup: [YRefValue(yRef: 0.0, value: 0.0), YRefValue(yRef: 5.0, value: 0.45), YRefValue(yRef: 10.0, value: 0.8), YRefValue(yRef: 15.0, value: 1.1), YRefValue(yRef: 20.0, value: 1.6), YRefValue(yRef: 25.0, value: 2.0), YRefValue(yRef: 30.0, value: 2.4), YRefValue(yRef: 35.0, value: 3.0), YRefValue(yRef: 40.0, value: 4.0), YRefValue(yRef: 45.0, value: 4.9), YRefValue(yRef: 50.0, value: 5.8), YRefValue(yRef: 55.0, value: 6.8), YRefValue(yRef: 60.0, value: 8.2)]
        )

    static let cruise = CruiseData(
            cruiseYRefLookup: [
                PaYRefRow(pa: 0.0, points: [YRefPoint(t: 15.0, yRef: 0.0), YRefPoint(t: 20.0, yRef: 3.0), YRefPoint(t: 30.0, yRef: 9.5), YRefPoint(t: 40.0, yRef: 15.0)]),
                PaYRefRow(pa: 1000.0, points: [YRefPoint(t: 5.0, yRef: 0.0), YRefPoint(t: 10.0, yRef: 3.0), YRefPoint(t: 20.0, yRef: 9.5), YRefPoint(t: 30.0, yRef: 15.5), YRefPoint(t: 40.0, yRef: 20.5)]),
                PaYRefRow(pa: 2000.0, points: [YRefPoint(t: -5.0, yRef: 0.0), YRefPoint(t: 0.0, yRef: 3.0), YRefPoint(t: 10.0, yRef: 9.5), YRefPoint(t: 20.0, yRef: 15.5), YRefPoint(t: 30.0, yRef: 21.0), YRefPoint(t: 40.0, yRef: 26.0)]),
                PaYRefRow(pa: 3000.0, points: [YRefPoint(t: -17.0, yRef: 0.0), YRefPoint(t: -10.0, yRef: 4.5), YRefPoint(t: 0.0, yRef: 10.5), YRefPoint(t: 10.0, yRef: 16.5), YRefPoint(t: 20.0, yRef: 22.0), YRefPoint(t: 30.0, yRef: 27.0), YRefPoint(t: 40.0, yRef: 32.0)]),
                PaYRefRow(pa: 4000.0, points: [YRefPoint(t: -24.0, yRef: 0.0), YRefPoint(t: -20.0, yRef: 3.0), YRefPoint(t: -10.0, yRef: 9.0), YRefPoint(t: 0.0, yRef: 16.0), YRefPoint(t: 10.0, yRef: 22.0), YRefPoint(t: 20.0, yRef: 28.0), YRefPoint(t: 30.0, yRef: 33.5), YRefPoint(t: 40.0, yRef: 38.5)]),
                PaYRefRow(pa: 5000.0, points: [YRefPoint(t: -33.0, yRef: 0.0), YRefPoint(t: -20.0, yRef: 9.0), YRefPoint(t: -10.0, yRef: 15.0), YRefPoint(t: 0.0, yRef: 22.0), YRefPoint(t: 10.0, yRef: 28.0), YRefPoint(t: 20.0, yRef: 33.5), YRefPoint(t: 30.0, yRef: 39.0), YRefPoint(t: 40.0, yRef: 44.0)]),
                PaYRefRow(pa: 6000.0, points: [YRefPoint(t: -40.0, yRef: 2.0), YRefPoint(t: -30.0, yRef: 9.0), YRefPoint(t: -20.0, yRef: 15.5), YRefPoint(t: -10.0, yRef: 22.0), YRefPoint(t: 0.0, yRef: 28.5), YRefPoint(t: 10.0, yRef: 34.5), YRefPoint(t: 20.0, yRef: 40.0), YRefPoint(t: 30.0, yRef: 45.5), YRefPoint(t: 40.0, yRef: 50.5)]),
                PaYRefRow(pa: 8000.0, points: [YRefPoint(t: -40.0, yRef: 14.5), YRefPoint(t: -30.0, yRef: 21.5), YRefPoint(t: -20.0, yRef: 28.0), YRefPoint(t: -10.0, yRef: 34.0), YRefPoint(t: 0.0, yRef: 40.5), YRefPoint(t: 10.0, yRef: 47.0), YRefPoint(t: 20.0, yRef: 52.5), YRefPoint(t: 30.0, yRef: 57.5), YRefPoint(t: 40.0, yRef: 62.5)]),
                PaYRefRow(pa: 10000.0, points: [YRefPoint(t: -40.0, yRef: 28.0), YRefPoint(t: -30.0, yRef: 34.5), YRefPoint(t: -20.0, yRef: 41.0), YRefPoint(t: -10.0, yRef: 47.0), YRefPoint(t: 0.0, yRef: 53.0), YRefPoint(t: 10.0, yRef: 58.5), YRefPoint(t: 20.0, yRef: 64.0), YRefPoint(t: 30.0, yRef: 69.0), YRefPoint(t: 40.0, yRef: 74.5)]),
                PaYRefRow(pa: 12000.0, points: [YRefPoint(t: -40.0, yRef: 40.0), YRefPoint(t: -30.0, yRef: 47.0), YRefPoint(t: -20.0, yRef: 53.0), YRefPoint(t: -10.0, yRef: 59.5), YRefPoint(t: 0.0, yRef: 65.5), YRefPoint(t: 10.0, yRef: 71.0), YRefPoint(t: 20.0, yRef: 76.0), YRefPoint(t: 28.0, yRef: 80.0)]),
                PaYRefRow(pa: 14000.0, points: [YRefPoint(t: -40.0, yRef: 47.0), YRefPoint(t: -30.0, yRef: 53.5), YRefPoint(t: -20.0, yRef: 59.5), YRefPoint(t: -10.0, yRef: 65.5), YRefPoint(t: 0.0, yRef: 71.0), YRefPoint(t: 10.0, yRef: 76.0), YRefPoint(t: 18.0, yRef: 80.0)])
            ],
            cruiseTASLookup: [
                55: [YRefValue(yRef: 0.0, value: 95.5), YRefValue(yRef: 5.0, value: 96.3), YRefValue(yRef: 10.0, value: 97.2), YRefValue(yRef: 15.0, value: 98.0), YRefValue(yRef: 20.0, value: 99.0), YRefValue(yRef: 25.0, value: 100.0), YRefValue(yRef: 30.0, value: 101.0), YRefValue(yRef: 35.0, value: 102.0), YRefValue(yRef: 40.0, value: 103.0), YRefValue(yRef: 45.0, value: 104.0), YRefValue(yRef: 50.0, value: 105.0), YRefValue(yRef: 55.0, value: 106.0), YRefValue(yRef: 60.0, value: 107.0), YRefValue(yRef: 68.0, value: 109.0)],
                65: [YRefValue(yRef: 0.0, value: 105.0), YRefValue(yRef: 5.0, value: 106.0), YRefValue(yRef: 10.0, value: 107.0), YRefValue(yRef: 15.0, value: 108.0), YRefValue(yRef: 20.0, value: 109.0), YRefValue(yRef: 25.0, value: 110.0), YRefValue(yRef: 30.0, value: 111.0), YRefValue(yRef: 35.0, value: 112.0), YRefValue(yRef: 40.0, value: 113.0), YRefValue(yRef: 45.0, value: 114.0), YRefValue(yRef: 50.0, value: 115.0), YRefValue(yRef: 55.0, value: 116.0), YRefValue(yRef: 60.0, value: 117.0), YRefValue(yRef: 64.0, value: 118.0)],
                75: [YRefValue(yRef: 0.0, value: 112.5), YRefValue(yRef: 5.0, value: 114.0), YRefValue(yRef: 10.0, value: 115.5), YRefValue(yRef: 15.0, value: 117.0), YRefValue(yRef: 20.0, value: 118.5), YRefValue(yRef: 25.0, value: 120.0), YRefValue(yRef: 30.0, value: 121.5), YRefValue(yRef: 35.0, value: 123.0), YRefValue(yRef: 40.0, value: 124.5), YRefValue(yRef: 45.0, value: 126.0)]
            ],
            cruiseMaxTAS: [YRefValue(yRef: 0.0, value: 126.0), YRefValue(yRef: 20.0, value: 127.5), YRefValue(yRef: 30.0, value: 127.5), YRefValue(yRef: 40.0, value: 127.0), YRefValue(yRef: 45.0, value: 126.0), YRefValue(yRef: 50.0, value: 125.0), YRefValue(yRef: 55.0, value: 123.0), YRefValue(yRef: 60.0, value: 121.0), YRefValue(yRef: 64.0, value: 118.0), YRefValue(yRef: 67.0, value: 113.0), YRefValue(yRef: 68.0, value: 109.0)],
            cruiseFuelGPH: [55: 7.8, 65: 8.8, 75: 10.0],
            noFairingsTASDeduction: 7.0
        )

    static let engine = EngineData(
            yRefLookup: [
                PaYRefRow(pa: 0.0, points: [YRefPoint(t: 15.0, yRef: 0.0), YRefPoint(t: 20.0, yRef: 3.0), YRefPoint(t: 30.0, yRef: 9.5), YRefPoint(t: 40.0, yRef: 15.0)]),
                PaYRefRow(pa: 1000.0, points: [YRefPoint(t: 5.0, yRef: 0.0), YRefPoint(t: 10.0, yRef: 3.0), YRefPoint(t: 20.0, yRef: 9.5), YRefPoint(t: 30.0, yRef: 15.5), YRefPoint(t: 40.0, yRef: 20.5)]),
                PaYRefRow(pa: 2000.0, points: [YRefPoint(t: -5.0, yRef: 0.0), YRefPoint(t: 0.0, yRef: 3.0), YRefPoint(t: 10.0, yRef: 9.5), YRefPoint(t: 20.0, yRef: 15.5), YRefPoint(t: 30.0, yRef: 21.0), YRefPoint(t: 40.0, yRef: 26.0)]),
                PaYRefRow(pa: 3000.0, points: [YRefPoint(t: -17.0, yRef: 0.0), YRefPoint(t: -10.0, yRef: 4.5), YRefPoint(t: 0.0, yRef: 10.5), YRefPoint(t: 10.0, yRef: 16.5), YRefPoint(t: 20.0, yRef: 22.0), YRefPoint(t: 30.0, yRef: 27.0), YRefPoint(t: 40.0, yRef: 32.0)]),
                PaYRefRow(pa: 4000.0, points: [YRefPoint(t: -24.0, yRef: 0.0), YRefPoint(t: -20.0, yRef: 3.0), YRefPoint(t: -10.0, yRef: 9.0), YRefPoint(t: 0.0, yRef: 16.0), YRefPoint(t: 10.0, yRef: 22.0), YRefPoint(t: 20.0, yRef: 28.0), YRefPoint(t: 30.0, yRef: 33.5), YRefPoint(t: 40.0, yRef: 38.5)]),
                PaYRefRow(pa: 5000.0, points: [YRefPoint(t: -33.0, yRef: 0.0), YRefPoint(t: -20.0, yRef: 9.0), YRefPoint(t: -10.0, yRef: 15.0), YRefPoint(t: 0.0, yRef: 22.0), YRefPoint(t: 10.0, yRef: 28.0), YRefPoint(t: 20.0, yRef: 33.5), YRefPoint(t: 30.0, yRef: 39.0), YRefPoint(t: 40.0, yRef: 44.0)]),
                PaYRefRow(pa: 6000.0, points: [YRefPoint(t: -40.0, yRef: 2.0), YRefPoint(t: -30.0, yRef: 9.0), YRefPoint(t: -20.0, yRef: 15.5), YRefPoint(t: -10.0, yRef: 22.0), YRefPoint(t: 0.0, yRef: 28.5), YRefPoint(t: 10.0, yRef: 34.5), YRefPoint(t: 20.0, yRef: 40.0), YRefPoint(t: 30.0, yRef: 45.5), YRefPoint(t: 40.0, yRef: 50.5)]),
                PaYRefRow(pa: 8000.0, points: [YRefPoint(t: -40.0, yRef: 14.5), YRefPoint(t: -30.0, yRef: 21.5), YRefPoint(t: -20.0, yRef: 28.0), YRefPoint(t: -10.0, yRef: 34.0), YRefPoint(t: 0.0, yRef: 40.5), YRefPoint(t: 10.0, yRef: 47.0), YRefPoint(t: 20.0, yRef: 52.5), YRefPoint(t: 30.0, yRef: 57.5), YRefPoint(t: 40.0, yRef: 62.5)]),
                PaYRefRow(pa: 10000.0, points: [YRefPoint(t: -40.0, yRef: 28.0), YRefPoint(t: -30.0, yRef: 34.5), YRefPoint(t: -20.0, yRef: 41.0), YRefPoint(t: -10.0, yRef: 47.0), YRefPoint(t: 0.0, yRef: 53.0), YRefPoint(t: 10.0, yRef: 58.5), YRefPoint(t: 20.0, yRef: 64.0), YRefPoint(t: 30.0, yRef: 69.0), YRefPoint(t: 40.0, yRef: 74.5)]),
                PaYRefRow(pa: 12000.0, points: [YRefPoint(t: -40.0, yRef: 40.0), YRefPoint(t: -30.0, yRef: 47.0), YRefPoint(t: -20.0, yRef: 53.0), YRefPoint(t: -10.0, yRef: 59.5), YRefPoint(t: 0.0, yRef: 65.5), YRefPoint(t: 10.0, yRef: 71.0), YRefPoint(t: 20.0, yRef: 76.0), YRefPoint(t: 28.0, yRef: 80.0)]),
                PaYRefRow(pa: 14000.0, points: [YRefPoint(t: -40.0, yRef: 47.0), YRefPoint(t: -30.0, yRef: 53.5), YRefPoint(t: -20.0, yRef: 59.5), YRefPoint(t: -10.0, yRef: 65.5), YRefPoint(t: 0.0, yRef: 71.0), YRefPoint(t: 10.0, yRef: 76.0), YRefPoint(t: 18.0, yRef: 80.0)])
            ],
            rpmLookup: [
                55: [YRefValue(yRef: 0.0, value: 2195.0), YRefValue(yRef: 80.0, value: 2565.0)],
                65: [YRefValue(yRef: 0.0, value: 2340.0), YRefValue(yRef: 67.0, value: 2640.0)],
                75: [YRefValue(yRef: 0.0, value: 2480.0), YRefValue(yRef: 40.0, value: 2665.0)]
            ],
            engineMaxRPM: [YRefValue(yRef: 0.0, value: 2700.0), YRefValue(yRef: 50.0, value: 2700.0), YRefValue(yRef: 55.0, value: 2682.0), YRefValue(yRef: 61.0, value: 2663.0), YRefValue(yRef: 67.0, value: 2640.0), YRefValue(yRef: 71.0, value: 2625.0), YRefValue(yRef: 76.0, value: 2600.0), YRefValue(yRef: 80.0, value: 2565.0)]
        )

    static let airspeedCal = AirspeedCalData(
            flapsUp: [IasCasPoint(ias: 50.0, cas: 58.0), IasCasPoint(ias: 60.0, cas: 65.0), IasCasPoint(ias: 70.0, cas: 73.0), IasCasPoint(ias: 80.0, cas: 82.0), IasCasPoint(ias: 100.0, cas: 99.0), IasCasPoint(ias: 120.0, cas: 117.0), IasCasPoint(ias: 140.0, cas: 135.0), IasCasPoint(ias: 160.0, cas: 153.0)],
            flaps40: [IasCasPoint(ias: 43.0, cas: 50.0), IasCasPoint(ias: 60.0, cas: 62.5), IasCasPoint(ias: 80.0, cas: 79.0), IasCasPoint(ias: 104.0, cas: 100.0)]
        )
}

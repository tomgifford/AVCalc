// Mirrors src/lib/aircraft-registry.js's REGISTRY map. This is the single indirection point
// from an aircraft-type string to its digitized data — kept in Swift (not JS) deliberately,
// since the whole point of this native module is that the digitized POH numbers never exist
// as plain-text JS in the shipped app. The JS side only ever passes an aircraftType string
// across the Capacitor bridge; Swift resolves it here.

public enum AircraftRegistry {
    public static let all: [String: AircraftData] = [
        "pa28-151": AircraftData(climb: PA28151Data.climb, cruise: PA28151Data.cruise, engine: PA28151Data.engine, airspeedCal: PA28151Data.airspeedCal),
        "pa28-161": AircraftData(climb: PA28161Data.climb, cruise: PA28161Data.cruise, engine: PA28161Data.engine, airspeedCal: PA28161Data.airspeedCal),
        "pa28-181": AircraftData(climb: PA28181Data.climb, cruise: PA28181Data.cruise, engine: PA28181Data.engine, airspeedCal: PA28181Data.airspeedCal),
    ]

    public static func data(for aircraftType: String) -> AircraftData? {
        return all[aircraftType]
    }
}

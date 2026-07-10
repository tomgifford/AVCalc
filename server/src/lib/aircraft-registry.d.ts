export declare const AIRCRAFT_LIST: Array<{ id: string; name: string }>;

export declare function getAircraftData(aircraftType: string): {
    climb: any;
    cruise: any;
    engine: any;
    airspeedCal: any;
    refData: Record<string, unknown>;
} | null;

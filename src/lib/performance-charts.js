const base = import.meta.env.BASE_URL;

const CHART_MAP = {
    'pa28-161': {
        climb: {
            src: `${base}charts/PA28-161-ClimbPerformanceChart.png`,
            alt: 'PA-28-161 Warrior II Fuel, Time and Distance to Climb chart',
            title: 'Fuel, Time and Distance to Climb',
        },
        cruise: {
            src: `${base}charts/PA28-161-CruisePerfPowerChart.png`,
            alt: 'PA-28-161 Warrior II Cruise Performance Best Power chart',
            title: 'Cruise Performance (Best Power)',
        },
        engine: {
            src: `${base}charts/PA28-161-EnginePerformanceChart.png`,
            alt: 'PA-28-161 Warrior II Engine Performance chart',
            title: 'Engine Performance',
        },
    },
    'pa28-181': {
        climb: {
            src: `${base}charts/PA28-181-ClimbPerformanceChart.png`,
            alt: 'PA-28-181 Archer II Fuel, Time and Distance to Climb chart',
            title: 'Fuel, Time and Distance to Climb',
        },
        cruise: {
            src: `${base}charts/PA28-181-CruisePerfPowerChart.png`,
            alt: 'PA-28-181 Archer II Cruise Performance Best Power chart',
            title: 'Cruise Performance (Best Power)',
        },
        engine: {
            src: `${base}charts/PA28-181-EnginePerformanceChart.png`,
            alt: 'PA-28-181 Archer II Engine Performance chart',
            title: 'Engine Performance',
        },
    },
};

export function getPerformanceChart(aircraftType, chartType) {
    return CHART_MAP[aircraftType]?.[chartType] ?? null;
}

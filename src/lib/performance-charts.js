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
    },
};

export function getPerformanceChart(aircraftType, chartType) {
    return CHART_MAP[aircraftType]?.[chartType] ?? null;
}

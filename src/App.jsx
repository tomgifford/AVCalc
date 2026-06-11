import { useState, useEffect } from 'react';
import { getClimbYRef, getDist, getTime, getFuel, calculateDensityAltitude, calcStartClimbTemp, calculatePressureAltitude } from './lib/climb-calc.js';
import { getCruiseTAS, getCruiseYRef } from './lib/cruise-calc.js';
import { getPerformanceChart } from './lib/performance-charts.js';
import { getAircraftData } from './lib/aircraft-registry.js';
import './App.css';

function NumericInput({ id, label, value, onChange, step = 1, placeholder, style, disabled }) {
    return (
        <div className="input-group" style={style}>
            <label htmlFor={id}>{label}</label>
            <input
                type="number"
                id={id}
                placeholder={placeholder}
                step={step}
                value={value}
                onChange={e => onChange(e.target.value)}
                disabled={disabled}
            />
        </div>
    );
}

function RadioGroup({ label, options, value, onChange }) {
    return (
        <div className="input-group">
            <label>{label}</label>
            <div className="radio-group">
                {options.map(opt => (
                    <label key={opt.value} className={`radio-option${value === opt.value ? ' selected' : ''}`}>
                        <input type="radio" name={label} value={opt.value}
                            checked={value === opt.value}
                            onChange={() => onChange(opt.value)} />
                        {opt.label}
                    </label>
                ))}
            </div>
        </div>
    );
}

function ResultValue({ label, value, unit, prefix = '' }) {
    return (
        <div>
            <div className="result-label">{label}</div>
            <div className="result-value">
                {prefix}{value} <span className="unit">{unit}</span>
            </div>
        </div>
    );
}

export default function App() {
    const [aircraftType, setAircraftType]     = useState('pa28-161');
    const [chartType, setChartType]           = useState('climb');
    const [wheelFairings, setWheelFairings]   = useState('no');
    const [power, setPower]                   = useState(65);
    const [cruiseTemp, setCruiseTemp]           = useState('15');
    const [startClimbTemp, setStartClimbTemp]   = useState('15');
    const [altitude, setAltitude]               = useState('5000');
    const [startAlt, setStartAlt]               = useState('0');
    const [altimeter, setAltimeter] = useState('29.92');
    const [showDetails, setShowDetails] = useState(false);
    const [chartExpanded, setChartExpanded] = useState(false);

    const aircraftData = getAircraftData(aircraftType);
    const chart = getPerformanceChart(aircraftType, chartType);

    useEffect(() => {
        handleCruiseTempChange(cruiseTemp);
    }, []);

    function handleCruiseTempChange(val) {
        setCruiseTemp(val);
        const temp = calcStartClimbTemp(parseFloat(val), parseFloat(altitude), parseFloat(startAlt), parseFloat(altimeter));
        if (temp !== null) setStartClimbTemp(temp);
    }

    function handleStartAltChange(val) {
        setStartAlt(val);
        const temp = calcStartClimbTemp(parseFloat(cruiseTemp), parseFloat(altitude), parseFloat(val), parseFloat(altimeter));
        if (temp !== null) setStartClimbTemp(temp);
    }

    const T  = parseFloat(cruiseTemp);
    const ST = parseFloat(startClimbTemp);
    const IA = parseFloat(altitude);
    const AS = parseFloat(altimeter);
    const SA = parseFloat(startAlt);
    const valid = [T, ST, IA, AS, SA].every(v => !isNaN(v));

    let results = null;
    if (valid) {
        const { pa: paTarget, stdTemp: stdTempTarget } = calculatePressureAltitude(IA, AS, T);
        const { pa: paStart,  stdTemp: stdTempStart  } = calculatePressureAltitude(SA, AS, ST);
        
        const yRefTarget = getClimbYRef(aircraftData.climb, paTarget, T);
        const yRefStart  = getClimbYRef(aircraftData.climb, paStart,  ST);

        const distTarget = getDist(aircraftData.climb, yRefTarget);
        const distStart  = getDist(aircraftData.climb, yRefStart);
        const timeTarget = getTime(aircraftData.climb, yRefTarget);
        const timeStart  = getTime(aircraftData.climb, yRefStart);
        const fuelTarget = getFuel(aircraftData.climb, yRefTarget);
        const fuelStart  = getFuel(aircraftData.climb, yRefStart);

        const aboveMax = yRefTarget > aircraftData.climb.timeLookup.at(-1).yRef;

        results = {
            paTarget, paStart,
            distTarget, distStart, netDist: Math.max(0, distTarget - distStart),
            timeTarget, timeStart, netTime: Math.max(0, timeTarget - timeStart),
            fuelTarget, fuelStart, netFuel: Math.max(0, fuelTarget - fuelStart),
            prefix: aboveMax ? '> ' : '',
        };
    }

    let cruiseResults = null;
    if (chartType === 'cruise' && valid) {
        const yRef = getCruiseYRef(aircraftData.cruise, results.paTarget, T);
        const tas = getCruiseTAS(aircraftData.cruise, results.paTarget, T, power, wheelFairings);
        cruiseResults = { tas, fuelFlow: aircraftData.cruise.cruiseFuelGPH[power], yRef };
    }

    return (
        <div className="app-layout">
            <div className="container">
                <h1>POH-Based Performance</h1>

                <div className="input-group">
                    <label htmlFor="aircraft-type">Aircraft Type</label>
                    <select id="aircraft-type" value={aircraftType} onChange={e => { setAircraftType(e.target.value); setWheelFairings('no'); }}>
                        <option value="pa28-161">Piper PA-28-161 Warrior II</option>
                        <option value="pa28-181">Piper PA-28-181 Archer II</option>
                    </select>
                </div>

                {['pa28-161', 'pa28-181'].includes(aircraftType) && (
                    <RadioGroup
                        label="Wheel Fairings Installed"
                        options={[
                            { value: 'yes', label: 'Yes' },
                            { value: 'no',  label: 'No'  },
                        ]}
                        value={wheelFairings}
                        onChange={setWheelFairings}
                    />
                )}

                <RadioGroup
                    label="Chart Type"
                    options={[
                        { value: 'climb', label: 'Climb Performance' },
                        { value: 'cruise', label: 'Cruise Performance' },
                    ]}
                    value={chartType}
                    onChange={setChartType}
                />

                <fieldset className="conditions-group">
                    <legend>Conditions</legend>

                    <NumericInput id="altimeter" label="Altimeter (inHg)" value={altimeter}
                        onChange={setAltimeter} step={0.01} placeholder="e.g. 29.92" />

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <NumericInput id="altitude" label="IA - Cruise (ft)" value={altitude}
                            onChange={setAltitude} step={500} placeholder="e.g. 5000" style={{ flex: 1 }} />
                        <NumericInput id="cruise-temp" label="Temp (°C)" value={cruiseTemp}
                            onChange={handleCruiseTempChange} step={1} placeholder="e.g. 15" style={{ flex: 1 }} />
                    </div>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <NumericInput id="start-altitude" label="IA - Start (ft)" value={startAlt}
                            onChange={handleStartAltChange} step={500} placeholder="e.g. 0" style={{ flex: 1 }}
                            disabled={chartType === 'cruise'} />
                        <NumericInput id="start-climb-temp" label="Temp (°C)" value={startClimbTemp}
                            onChange={setStartClimbTemp} step={1} placeholder="e.g. 15" style={{ flex: 1 }}
                            disabled={chartType === 'cruise'} />
                    </div>
                </fieldset>

                {chartType === 'cruise' && (
                    <RadioGroup
                        label="Power"
                        options={[{ value: 75, label: '75%' }, { value: 65, label: '65%' }, { value: 55, label: '55%' }]}
                        value={power}
                        onChange={v => setPower(v)}
                    />
                )}


            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2rem', minWidth: 0 }}>
            {chart && (
                <div className="chart-panel">
                    <div className="chart-title">{chart.title}</div>
                    <img src={chart.src} alt={chart.alt} onClick={() => setChartExpanded(true)} title="Click to expand" />
                    <span className="chart-tap-hint">Tap to expand</span>
                </div>
            )}
            {chartExpanded && (
                <div className="chart-modal-overlay" onClick={() => setChartExpanded(false)}>
                    <img src={chart.src} alt={chart.alt} />
                </div>
            )}
            <div className="result-area">
                {chartType === 'cruise' ? (
                    <div className="result-cruise-row" style={{ display: 'flex', alignItems: 'center' }}>
                        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: '2rem' }}>
                            <ResultValue label="True Airspeed"
                                value={cruiseResults ? cruiseResults.tas.toFixed(1) : '--'}
                                unit="KTAS" />
                            <ResultValue label="Fuel Flow"
                                value={cruiseResults ? cruiseResults.fuelFlow.toFixed(1) : '--'}
                                unit="GPH" />
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', textAlign: 'right', lineHeight: 1.3 }}>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="bar-handle" onClick={() => setShowDetails(d => !d)}></div>

                        <div className="result-label pa-result">Pressure Altitude (at target)</div>
                        <div className="result-value pa-result">
                            {results ? Math.round(results.paTarget).toLocaleString() : '--'}{' '}
                            <span className="unit">ft</span>
                        </div>

                        <div className="result-main-values" style={{ display: 'flex', justifyContent: 'center', gap: '2rem' }}>
                            <ResultValue label="Est. Time to Climb"
                                value={results ? results.netTime.toFixed(0) : '--'}
                                unit="min" prefix={results?.prefix} />
                            <ResultValue label="Est. Distance to Climb"
                                value={results ? results.netDist.toFixed(1) : '--'}
                                unit="nm" prefix={results?.prefix} />
                            <ResultValue label="Est. Fuel to Climb"
                                value={results ? results.netFuel.toFixed(2) : '--'}
                                unit="gal" prefix={results?.prefix} />
                        </div>

                        <div className="details-toggle-desktop" style={{ marginTop: '0.75rem' }}>
                            <a href="#"
                                style={{ fontSize: '0.75rem', textDecoration: 'none', color: 'var(--primary-color)' }}
                                onClick={e => { e.preventDefault(); setShowDetails(d => !d); }}>
                                Details
                            </a>
                        </div>

                        {showDetails && results && (
                            <div className="details-content" style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#64748b', borderTop: '1px solid #cbd5e1', paddingTop: '0.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', gap: '0.5rem' }}>
                                    <span>Cruise:</span>
                                    <span>PA: {Math.round(results.paTarget).toLocaleString()} ft</span>
                                    <span>T: {cruiseTemp}°C</span>
                                    <span style={{ color: 'var(--text-color)', fontWeight: 600 }}>
                                        Target: {results.distTarget.toFixed(1)} nm / {results.timeTarget.toFixed(1)} min / {results.fuelTarget.toFixed(2)} gal
                                    </span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
                                    <span>Start:</span>
                                    <span>PA: {Math.round(results.paStart).toLocaleString()} ft</span>
                                    <span>T: {startClimbTemp}°C</span>
                                    <span style={{ color: 'var(--text-color)', fontWeight: 600 }}>
                                        Start: {results.distStart.toFixed(1)} nm / {results.timeStart.toFixed(1)} min / {results.fuelStart.toFixed(2)} gal
                                    </span>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
            </div>
        </div>
    );
}

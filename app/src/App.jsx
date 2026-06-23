import { useState, useEffect, useRef } from 'react';
import { getPerformanceChart } from './lib/performance-charts.js';
import {
    fetchAircraftLimits,
    fetchStartClimbTemp,
    fetchClimbResults,
    fetchCruiseResults,
    fetchEngineResults,
} from './lib/api.js';
import './App.css';

function NumericInput({ id, label, value, onChange, step = 1, placeholder, style, disabled, min, max, rangeHint, flashTrigger = 0 }) {
    const [flashing, setFlashing] = useState(false);
    const hasLimits = min !== undefined || max !== undefined;

    useEffect(() => {
        if (flashTrigger > 0 && !disabled) setFlashing(true);
    }, [flashTrigger, disabled]);

    function isOutOfRange(num) {
        return (min !== undefined && num < min) || (max !== undefined && num > max);
    }

    function handleChange(newVal) {
        if (!hasLimits) { onChange(newVal); return; }
        const num = parseFloat(newVal);
        if (newVal !== '' && !isNaN(num) && isOutOfRange(num)) { setFlashing(true); return; }
        onChange(newVal);
    }

    function handleStep(delta) {
        const current = parseFloat(value);
        const base = isNaN(current) ? 0 : current;
        const decimals = (step.toString().split('.')[1] || '').length;
        const factor = Math.pow(10, decimals);
        const next = Math.round((base + delta * step) * factor) / factor;
        handleChange(String(next));
    }

    return (
        <div className="input-group" style={style}>
            <label htmlFor={id}>{label}</label>
            <div className="stepper-row">
                <button type="button" className="stepper-btn" onClick={() => handleStep(-1)} disabled={disabled} aria-label="Decrease">−</button>
                <input
                    type="number"
                    id={id}
                    placeholder={placeholder}
                    step={step}
                    value={value}
                    onChange={e => handleChange(e.target.value)}
                    disabled={disabled}
                    className={flashing && !disabled ? 'input-flash-invalid' : ''}
                    onAnimationEnd={() => setFlashing(false)}
                />
                <button type="button" className="stepper-btn" onClick={() => handleStep(1)} disabled={disabled} aria-label="Increase">+</button>
            </div>
            {flashing && !disabled && rangeHint && <span className="range-hint">{rangeHint}</span>}
        </div>
    );
}

function RadioGroup({ label, options, value, onChange, inline }) {
    return (
        <div className={inline ? 'input-group input-group-inline' : 'input-group'}>
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

// TODO: Replace ca-pub-XXXXXXXXXXXXXXXX and data-ad-slot value with your AdSense IDs
function AdBanner() {
    useEffect(() => {
        try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (e) {}
    }, []);

    return (
        <div className="ad-banner">
            <div className="ad-label">Advertisement</div>
            <ins
                className="adsbygoogle"
                style={{ display: 'block' }}
                data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
                data-ad-slot="XXXXXXXXXX"
                data-ad-format="auto"
                data-full-width-responsive="true"
            />
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
    const [cruiseTemp, setCruiseTemp]         = useState('4');
    const [startClimbTemp, setStartClimbTemp] = useState('15');
    const [altitude, setAltitude]             = useState('5500');
    const [startAlt, setStartAlt]             = useState('0');
    const [altimeter, setAltimeter]           = useState('29.92');
    const [showDetails, setShowDetails]       = useState(false);
    const [expandedChart, setExpandedChart]   = useState(null);
    const [startTempFlash, setStartTempFlash] = useState(0);

    const [climbLimits, setClimbLimits] = useState({ minTemp: -40, maxTemp: 50 });
    const [results, setResults]         = useState(null);
    const [apiError, setApiError]       = useState(null);

    const chartsBannerRef    = useRef(null);
    const chartsScrollAreaRef = useRef(null);
    const startClimbTempDebounce = useRef(null);
    const calcDebounce           = useRef(null);

    function scrollToCharts() {
        chartsBannerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        chartsScrollAreaRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }

    const chart           = getPerformanceChart(aircraftType, chartType);
    const engineChart     = chartType === 'cruise' ? getPerformanceChart(aircraftType, 'engine') : null;
    const airspeedCalChart = chartType === 'cruise' ? getPerformanceChart(aircraftType, 'airspeedCal') : null;
    const { minTemp, maxTemp } = climbLimits;
    const tempRangeHint = `Valid: ${minTemp} to ${maxTemp} °C`;

    // Fetch climb chart limits when aircraft changes
    useEffect(() => {
        const controller = new AbortController();
        fetchAircraftLimits(aircraftType, controller.signal)
            .then(limits => setClimbLimits(limits))
            .catch(err => { if (err.name !== 'AbortError') console.warn('Could not fetch limits:', err.message); });
        return () => controller.abort();
    }, [aircraftType]);

    function applyStartClimbTemp(temp) {
        const num = parseFloat(temp);
        if (num < minTemp) { setStartClimbTemp(String(minTemp)); setStartTempFlash(f => f + 1); }
        else if (num > maxTemp) { setStartClimbTemp(String(maxTemp)); setStartTempFlash(f => f + 1); }
        else { setStartClimbTemp(String(temp)); }
    }

    function scheduleStartClimbTempFetch(cruiseTempVal, altitudeVal, startAltVal, altimeterVal) {
        clearTimeout(startClimbTempDebounce.current);
        startClimbTempDebounce.current = setTimeout(async () => {
            const vals = [cruiseTempVal, altitudeVal, startAltVal, altimeterVal].map(parseFloat);
            if (vals.some(isNaN)) return;
            try {
                const { startClimbTemp: t } = await fetchStartClimbTemp({
                    cruiseTemp: vals[0], altitude: vals[1], startAlt: vals[2], altimeter: vals[3],
                });
                if (t !== null) applyStartClimbTemp(t);
            } catch (err) {
                if (err.name !== 'AbortError') console.warn('Could not fetch start climb temp:', err.message);
            }
        }, 250);
    }

    function handleCruiseTempChange(val) {
        setCruiseTemp(val);
        scheduleStartClimbTempFetch(val, altitude, startAlt, altimeter);
    }

    function handleStartAltChange(val) {
        setStartAlt(val);
        scheduleStartClimbTempFetch(cruiseTemp, altitude, val, altimeter);
    }

    // Fetch calculation results whenever inputs change
    const T  = parseFloat(cruiseTemp);
    const ST = parseFloat(startClimbTemp);
    const IA = parseFloat(altitude);
    const AS = parseFloat(altimeter);
    const SA = parseFloat(startAlt);
    const valid = [T, ST, IA, AS, SA].every(v => !isNaN(v));

    useEffect(() => {
        if (!valid) { setResults(null); return; }

        const controller = new AbortController();
        clearTimeout(calcDebounce.current);

        calcDebounce.current = setTimeout(async () => {
            try {
                let data;
                if (chartType === 'climb') {
                    data = await fetchClimbResults(
                        { aircraftType, altitude: IA, altimeter: AS, cruiseTemp: T, startAlt: SA, startClimbTemp: ST },
                        controller.signal
                    );
                } else if (chartType === 'cruise') {
                    const [climbData, cruiseData] = await Promise.all([
                        fetchClimbResults(
                            { aircraftType, altitude: IA, altimeter: AS, cruiseTemp: T, startAlt: SA, startClimbTemp: ST },
                            controller.signal
                        ),
                        fetchCruiseResults(
                            { aircraftType, altitude: IA, altimeter: AS, oat: T, power, wheelFairings },
                            controller.signal
                        ),
                    ]);
                    data = { ...climbData, cruise: cruiseData };
                } else if (chartType === 'engine') {
                    const [climbData, engineData] = await Promise.all([
                        fetchClimbResults(
                            { aircraftType, altitude: IA, altimeter: AS, cruiseTemp: T, startAlt: SA, startClimbTemp: ST },
                            controller.signal
                        ),
                        fetchEngineResults(
                            { aircraftType, altitude: IA, altimeter: AS, oat: T, power },
                            controller.signal
                        ),
                    ]);
                    data = { ...climbData, engine: engineData };
                }
                setResults(data);
                setApiError(null);
            } catch (err) {
                if (err.name !== 'AbortError') {
                    setApiError(err.message);
                    setResults(null);
                }
            }
        }, 200);

        return () => { clearTimeout(calcDebounce.current); controller.abort(); };
    }, [aircraftType, chartType, wheelFairings, power, T, ST, IA, AS, SA, valid]);

    // Re-run on initial mount
    useEffect(() => {
        scheduleStartClimbTempFetch(cruiseTemp, altitude, startAlt, altimeter);
    }, []);

    return (
        <div className="page-wrapper">
        <div className="app-layout">
            <div className="container">
                <h1>POH Chart Companion</h1>

                <div className="input-group">
                    <label htmlFor="aircraft-type">Aircraft Type</label>
                    <select id="aircraft-type" value={aircraftType} onChange={e => { setAircraftType(e.target.value); setWheelFairings('no'); }}>
                        <option value="pa28-151">Piper PA-28-151 Warrior I</option>
                        <option value="pa28-161">Piper PA-28-161 Warrior II</option>
                        <option value="pa28-181">Piper PA-28-181 Archer II</option>
                    </select>
                </div>

                {['pa28-151', 'pa28-161', 'pa28-181'].includes(aircraftType) && (
                    <div className="input-group input-group-inline">
                        <label>Wheel Fairings</label>
                        <label className="toggle-switch">
                            <input type="checkbox"
                                checked={wheelFairings === 'yes'}
                                onChange={e => setWheelFairings(e.target.checked ? 'yes' : 'no')} />
                            <span className="toggle-track"><span className="toggle-thumb" /></span>
                            <span className="toggle-label">{wheelFairings === 'yes' ? 'Yes' : 'No'}</span>
                        </label>
                    </div>
                )}

                <RadioGroup
                    label="Chart"
                    options={[
                        { value: 'climb', label: 'Climb' },
                        { value: 'cruise', label: 'Cruise' },
                        { value: 'engine', label: 'Engine' },
                    ]}
                    value={chartType}
                    onChange={setChartType}
                    inline
                />

                <fieldset className="conditions-group">
                    <legend>Conditions</legend>

                    <NumericInput id="altimeter" label="Altimeter (inHg)" value={altimeter}
                        onChange={setAltimeter} step={0.01} placeholder="e.g. 29.92"
                        style={{ width: 'calc(50% - 0.5rem)' }} />

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <NumericInput id="altitude" label="IA - Cruise (ft)" value={altitude}
                            onChange={setAltitude} step={500} placeholder="e.g. 5000" style={{ flex: 1 }} />
                        <NumericInput id="cruise-temp" label="Temp (°C)" value={cruiseTemp}
                            onChange={handleCruiseTempChange} step={1} placeholder="e.g. 15" style={{ flex: 1 }}
                            min={minTemp} max={maxTemp} rangeHint={tempRangeHint} />
                    </div>

                    {chartType === 'climb' && (
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <NumericInput id="start-altitude" label="IA - Start (ft)" value={startAlt}
                            onChange={handleStartAltChange} step={500} placeholder="e.g. 0" style={{ flex: 1 }} />
                        <NumericInput id="start-climb-temp" label="Temp (°C)" value={startClimbTemp}
                            onChange={setStartClimbTemp} step={1} placeholder="e.g. 15" style={{ flex: 1 }}
                            min={minTemp} max={maxTemp} rangeHint={tempRangeHint}
                            flashTrigger={startTempFlash} />
                    </div>
                    )}
                </fieldset>

                {(chartType === 'cruise' || chartType === 'engine') && (
                    <RadioGroup
                        label="Power"
                        options={[{ value: 75, label: '75%' }, { value: 65, label: '65%' }, { value: 55, label: '55%' }]}
                        value={power}
                        onChange={v => setPower(v)}
                    />
                )}
            </div>

            <div className="charts-column">
            <div className="charts-referenced-banner" ref={chartsBannerRef} onClick={scrollToCharts} style={{ cursor: 'pointer' }}>Chart(s) Referenced: ↓</div>
            <div className="charts-scroll-area" ref={chartsScrollAreaRef}>
            {chart && (
                <div className="chart-panel">
                    <div className="chart-title">{chart.title}</div>
                    <img src={chart.src} alt={chart.alt} onClick={() => setExpandedChart(chart)} title="Click to expand" />
                    <span className="chart-tap-hint">Tap to expand</span>
                </div>
            )}
            {engineChart && (
                <div className="chart-panel">
                    <div className="chart-title">{engineChart.title}</div>
                    <img src={engineChart.src} alt={engineChart.alt} onClick={() => setExpandedChart(engineChart)} title="Click to expand" />
                    <span className="chart-tap-hint">Tap to expand</span>
                </div>
            )}
            {airspeedCalChart && (
                <div className="chart-panel">
                    <div className="chart-title">{airspeedCalChart.title}</div>
                    <img src={airspeedCalChart.src} alt={airspeedCalChart.alt} onClick={() => setExpandedChart(airspeedCalChart)} title="Click to expand" />
                    <span className="chart-tap-hint">Tap to expand</span>
                </div>
            )}
            </div>
            {expandedChart && (
                <div className="chart-modal-overlay" onClick={() => setExpandedChart(null)}>
                    <img src={expandedChart.src} alt={expandedChart.alt} />
                </div>
            )}
            <div className="result-area">
                {apiError && (
                    <div style={{ color: '#dc2626', fontSize: '0.875rem', padding: '0.5rem', textAlign: 'center' }}>
                        Server error: {apiError}
                    </div>
                )}
                {chartType === 'engine' ? (
                    <div className="result-cruise-row" style={{ display: 'flex', alignItems: 'center' }}>
                        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: '2rem' }}>
                            {results?.engine?.outOfRange ? (
                                <div style={{ color: '#dc2626', fontSize: '0.875rem', fontWeight: 600 }}>
                                    Out of range — {power}% power not achievable at these conditions
                                </div>
                            ) : (
                                <ResultValue label={`RPM (${power}%)`}
                                    value={results?.engine?.rpm ? Math.round(results.engine.rpm) : '--'}
                                    unit="RPM" />
                            )}
                        </div>
                    </div>
                ) : chartType === 'cruise' ? (
                    <div className="result-cruise-row" style={{ display: 'flex', alignItems: 'center' }}>
                        <div className="result-cruise-values" style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: '2rem', alignItems: 'flex-end' }}>
                            <ResultValue label="TAS"
                                value={results?.cruise?.tas != null ? results.cruise.tas.toFixed(1) : '--'}
                                unit="kts" />
                            <ResultValue label="CAS"
                                value={results?.cruise?.cas != null ? results.cruise.cas.toFixed(1) : '--'}
                                unit="kts" />
                            <ResultValue label="IAS"
                                value={results?.cruise?.ias != null ? results.cruise.ias.toFixed(1) : '--'}
                                unit="kts" />
                            <ResultValue label="Fuel Flow"
                                value={results?.cruise?.fuelFlow != null ? results.cruise.fuelFlow.toFixed(1) : '--'}
                                unit="GPH" />
                            {results?.cruise?.rpmOutOfRange ? (
                                <div style={{ color: '#dc2626', fontSize: '0.875rem', fontWeight: 600, alignSelf: 'center' }}>
                                    RPM N/A
                                </div>
                            ) : (
                                <ResultValue label={`RPM (${power}%)`}
                                    value={results?.cruise?.rpm ? Math.round(results.cruise.rpm) : '--'}
                                    unit="RPM" />
                            )}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', textAlign: 'right', lineHeight: 1.3 }}>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="bar-handle" onClick={() => setShowDetails(d => !d)}></div>

                        <div className="result-label pa-result">Pressure Altitude (cruise)</div>
                        <div className="result-value pa-result">
                            {results ? Math.round(results.paTarget).toLocaleString() : '--'}{' '}
                            <span className="unit">ft</span>
                        </div>

                        <div className="result-main-values" style={{ display: 'flex', justifyContent: 'center', gap: '2rem' }}>
                            <ResultValue label="Est. Time to Climb"
                                value={results ? results.netTime.toFixed(0) : '--'}
                                unit="min" prefix={results?.aboveMax ? '> ' : ''} />
                            <ResultValue label="Est. Distance to Climb"
                                value={results ? results.netDist.toFixed(1) : '--'}
                                unit="nm" prefix={results?.aboveMax ? '> ' : ''} />
                            <ResultValue label="Est. Fuel to Climb"
                                value={results ? results.netFuel.toFixed(2) : '--'}
                                unit="gal" prefix={results?.aboveMax ? '> ' : ''} />
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
                                <div style={{ display: 'flex', marginBottom: '0.5rem', gap: '0.5rem' }}>
                                    <span><strong>Cruise:</strong> (PA {Math.round(results.paTarget).toLocaleString()} ft, T {cruiseTemp}°C)</span>
                                    <span style={{ color: 'var(--text-color)', fontWeight: 600, marginLeft: 'auto' }}>
                                        {results.distTarget.toFixed(1)} nm / {results.timeTarget.toFixed(1)} min / {results.fuelTarget.toFixed(2)} gal
                                    </span>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <span><strong>Start:</strong> (PA {Math.round(results.paStart).toLocaleString()} ft, T {startClimbTemp}°C)</span>
                                    <span style={{ color: 'var(--text-color)', fontWeight: 600, marginLeft: 'auto' }}>
                                        {results.distStart.toFixed(1)} nm / {results.timeStart.toFixed(1)} min / {results.fuelStart.toFixed(2)} gal
                                    </span>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
            </div>
        </div>
        <AdBanner />
        </div>
    );
}

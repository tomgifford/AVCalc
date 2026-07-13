import { useState, useEffect, useRef } from 'react';
import { getClimbYRef, getDist, getTime, getFuel, calculateDensityAltitude, calcStartClimbTemp, calculatePressureAltitude, getClimbChartLimits } from './lib/climb-calc.js';
import { getCruiseTAS, getCruiseYRef } from './lib/cruise-calc.js';
import { convertTasToCas } from './lib/utility-calc.js';
import { getIASfromCAS } from './lib/airspeedcal-calc.js';
import { getEngineYRef, getEngineRPM, getPowerFromRPM } from './lib/engine-calc.js';
import { getPerformanceChart } from './lib/performance-charts.js';
import { getAircraftData } from './lib/aircraft-registry.js';
import { getChartCalibration } from './lib/chart-calibrations.js';
import { buildClimbTraces, buildCruiseTraces, buildEngineTraces, buildAirspeedCalTrace } from './lib/chart-trace.js';
import ChartTraceOverlay from './ChartTraceOverlay.jsx';
import './App.css';

// Safari re-collapses the text selection on the mouseup that follows a
// focusing click, silently undoing a plain `onFocus={e => e.target.select()}`.
// Firefox and Chrome don't have this problem. Suppressing that one mouseup
// keeps the full-text selection so the user can type over it; a second click
// still places the cursor normally.
function useSelectAllOnFocus() {
    const justFocusedRef = useRef(false);
    return {
        onFocus: e => {
            justFocusedRef.current = true;
            e.target.select();
        },
        onMouseUp: e => {
            if (justFocusedRef.current) {
                justFocusedRef.current = false;
                e.preventDefault();
            }
        },
    };
}

function NumericInput({ id, label, value, onChange, step = 1, placeholder, style, disabled, min, max, rangeHint, flashTrigger = 0 }) {
    const [flashing, setFlashing] = useState(false);
    const hasLimits = min !== undefined || max !== undefined;
    const selectAllOnFocus = useSelectAllOnFocus();

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
        const scaledBase = Math.round(base * factor);
        const scaledStep = Math.round(step * factor);
        // Snap to the step grid first, then move by one step — so an off-grid
        // value (e.g. 757 with a 500 step) lands on 1000/500 instead of 1257/257.
        const scaledNext = delta > 0
            ? Math.floor(scaledBase / scaledStep) * scaledStep + scaledStep
            : Math.ceil(scaledBase / scaledStep) * scaledStep - scaledStep;
        handleChange(String(scaledNext / factor));
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
                    {...selectAllOnFocus}
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
// Ad block disabled for now — see CLAUDE.md/chat history. Re-enable by uncommenting
// this function and its <AdBanner /> render call below.
// function AdBanner() {
//     useEffect(() => {
//         try {
//             (window.adsbygoogle = window.adsbygoogle || []).push({});
//         } catch (e) {}
//     }, []);
//
//     return (
//         <div className="ad-banner">
//             <div className="ad-label">Advertisement</div>
//             <ins
//                 className="adsbygoogle"
//                 style={{ display: 'block' }}
//                 data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
//                 data-ad-slot="XXXXXXXXXX"
//                 data-ad-format="auto"
//                 data-full-width-responsive="true"
//             />
//         </div>
//     );
// }

function EditableResultValue({ label, value, unit, onChange, step = 25, placeholder, inputClassName = '', seedValue }) {
    const selectAllOnFocus = useSelectAllOnFocus();

    function handleStep(delta) {
        const current = parseFloat(value);
        if (isNaN(current)) {
            if (seedValue != null) onChange(String(Math.round(seedValue)));
            return;
        }
        const rounded = Math.round(current / step) * step;
        onChange(String(rounded + delta * step));
    }

    return (
        <div>
            <div className="result-label">{label}</div>
            <div className="result-value result-stepper-row">
                <button type="button" className="stepper-btn" onClick={() => handleStep(-1)} aria-label="Decrease">−</button>
                <input
                    type="number"
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    {...selectAllOnFocus}
                    className={`result-editable-input${inputClassName ? ' ' + inputClassName : ''}`}
                    step={step}
                    placeholder={placeholder}
                />
                <button type="button" className="stepper-btn" onClick={() => handleStep(1)} aria-label="Increase">+</button>
                <span className="unit">{unit}</span>
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
    const [cruiseTemp, setCruiseTemp]           = useState('4');
    const [startClimbTemp, setStartClimbTemp]   = useState('15');
    const [altitude, setAltitude]               = useState('5500');
    const [startAlt, setStartAlt]               = useState('0');
    const [altimeter, setAltimeter] = useState('29.92');
    const [showDetails, setShowDetails] = useState(false);
    const [expandedChart, setExpandedChart] = useState(null);
    const [startTempFlash, setStartTempFlash] = useState(0);
    const [rpmInput, setRpmInput] = useState('');
    const [startTempManual, setStartTempManual] = useState(false);
    const [showTrace, setShowTrace] = useState(true);

    const chartsBannerRef = useRef(null);
    const chartsScrollAreaRef = useRef(null);

    function scrollToCharts() {
        chartsBannerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        chartsScrollAreaRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }

    const aircraftData = getAircraftData(aircraftType);
    const chart = getPerformanceChart(aircraftType, chartType);
    const engineChart = chartType === 'cruise' ? getPerformanceChart(aircraftType, 'engine') : null;
    const airspeedCalChart = chartType === 'cruise' ? getPerformanceChart(aircraftType, 'airspeedCal') : null;
    const { minTemp, maxTemp } = getClimbChartLimits(aircraftData.climb);
    const tempRangeHint = `Valid: ${minTemp} to ${maxTemp} °C`;

    useEffect(() => {
        handleCruiseTempChange(cruiseTemp);
    }, []);

    function applyStartClimbTemp(temp) {
        const num = parseFloat(temp);
        if (num < minTemp) { setStartClimbTemp(String(minTemp)); setStartTempFlash(f => f + 1); }
        else if (num > maxTemp) { setStartClimbTemp(String(maxTemp)); setStartTempFlash(f => f + 1); }
        else { setStartClimbTemp(temp); }
    }

    function handleAltitudeChange(val) {
        setAltitude(val);
        if (startTempManual) return;
        const temp = calcStartClimbTemp(parseFloat(cruiseTemp), parseFloat(val), parseFloat(startAlt), parseFloat(altimeter));
        if (temp !== null) applyStartClimbTemp(temp);
    }

    function handleCruiseTempChange(val) {
        setCruiseTemp(val);
        if (startTempManual) return;
        const temp = calcStartClimbTemp(parseFloat(val), parseFloat(altitude), parseFloat(startAlt), parseFloat(altimeter));
        if (temp !== null) applyStartClimbTemp(temp);
    }

    function handleStartAltChange(val) {
        setStartAlt(val);
        const num = parseFloat(val);
        const cruiseAlt = parseFloat(altitude);
        if (startTempManual) {
            return;
        }
        const temp = calcStartClimbTemp(parseFloat(cruiseTemp), parseFloat(altitude), parseFloat(val), parseFloat(altimeter));
        if (temp !== null) applyStartClimbTemp(temp);
    }

    function handleStartClimbTempChange(val) {
        setStartTempManual(true);
        setStartClimbTemp(val);
    }

    function handlePowerChange(v) {
        setPower(v);
        setRpmInput('');
    }

    function handleRpmDisplayChange(val) {
        setRpmInput(val);
        if (val !== '') setPower(null);
    }

    function handleChartTypeChange(type) {
        setChartType(type);
        if (type !== 'engine') setRpmInput('');
        if (type === 'cruise' && power === null) setPower(65);
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

    let engineYRef = null;
    let engineRPM = null;
    if ((chartType === 'engine' || chartType === 'cruise') && valid) {
        engineYRef = getEngineYRef(aircraftData.engine, results.paTarget, T);
        engineRPM = getEngineRPM(aircraftData.engine, engineYRef, power);
    }

    let powerFromMaxRPM = null;
    if (chartType === 'cruise' && engineRPM?.outOfRange && engineRPM?.rpm != null && engineYRef !== null) {
        powerFromMaxRPM = getPowerFromRPM(aircraftData.engine, engineYRef, engineRPM.rpm);
    }

    let enginePowerResult = null;
    if (chartType === 'engine' && valid && rpmInput !== '') {
        const rpm = parseFloat(rpmInput);
        if (!isNaN(rpm)) {
            enginePowerResult = getPowerFromRPM(aircraftData.engine, engineYRef, rpm);
        }
    }

    const displayRPM = rpmInput !== ''
        ? rpmInput
        : (engineRPM && !engineRPM.outOfRange ? String(Math.round(engineRPM.rpm)) : '');

    let cruiseResults = null;
    if (chartType === 'cruise' && valid) {
        const yRef = getCruiseYRef(aircraftData.cruise, results.paTarget, T);
        const tas = getCruiseTAS(aircraftData.cruise, results.paTarget, T, power, wheelFairings);
        if (tas !== null) {
            const cas = convertTasToCas(tas, results.paTarget, T);
            const ias = getIASfromCAS(aircraftData.airspeedCal, cas, 'flapsUp');
            cruiseResults = { tas, cas, ias, fuelFlow: aircraftData.cruise.cruiseFuelGPH[power], yRef };
        }
    }

    // Trace-overlay geometry. Gated by which charts have a calibration entry in
    // chart-calibrations.js — uncalibrated charts render exactly as before. The
    // builders recompute their lookups through the same calc modules the results
    // above use, so traces are consistent with displayed numbers by construction.
    const primaryCalibration = getChartCalibration(aircraftType, chartType);
    const engineChartCalibration = engineChart ? getChartCalibration(aircraftType, 'engine') : null;
    const airspeedChartCalibration = airspeedCalChart ? getChartCalibration(aircraftType, 'airspeedCal') : null;

    let primaryTraces = null;
    let engineChartTraces = null;
    let airspeedChartTraces = null;
    if (showTrace && valid && results) {
        if (chartType === 'climb' && primaryCalibration) {
            primaryTraces = buildClimbTraces(aircraftData.climb, primaryCalibration,
                { T, ST, paTarget: results.paTarget, paStart: results.paStart });
        } else if (chartType === 'cruise' && primaryCalibration) {
            primaryTraces = buildCruiseTraces(aircraftData.cruise, primaryCalibration,
                { oat: T, pa: results.paTarget, power });
        } else if (chartType === 'engine' && primaryCalibration) {
            const manualRpm = rpmInput !== '' && !isNaN(parseFloat(rpmInput)) ? parseFloat(rpmInput) : undefined;
            primaryTraces = buildEngineTraces(aircraftData.engine, primaryCalibration,
                { oat: T, pa: results.paTarget, power: power ?? 65, rpm: manualRpm });
        }
        if (engineChartCalibration) {
            engineChartTraces = buildEngineTraces(aircraftData.engine, engineChartCalibration,
                { oat: T, pa: results.paTarget, power });
        }
        if (airspeedChartCalibration && cruiseResults) {
            airspeedChartTraces = buildAirspeedCalTrace(aircraftData.airspeedCal, airspeedChartCalibration,
                { cas: cruiseResults.cas, flaps: 'flapsUp' });
        }
    }
    const anyCalibration = primaryCalibration || engineChartCalibration || airspeedChartCalibration;

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
                    onChange={handleChartTypeChange}
                    inline
                />

                <fieldset className="conditions-group">
                    <legend>Conditions</legend>

                    <NumericInput id="altimeter" label="Altimeter (inHg)" value={altimeter}
                        onChange={setAltimeter} step={0.01} placeholder="e.g. 29.92"
                        style={{ width: 'calc(50% - 0.5rem)' }} />

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <NumericInput id="altitude" label="IA - Cruise (ft)" value={altitude}
                            onChange={handleAltitudeChange} step={500} placeholder="e.g. 5000" style={{ flex: 1 }}
                            min={0} rangeHint="Must be 0 ft or higher" />
                        <NumericInput id="cruise-temp" label="Temp (°C)" value={cruiseTemp}
                            onChange={handleCruiseTempChange} step={1} placeholder="e.g. 15" style={{ flex: 1 }}
                            min={minTemp} max={maxTemp} rangeHint={tempRangeHint} />
                    </div>

                    {chartType === 'climb' && (
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <NumericInput id="start-altitude" label="IA - Start (ft)" value={startAlt}
                            onChange={handleStartAltChange} step={500} placeholder="e.g. 0" style={{ flex: 1 }}
                            min={0} rangeHint="Must be 0 ft or higher" />
                        <NumericInput id="start-climb-temp" label="Temp (°C)" value={startClimbTemp}
                            onChange={handleStartClimbTempChange} step={1} placeholder="e.g. 15" style={{ flex: 1 }}
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
                        onChange={handlePowerChange}
                    />
                )}


            </div>

            <div className="charts-column">
            <div className="charts-referenced-banner" ref={chartsBannerRef} onClick={scrollToCharts} style={{ cursor: 'pointer' }}>Chart(s) Referenced: ↓</div>
            <div className="charts-scroll-area" ref={chartsScrollAreaRef}>
            {chart && (
                <div className="chart-panel">
                    <div className="chart-title">{chart.title}</div>
                    <ChartTraceOverlay chart={chart} calibration={primaryCalibration} traces={primaryTraces}
                        onImageClick={() => setExpandedChart(chart)} imgTitle="Click to expand" />
                    <span className="chart-tap-hint">Tap to expand</span>
                    {anyCalibration && results && (
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', justifyContent: 'center', fontSize: '0.75rem', color: '#64748b', cursor: 'pointer', marginTop: '0.25rem' }}>
                            <input type="checkbox" checked={showTrace} onChange={e => setShowTrace(e.target.checked)} />
                            Show result trace
                        </label>
                    )}
                </div>
            )}
            {engineChart && (
                <div className="chart-panel">
                    <div className="chart-title">{engineChart.title}</div>
                    <ChartTraceOverlay chart={engineChart} calibration={engineChartCalibration} traces={engineChartTraces}
                        onImageClick={() => setExpandedChart(engineChart)} imgTitle="Click to expand" />
                    <span className="chart-tap-hint">Tap to expand</span>
                </div>
            )}
            {airspeedCalChart && (
                <div className="chart-panel">
                    <div className="chart-title">{airspeedCalChart.title}</div>
                    <ChartTraceOverlay chart={airspeedCalChart} calibration={airspeedChartCalibration} traces={airspeedChartTraces}
                        onImageClick={() => setExpandedChart(airspeedCalChart)} imgTitle="Click to expand" />
                    <span className="chart-tap-hint">Tap to expand</span>
                </div>
            )}
            </div>
            {expandedChart && (
                <div className="chart-modal-overlay" onClick={() => setExpandedChart(null)}>
                    {expandedChart === chart ? (
                        <ChartTraceOverlay chart={expandedChart} calibration={primaryCalibration} traces={primaryTraces} />
                    ) : expandedChart === engineChart ? (
                        <ChartTraceOverlay chart={expandedChart} calibration={engineChartCalibration} traces={engineChartTraces} />
                    ) : expandedChart === airspeedCalChart ? (
                        <ChartTraceOverlay chart={expandedChart} calibration={airspeedChartCalibration} traces={airspeedChartTraces} />
                    ) : (
                        <img src={expandedChart.src} alt={expandedChart.alt} />
                    )}
                </div>
            )}
            <div className="result-area">
                {chartType === 'engine' ? (
                    <div className="result-cruise-row" style={{ display: 'flex', alignItems: 'center' }}>
                        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', alignItems: 'end' }}>
                            <div style={{ display: 'flex', justifyContent: 'center' }}>
                                <EditableResultValue
                                    label="RPM"
                                    value={displayRPM}
                                    unit="RPM"
                                    onChange={handleRpmDisplayChange}
                                    placeholder="N/A"
                                    inputClassName={displayRPM === '' && (!engineRPM || engineRPM.outOfRange) ? 'input-na' : ''}
                                    seedValue={engineRPM?.outOfRange ? engineRPM.rpm : null}
                                />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'center' }}>
                                <ResultValue
                                    label="Power"
                                    value={
                                        rpmInput !== ''
                                            ? (enginePowerResult?.outOfRange ? '—' : (enginePowerResult?.power?.toFixed(1) ?? '--'))
                                            : (power !== null ? power : '--')
                                    }
                                    unit="%" />
                            </div>
                        </div>
                    </div>
                ) : chartType === 'cruise' ? (
                    <div className="result-cruise-row" style={{ display: 'flex', alignItems: 'center' }}>
                        <div className="result-cruise-values" style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: '2rem', alignItems: 'flex-end' }}>
                            <ResultValue label="TAS"
                                value={cruiseResults?.tas != null ? cruiseResults.tas.toFixed(1) : '--'}
                                unit="kts" />
                            <ResultValue label="CAS"
                                value={cruiseResults?.cas != null ? cruiseResults.cas.toFixed(1) : '--'}
                                unit="kts" />
                            <ResultValue label="IAS"
                                value={cruiseResults?.ias != null ? cruiseResults.ias.toFixed(1) : '--'}
                                unit="kts" />
                            <ResultValue label="Fuel Flow"
                                value={cruiseResults ? cruiseResults.fuelFlow.toFixed(1) : '--'}
                                unit="GPH" />
                            {engineRPM?.outOfRange ? (
                                <div style={{ alignSelf: 'center' }}>
                                    <div className="result-label">
                                        RPM{' '}
                                        {powerFromMaxRPM?.power != null && (
                                            <span style={{ color: '#dc2626' }}>{powerFromMaxRPM.power.toFixed(0)}%</span>
                                        )}
                                    </div>
                                    <div className="result-value">
                                        {engineRPM.rpm != null ? Math.round(engineRPM.rpm) : '--'}{' '}
                                        <span className="unit">RPM</span>
                                    </div>
                                </div>
                            ) : (
                                <ResultValue label={`RPM (${power}%)`}
                                    value={engineRPM ? Math.round(engineRPM.rpm) : '--'}
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
        {/* <AdBanner /> */}
        </div>
    );
}

// Renders a POH chart image with the calculation trace drawn on top as SVG.
// The SVG viewBox is the image's natural pixel size, so trace geometry computed
// in natural-pixel coordinates scales with the responsive <img> automatically
// (inline panel, expanded modal, print). Data-space → pixel mapping goes through
// the per-chart affine calibration, which is what keeps traces tracking the
// printed gridlines on scans that aren't perfectly axis-aligned.

import { useMemo } from 'react';
import { fitAffine, dataToPx } from './lib/chart-calibration.js';

const TRACE_STYLES = {
    cruise: { stroke: '#2563eb', dash: null },
    start:  { stroke: '#ea580c', dash: '10 7' },
};

/*
 * ChartTraceOverlay({ chart, calibration, traces, onImageClick, imgTitle })
 * Intent: Drop-in replacement for the plain chart <img> that overlays result
 *         traces. With no calibration or no traces it renders just the image,
 *         identical to the previous markup.
 * Params: chart — { src, alt } from performance-charts.js.
 *         calibration — entry from chart-calibrations.js (or null).
 *         traces — output of buildClimbTraces (or null/empty).
 *         onImageClick — click handler (expand/collapse), applied to the wrapper.
 *         imgTitle — tooltip text for the image.
 * Returns: JSX element.
 *
 * A polyline's points normally all belong to its own `line.panel`, but a point
 * may set its own `panel` to bridge into a different panel's transform — used
 * by chart-trace.js to draw the yRef line as one contiguous polyline across
 * the gap between a chart's left and right panels instead of two disjoint ones.
 */
export default function ChartTraceOverlay({ chart, calibration, traces, onImageClick, imgTitle }) {
    const transforms = useMemo(() => {
        if (!calibration) return null;
        const t = {};
        for (const [name, panel] of Object.entries(calibration.panels)) {
            t[name] = fitAffine(panel.refPoints);
        }
        return t;
    }, [calibration]);

    const showTrace = calibration && transforms && traces && traces.length > 0;

    if (!showTrace) {
        return <img src={chart.src} alt={chart.alt} onClick={onImageClick} title={imgTitle} />;
    }

    const { width, height } = calibration.image;

    return (
        <div className="chart-trace-wrap" onClick={onImageClick} title={imgTitle}>
            <img src={chart.src} alt={chart.alt} />
            <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
                {traces.map(trace => {
                    const style = TRACE_STYLES[trace.id] ?? TRACE_STYLES.cruise;
                    return (
                        <g key={trace.id} stroke={style.stroke} fill="none">
                            {trace.polylines.map((line, i) => (
                                <polyline
                                    key={i}
                                    points={line.points
                                        .map(p => dataToPx(transforms[p.panel ?? line.panel], p))
                                        .map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`)
                                        .join(' ')}
                                    strokeWidth="2.5"
                                    strokeDasharray={style.dash ?? undefined}
                                    vectorEffect="non-scaling-stroke"
                                    opacity="0.9"
                                />
                            ))}
                            {trace.dots.map((dot, i) => {
                                const p = dataToPx(transforms[dot.panel], dot);
                                return <circle key={i} cx={p.x} cy={p.y} r="9" fill={style.stroke} stroke="white" strokeWidth="3" opacity="0.9" />;
                            })}
                        </g>
                    );
                })}
            </svg>
        </div>
    );
}

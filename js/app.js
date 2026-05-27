const tempInput        = document.getElementById('temp');
const altInput         = document.getElementById('altitude');
const startAltInput    = document.getElementById('start-altitude');
const setInput         = document.getElementById('altimeter');
const outputPA         = document.getElementById('output-pa');
const climbOutput      = document.getElementById('climb-dist');
const timeOutput       = document.getElementById('climb-time');
const fuelOutput       = document.getElementById('climb-fuel');
const detailsLink      = document.getElementById('details-link');
const detailsContainer = document.getElementById('details-container');
const distTargetSpan   = document.getElementById('dist-target');
const distStartSpan    = document.getElementById('dist-start');
const timeTargetSpan   = document.getElementById('time-target');
const timeStartSpan    = document.getElementById('time-start');
const fuelTargetSpan   = document.getElementById('fuel-target');
const fuelStartSpan    = document.getElementById('fuel-start');
const tempTargetSpan   = document.getElementById('temp-target');
const paTargetSpan     = document.getElementById('pa-target');
const tempStartSpan    = document.getElementById('temp-start');
const paStartSpan      = document.getElementById('pa-start');

function resetResults() {
    climbOutput.innerHTML = '-- <span class="unit">nm</span>';
    timeOutput.innerHTML  = '-- <span class="unit">min</span>';
    fuelOutput.innerHTML  = '-- <span class="unit">gal</span>';
    outputPA.innerHTML    = '-- <span class="unit">ft</span>';
    distTargetSpan.textContent = '--';
    distStartSpan.textContent  = '--';
    timeTargetSpan.textContent = '--';
    timeStartSpan.textContent  = '--';
    fuelTargetSpan.textContent = '--';
    fuelStartSpan.textContent  = '--';
    tempTargetSpan.textContent = '--';
    paTargetSpan.textContent   = '--';
    tempStartSpan.textContent  = '--';
    paStartSpan.textContent    = '--';
}

function calculateDA() {
    const T  = parseFloat(tempInput.value);
    const IA = parseFloat(altInput.value);
    const AS = parseFloat(setInput.value);
    const SA = parseFloat(startAltInput.value);

    if (isNaN(T) || isNaN(IA) || isNaN(AS) || isNaN(SA)) {
        resetResults();
        return;
    }

    const { pa: paTarget, stdTemp: stdTempTarget } = calculateDensityAltitude(IA, AS, T);
    const { pa: paStart,  stdTemp: stdTempStart  } = calculateDensityAltitude(SA, AS, T);

    const yRefTarget = getYRef(paTarget, T);
    const yRefStart  = getYRef(paStart,  T);

    const distTarget = getDist(yRefTarget);
    const distStart  = getDist(yRefStart);
    const netDist    = Math.max(0, distTarget - distStart);

    const timeTarget = getTime(yRefTarget);
    const timeStart  = getTime(yRefStart);
    const netTime    = Math.max(0, timeTarget - timeStart);

    const fuelTarget = getFuel(yRefTarget);
    const fuelStart  = getFuel(yRefStart);
    const netFuel    = Math.max(0, fuelTarget - fuelStart);

    const aboveMax = yRefTarget > timeLookup.at(-1).yRef;

    outputPA.innerHTML    = `${Math.round(paTarget).toLocaleString()} <span class="unit">ft</span>`;
    climbOutput.innerHTML = `${aboveMax ? '> ' : ''}${netDist.toFixed(1)} <span class="unit">nm</span>`;
    timeOutput.innerHTML  = `${aboveMax ? '> ' : ''}${netTime.toFixed(0)} <span class="unit">min</span>`;
    fuelOutput.innerHTML  = `${aboveMax ? '> ' : ''}${netFuel.toFixed(2)} <span class="unit">gal</span>`;

    distTargetSpan.textContent = distTarget.toFixed(1);
    distStartSpan.textContent  = distStart.toFixed(1);
    timeTargetSpan.textContent = timeTarget.toFixed(1);
    timeStartSpan.textContent  = timeStart.toFixed(1);
    fuelTargetSpan.textContent = fuelTarget.toFixed(2);
    fuelStartSpan.textContent  = fuelStart.toFixed(2);
    tempTargetSpan.textContent = `${T.toFixed(1)} (${stdTempTarget.toFixed(1)})`;
    paTargetSpan.textContent   = Math.round(paTarget).toLocaleString();
    tempStartSpan.textContent  = `${T.toFixed(1)} (${stdTempStart.toFixed(1)})`;
    paStartSpan.textContent    = Math.round(paStart).toLocaleString();
}

detailsLink.addEventListener('click', (e) => {
    e.preventDefault();
    detailsContainer.style.display = detailsContainer.style.display === 'none' ? 'block' : 'none';
});

[tempInput, altInput, startAltInput, setInput].forEach(input => {
    input.addEventListener('input', calculateDA);
});

calculateDA();
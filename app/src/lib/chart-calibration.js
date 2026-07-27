// Data-space → image-pixel calibration for drawing result traces on the scanned
// POH chart images. The scans are not perfectly axis-aligned (slight rotation/skew
// from scanning), so data coordinates are mapped through a least-squares affine
// transform fitted from reference points, rather than assuming pixel rows/columns
// line up with the printed grid. Straight lines stay straight under an affine map,
// so a "horizontal at yRef = 28" renders slightly sloped in pixel space and tracks
// the printed gridlines correctly.

/*
 * solve3x3(m, v)
 * Intent: Solve the 3x3 linear system m·x = v by Gaussian elimination with
 *         partial pivoting. Used to solve the normal equations of the affine fit.
 * Params: m — 3x3 matrix as array of 3 rows of 3 numbers (not mutated).
 *         v — right-hand-side vector of 3 numbers (not mutated).
 * Returns: solution vector [x0, x1, x2], or null if the system is singular.
 */
function solve3x3(m, v) {
    const a = m.map((row, i) => [...row, v[i]]);
    for (let col = 0; col < 3; col++) {
        let pivot = col;
        for (let r = col + 1; r < 3; r++) {
            if (Math.abs(a[r][col]) > Math.abs(a[pivot][col])) pivot = r;
        }
        if (Math.abs(a[pivot][col]) < 1e-12) return null;
        [a[col], a[pivot]] = [a[pivot], a[col]];
        for (let r = 0; r < 3; r++) {
            if (r === col) continue;
            const factor = a[r][col] / a[col][col];
            for (let c = col; c < 4; c++) a[r][c] -= factor * a[col][c];
        }
    }
    return [a[0][3] / a[0][0], a[1][3] / a[1][1], a[2][3] / a[2][2]];
}

/*
 * fitAffine(refPoints)
 * Intent: Least-squares fit of a 2D affine transform mapping data coordinates to
 *         image pixel coordinates:  px.x = a·x + b·y + c ;  px.y = d·x + e·y + f.
 *         Exact for 3 reference points; overdetermined (least-squares) for 4+,
 *         in which case rmsError is a meaningful calibration-quality metric.
 * Params: refPoints — array (length >= 3) of { data: {x, y}, px: {x, y} } pairs,
 *         where `data` is chart-value space (e.g. °C / yRef) and `px` is the
 *         image's natural-resolution pixel space.
 * Returns: { a, b, c, d, e, f, rmsError } — transform coefficients plus the
 *          root-mean-square residual in pixels across the reference points,
 *          or null if the points are degenerate (e.g. collinear).
 */
export function fitAffine(refPoints) {
    if (!refPoints || refPoints.length < 3) return null;

    // Normal equations: M · p = vx (and vy), with basis [x, y, 1].
    let sxx = 0, sxy = 0, sx = 0, syy = 0, sy = 0, n = refPoints.length;
    let vxX = 0, vxY = 0, vxC = 0, vyX = 0, vyY = 0, vyC = 0;
    for (const { data, px } of refPoints) {
        sxx += data.x * data.x; sxy += data.x * data.y; sx += data.x;
        syy += data.y * data.y; sy += data.y;
        vxX += px.x * data.x; vxY += px.x * data.y; vxC += px.x;
        vyX += px.y * data.x; vyY += px.y * data.y; vyC += px.y;
    }
    const M = [
        [sxx, sxy, sx],
        [sxy, syy, sy],
        [sx,  sy,  n ],
    ];
    const rowX = solve3x3(M, [vxX, vxY, vxC]);
    const rowY = solve3x3(M, [vyX, vyY, vyC]);
    if (!rowX || !rowY) return null;

    const t = { a: rowX[0], b: rowX[1], c: rowX[2], d: rowY[0], e: rowY[1], f: rowY[2] };

    let sumSq = 0;
    for (const { data, px } of refPoints) {
        const p = dataToPx(t, data);
        sumSq += (p.x - px.x) ** 2 + (p.y - px.y) ** 2;
    }
    t.rmsError = Math.sqrt(sumSq / refPoints.length);
    return t;
}

/*
 * dataToPx(transform, point)
 * Intent: Map one data-space point to image pixel coordinates through a fitted
 *         affine transform.
 * Params: transform — { a..f } object from fitAffine().
 *         point — { x, y } in data space.
 * Returns: { x, y } in image natural-pixel space.
 */
export function dataToPx(t, point) {
    return {
        x: t.a * point.x + t.b * point.y + t.c,
        y: t.d * point.x + t.e * point.y + t.f,
    };
}

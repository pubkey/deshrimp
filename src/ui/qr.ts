/**
 * # qr - the QR encoder behind `<QRCode>`
 *
 * ## What it does and how it looks
 * Nothing visible on its own. It turns a string into the grid of black and
 * white squares that `<QRCode>` draws, and it is the whole encoder: byte mode,
 * versions 1 to 40, the four error correction levels, the eight masks and the
 * penalty score that picks between them.
 *
 * It lives here rather than in a dependency because it is forty lines of table
 * and two hundred of arithmetic, it never changes once it is right, and the
 * page is meant to stay a page one can read.
 *
 * ## Core parts
 * - `qrMatrix(value)` - the grid, or `null` when the value does not fit into
 *   any code. The smallest version that holds the value is chosen, and then the
 *   error correction is raised as far as that version allows for free, so a
 *   short link gets a code that survives a thumb over the corner.
 * - `qrSvgPath(code)` - one `d` attribute for the dark modules, horizontal runs
 *   merged into single rectangles.
 * - `qrFits(value)` - the same answer as `qrMatrix(value) !== null` without
 *   building the grid, for a caller that only wants to know.
 * - `QR_MAX_BYTES` - 2953, the capacity of a version 40 code at level L. A
 *   value longer than that in UTF-8 has no code, which is the one case the
 *   callers have to have an answer for.
 *
 * ## Examples
 * ```ts
 * const code = qrMatrix('https://deshrimp.com/');
 * if (code) path = qrSvgPath(code);   // code.size is the module count
 * ```
 *
 * ## Changelog
 * - 2026-09-16 Written. `<QRCode>` and `<ShareDialog>` had been reading the
 *   encoder off `window.QR`, which nothing in this repo ever set, so every
 *   share sheet said the address was too long for a QR code.
 */

/** Error correction level, weakest first. */
export type QRLevel = 'L' | 'M' | 'Q' | 'H';

export type QRMatrixCode = {
    /** Module count per side, without the quiet zone. */
    size: number;
    /** 1 to 40. */
    version: number;
    level: QRLevel;
    /** `modules[y][x]`, true where the module is dark. */
    modules: boolean[][];
};

export type QRMatrixOptions = {
    /** Lowest acceptable error correction. Default `'M'`. */
    level?: QRLevel;
};

/** Capacity of the largest code at the weakest level, in UTF-8 bytes. */
export const QR_MAX_BYTES = 2953;

const LEVELS: QRLevel[] = ['L', 'M', 'Q', 'H'];

/** The two bits each level is written as in the format information. */
const LEVEL_BITS: Record<QRLevel, number> = { L: 1, M: 0, Q: 3, H: 2 };

/** Error correction codewords per block, indexed by version. Slot 0 is unused. */
const EC_PER_BLOCK: Record<QRLevel, number[]> = {
    L: [0, 7, 10, 15, 20, 26, 18, 20, 24, 30, 18, 20, 24, 26, 30, 22, 24, 28, 30, 28,
        28, 28, 28, 30, 30, 26, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
    M: [0, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26, 26,
        26, 26, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28],
    Q: [0, 13, 22, 18, 26, 18, 24, 18, 22, 20, 24, 28, 26, 24, 20, 30, 24, 28, 28, 26,
        30, 28, 30, 30, 30, 30, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
    H: [0, 17, 28, 22, 16, 22, 28, 26, 26, 24, 28, 24, 28, 22, 24, 24, 30, 28, 28, 26,
        28, 30, 24, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
};

/** Error correction blocks, indexed by version. Slot 0 is unused. */
const NUM_BLOCKS: Record<QRLevel, number[]> = {
    L: [0, 1, 1, 1, 1, 1, 2, 2, 2, 2, 4, 4, 4, 4, 4, 6, 6, 6, 6, 7,
        8, 8, 9, 9, 10, 12, 12, 12, 13, 14, 15, 16, 17, 18, 19, 19, 20, 21, 22, 24, 25],
    M: [0, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14,
        16, 17, 17, 18, 20, 21, 23, 25, 26, 28, 29, 31, 33, 35, 37, 38, 40, 43, 45, 47, 49],
    Q: [0, 1, 1, 2, 2, 4, 4, 6, 6, 8, 8, 8, 10, 12, 16, 12, 17, 16, 18, 21,
        20, 23, 23, 25, 27, 29, 34, 34, 35, 38, 40, 43, 45, 48, 51, 53, 56, 59, 62, 65, 68],
    H: [0, 1, 1, 2, 4, 4, 4, 5, 5, 8, 8, 11, 11, 16, 16, 18, 16, 19, 21, 25,
        25, 25, 34, 30, 32, 35, 37, 40, 42, 45, 48, 51, 54, 57, 60, 63, 66, 70, 74, 77, 81],
};

/** The bytes a data block is padded out with, alternating. */
const PAD_CODEWORDS = [0xec, 0x11];

/** Penalty weights for the four mask scoring rules. */
const PENALTY_RUN = 3;
const PENALTY_BOX = 3;
const PENALTY_FINDER = 40;
const PENALTY_BALANCE = 10;

/** The finder-like run that rule three looks for, in modules. */
const FINDER_RUN = [true, false, true, true, true, false, true, false, false, false, false];

function utf8(value: string): number[] {
    if (typeof TextEncoder !== 'undefined') return Array.from(new TextEncoder().encode(value));
    const out: number[] = [];
    for (const ch of value) {
        const cp = ch.codePointAt(0) as number;
        if (cp < 0x80) out.push(cp);
        else if (cp < 0x800) out.push(0xc0 | (cp >> 6), 0x80 | (cp & 0x3f));
        else if (cp < 0x10000) out.push(0xe0 | (cp >> 12), 0x80 | ((cp >> 6) & 0x3f), 0x80 | (cp & 0x3f));
        else out.push(0xf0 | (cp >> 18), 0x80 | ((cp >> 12) & 0x3f), 0x80 | ((cp >> 6) & 0x3f), 0x80 | (cp & 0x3f));
    }
    return out;
}

/** Modules a version has left for data once the function patterns are drawn. */
function rawDataModules(version: number): number {
    let result = (16 * version + 128) * version + 64;
    if (version >= 2) {
        const numAlign = Math.floor(version / 7) + 2;
        result -= (25 * numAlign - 10) * numAlign - 55;
        if (version >= 7) result -= 36;
    }
    return result;
}

function totalCodewords(version: number): number {
    return Math.floor(rawDataModules(version) / 8);
}

function dataCodewords(version: number, level: QRLevel): number {
    return totalCodewords(version) - EC_PER_BLOCK[level][version] * NUM_BLOCKS[level][version];
}

/** Width of the character count field. Byte mode only, so 8 bits or 16. */
function countBits(version: number): number {
    return version <= 9 ? 8 : 16;
}

function capacityBytes(version: number, level: QRLevel): number {
    return Math.floor((dataCodewords(version, level) * 8 - 4 - countBits(version)) / 8);
}

function appendBits(bits: number[], value: number, length: number): void {
    for (let i = length - 1; i >= 0; i--) bits.push((value >>> i) & 1);
}

function bit(value: number, index: number): boolean {
    return ((value >>> index) & 1) !== 0;
}

/* ----- Reed-Solomon over GF(256), primitive polynomial 0x11d ----- */

function gfMul(x: number, y: number): number {
    let z = 0;
    for (let i = 7; i >= 0; i--) {
        z = (z << 1) ^ ((z >>> 7) * 0x11d);
        z ^= ((y >>> i) & 1) * x;
    }
    return z & 0xff;
}

/** Coefficients of the generator polynomial of the given degree, leading term dropped. */
function rsDivisor(degree: number): number[] {
    const result: number[] = new Array(degree).fill(0);
    result[degree - 1] = 1;
    let root = 1;
    for (let i = 0; i < degree; i++) {
        for (let j = 0; j < degree; j++) {
            result[j] = gfMul(result[j], root);
            if (j + 1 < degree) result[j] ^= result[j + 1];
        }
        root = gfMul(root, 0x02);
    }
    return result;
}

function rsRemainder(data: number[], divisor: number[]): number[] {
    const result: number[] = new Array(divisor.length).fill(0);
    for (const b of data) {
        const factor = b ^ (result.shift() as number);
        result.push(0);
        for (let i = 0; i < divisor.length; i++) result[i] ^= gfMul(divisor[i], factor);
    }
    return result;
}

/* ----- codewords ----- */

/** Header, payload, terminator and padding, as one array of data codewords. */
function dataStream(bytes: number[], version: number, level: QRLevel): number[] {
    const bits: number[] = [];
    appendBits(bits, 0b0100, 4);
    appendBits(bits, bytes.length, countBits(version));
    for (const b of bytes) appendBits(bits, b, 8);

    const capacity = dataCodewords(version, level) * 8;
    appendBits(bits, 0, Math.min(4, capacity - bits.length));
    appendBits(bits, 0, (8 - (bits.length % 8)) % 8);
    for (let i = 0; bits.length < capacity; i++) appendBits(bits, PAD_CODEWORDS[i % 2], 8);

    const codewords: number[] = new Array(bits.length / 8).fill(0);
    for (let i = 0; i < bits.length; i++) codewords[i >>> 3] |= bits[i] << (7 - (i & 7));
    return codewords;
}

/** Split into blocks, add the error correction, interleave back into one stream. */
function interleave(data: number[], version: number, level: QRLevel): number[] {
    const numBlocks = NUM_BLOCKS[level][version];
    const ecLen = EC_PER_BLOCK[level][version];
    const total = totalCodewords(version);
    const numShort = numBlocks - (total % numBlocks);
    const shortLen = Math.floor(total / numBlocks);

    const divisor = rsDivisor(ecLen);
    const blocks: number[][] = [];
    for (let i = 0, k = 0; i < numBlocks; i++) {
        const len = shortLen - ecLen + (i < numShort ? 0 : 1);
        const block = data.slice(k, k + len);
        k += len;
        const ecc = rsRemainder(block, divisor);
        // A short block is padded to the long length so the column walk below
        // can be a plain nested loop; the padding byte is skipped on the way out.
        if (i < numShort) block.push(0);
        blocks.push(block.concat(ecc));
    }

    const result: number[] = [];
    for (let i = 0; i < blocks[0].length; i++) {
        for (let j = 0; j < blocks.length; j++) {
            if (i !== shortLen - ecLen || j >= numShort) result.push(blocks[j][i]);
        }
    }
    return result;
}

/* ----- the grid ----- */

type Grid = {
    size: number;
    version: number;
    modules: boolean[][];
    reserved: boolean[][];
};

function newGrid(version: number): Grid {
    const size = version * 4 + 17;
    const blank = () => Array.from({ length: size }, () => new Array<boolean>(size).fill(false));
    return { size, version, modules: blank(), reserved: blank() };
}

function setFunction(g: Grid, x: number, y: number, dark: boolean): void {
    if (x < 0 || x >= g.size || y < 0 || y >= g.size) return;
    g.modules[y][x] = dark;
    g.reserved[y][x] = true;
}

function alignmentPositions(version: number): number[] {
    if (version === 1) return [];
    const count = Math.floor(version / 7) + 2;
    const step = version === 32 ? 26 : Math.ceil((version * 4 + 4) / (count * 2 - 2)) * 2;
    const result = [6];
    for (let pos = version * 4 + 10; result.length < count; pos -= step) result.splice(1, 0, pos);
    return result;
}

function drawFinder(g: Grid, x: number, y: number): void {
    for (let dy = -4; dy <= 4; dy++) {
        for (let dx = -4; dx <= 4; dx++) {
            const dist = Math.max(Math.abs(dx), Math.abs(dy));
            setFunction(g, x + dx, y + dy, dist !== 2 && dist !== 4);
        }
    }
}

function drawAlignment(g: Grid, x: number, y: number): void {
    for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
            setFunction(g, x + dx, y + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
        }
    }
}

/** The fifteen format bits, twice over, plus the module that is always dark. */
function drawFormat(g: Grid, level: QRLevel, mask: number): void {
    const data = (LEVEL_BITS[level] << 3) | mask;
    let rem = data;
    for (let i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
    const bits = ((data << 10) | rem) ^ 0x5412;

    for (let i = 0; i <= 5; i++) setFunction(g, 8, i, bit(bits, i));
    setFunction(g, 8, 7, bit(bits, 6));
    setFunction(g, 8, 8, bit(bits, 7));
    setFunction(g, 7, 8, bit(bits, 8));
    for (let i = 9; i < 15; i++) setFunction(g, 14 - i, 8, bit(bits, i));

    for (let i = 0; i < 8; i++) setFunction(g, g.size - 1 - i, 8, bit(bits, i));
    for (let i = 8; i < 15; i++) setFunction(g, 8, g.size - 15 + i, bit(bits, i));
    setFunction(g, 8, g.size - 8, true);
}

function drawVersion(g: Grid): void {
    if (g.version < 7) return;
    let rem = g.version;
    for (let i = 0; i < 12; i++) rem = (rem << 1) ^ ((rem >>> 11) * 0x1f25);
    const bits = (g.version << 12) | rem;
    for (let i = 0; i < 18; i++) {
        const dark = bit(bits, i);
        const a = g.size - 11 + (i % 3);
        const b = Math.floor(i / 3);
        setFunction(g, a, b, dark);
        setFunction(g, b, a, dark);
    }
}

function drawFunctionPatterns(g: Grid, level: QRLevel): void {
    for (let i = 0; i < g.size; i++) {
        setFunction(g, 6, i, i % 2 === 0);
        setFunction(g, i, 6, i % 2 === 0);
    }

    drawFinder(g, 3, 3);
    drawFinder(g, g.size - 4, 3);
    drawFinder(g, 3, g.size - 4);

    const align = alignmentPositions(g.version);
    for (let i = 0; i < align.length; i++) {
        for (let j = 0; j < align.length; j++) {
            const corner = (i === 0 && j === 0)
                || (i === 0 && j === align.length - 1)
                || (i === align.length - 1 && j === 0);
            if (!corner) drawAlignment(g, align[i], align[j]);
        }
    }

    // A mask is chosen later; these bits are redrawn once it is.
    drawFormat(g, level, 0);
    drawVersion(g);
}

/** The zigzag up and down the two-module columns, skipping the timing column. */
function drawCodewords(g: Grid, data: number[]): void {
    let i = 0;
    for (let right = g.size - 1; right >= 1; right -= 2) {
        if (right === 6) right = 5;
        for (let vert = 0; vert < g.size; vert++) {
            for (let j = 0; j < 2; j++) {
                const x = right - j;
                const upward = ((right + 1) & 2) === 0;
                const y = upward ? g.size - 1 - vert : vert;
                if (!g.reserved[y][x] && i < data.length * 8) {
                    g.modules[y][x] = bit(data[i >>> 3], 7 - (i & 7));
                    i++;
                }
            }
        }
    }
}

function maskBit(mask: number, x: number, y: number): boolean {
    switch (mask) {
        case 0: return (x + y) % 2 === 0;
        case 1: return y % 2 === 0;
        case 2: return x % 3 === 0;
        case 3: return (x + y) % 3 === 0;
        case 4: return (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0;
        case 5: return ((x * y) % 2) + ((x * y) % 3) === 0;
        case 6: return (((x * y) % 2) + ((x * y) % 3)) % 2 === 0;
        default: return ((((x + y) % 2) + ((x * y) % 3)) % 2) === 0;
    }
}

/** Applying a mask twice undoes it, which is how the eight are tried in turn. */
function applyMask(g: Grid, mask: number): void {
    for (let y = 0; y < g.size; y++) {
        for (let x = 0; x < g.size; x++) {
            if (!g.reserved[y][x] && maskBit(mask, x, y)) g.modules[y][x] = !g.modules[y][x];
        }
    }
}

function countFinderRuns(line: boolean[]): number {
    let found = 0;
    for (let i = 0; i + FINDER_RUN.length <= line.length; i++) {
        let forward = true;
        let backward = true;
        for (let j = 0; j < FINDER_RUN.length; j++) {
            if (line[i + j] !== FINDER_RUN[j]) forward = false;
            if (line[i + j] !== FINDER_RUN[FINDER_RUN.length - 1 - j]) backward = false;
        }
        if (forward) found++;
        if (backward) found++;
    }
    return found;
}

function runPenalty(line: boolean[]): number {
    let result = 0;
    let color = line[0];
    let length = 0;
    for (const module of line) {
        if (module === color) {
            length++;
            if (length === 5) result += PENALTY_RUN;
            else if (length > 5) result++;
        } else {
            color = module;
            length = 1;
        }
    }
    return result + countFinderRuns(line) * PENALTY_FINDER;
}

/** The four scoring rules of the spec, summed. Lower is better. */
function penalty(g: Grid): number {
    let result = 0;
    let dark = 0;

    for (let y = 0; y < g.size; y++) {
        result += runPenalty(g.modules[y]);
        for (const module of g.modules[y]) if (module) dark++;
    }
    for (let x = 0; x < g.size; x++) {
        const column: boolean[] = [];
        for (let y = 0; y < g.size; y++) column.push(g.modules[y][x]);
        result += runPenalty(column);
    }

    for (let y = 0; y < g.size - 1; y++) {
        for (let x = 0; x < g.size - 1; x++) {
            const c = g.modules[y][x];
            if (c === g.modules[y][x + 1] && c === g.modules[y + 1][x] && c === g.modules[y + 1][x + 1]) {
                result += PENALTY_BOX;
            }
        }
    }

    const total = g.size * g.size;
    const steps = Math.ceil(Math.abs(dark * 20 - total * 10) / total) - 1;
    return result + steps * PENALTY_BALANCE;
}

/* ----- the two things the callers use ----- */

/** True when the value has a code at all, without building one. */
export function qrFits(value: string): boolean {
    return utf8(value).length <= QR_MAX_BYTES;
}

/**
 * The grid for `value`, or `null` when it is longer than any code holds.
 *
 * The smallest version that fits is picked first, and only then the level: a
 * version is rarely filled exactly, so the leftover room buys error correction
 * rather than a smaller square that no longer exists.
 */
export function qrMatrix(value: string, options?: QRMatrixOptions): QRMatrixCode | null {
    const bytes = utf8(value);
    const asked = LEVELS.indexOf(options?.level || 'M');
    const floor = asked < 0 ? 1 : asked;

    // Outer loop over the level, inner over the version: the smallest square
    // that holds the value at the asked-for level wins, and the level is only
    // weakened when no version at all holds it, because a level L code is still
    // a code and a refused link is not.
    for (let l = floor; l >= 0; l--) {
        for (let v = 1; v <= 40; v++) {
            if (bytes.length > capacityBytes(v, LEVELS[l])) continue;
            let level = LEVELS[l];
            for (let up = l + 1; up < LEVELS.length; up++) {
                if (bytes.length <= capacityBytes(v, LEVELS[up])) level = LEVELS[up];
            }
            return build(bytes, v, level);
        }
    }
    return null;
}

function build(bytes: number[], version: number, level: QRLevel): QRMatrixCode {
    const g = newGrid(version);
    drawFunctionPatterns(g, level);
    drawCodewords(g, interleave(dataStream(bytes, version, level), version, level));

    let best = 0;
    let bestScore = Infinity;
    for (let mask = 0; mask < 8; mask++) {
        drawFormat(g, level, mask);
        applyMask(g, mask);
        const score = penalty(g);
        if (score < bestScore) {
            bestScore = score;
            best = mask;
        }
        applyMask(g, mask);
    }
    drawFormat(g, level, best);
    applyMask(g, best);

    return { size: g.size, version, level, modules: g.modules };
}

/**
 * One `d` attribute covering every dark module, in module units, with the
 * origin at the top left of the grid rather than of the quiet zone.
 *
 * Horizontal runs become one rectangle each, which takes a version 40 code from
 * around thirty thousand path commands down to a few thousand.
 */
export function qrSvgPath(code: QRMatrixCode): string {
    const parts: string[] = [];
    for (let y = 0; y < code.size; y++) {
        let x = 0;
        while (x < code.size) {
            if (!code.modules[y][x]) {
                x++;
                continue;
            }
            let run = 1;
            while (x + run < code.size && code.modules[y][x + run]) run++;
            parts.push(`M${x} ${y}h${run}v1h-${run}z`);
            x += run;
        }
    }
    return parts.join('');
}

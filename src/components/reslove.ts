export function solveNonogram(
    rowHints: number[][],
    colHints: number[][],
    rows: number,
    cols: number
): (boolean | null)[][] {
    if (rows <= 0 || cols <= 0) {
        return [];
    }
    if (
        validateConstraints(rowHints, cols) === "fault" ||
        validateConstraints(colHints, rows) === "fault"
    ) {
        return [];
    }
    // 缓存行约束验证结果
    const rowValidCache: Record<string, boolean> = {};
    const colValidCache: Record<string, boolean> = {};

    // 生成所有可能组合（带缓存）
    let rowPossibles = rowHints.map((hint, i) => {
        const key = `${hint.join(",")},${cols}`;
        if (!rowValidCache[key]) {
            rowValidCache[key] = validateConstraints([hint], cols) !== "fault";
        }
        return rowValidCache[key] ? possible(hint, cols) : [];
    });

    let colPossibles = colHints.map((hint, i) => {
        const key = `${hint.join(",")},${rows}`;
        if (!colValidCache[key]) {
            colValidCache[key] = validateConstraints([hint], rows) !== "fault";
        }
        return colValidCache[key] ? possible(hint, rows) : [];
    });

    // 初始化网格（true=填充，false=空，null=未知）
    let grid: (boolean | null)[][] = Array(rows)
        .fill(null)
        .map(() => Array(cols).fill(null));
    let changed = true;
    let iteration = 0;
    const maxIterations = rows * cols * 2; // 设置最大迭代次数防止无限循环

    while (changed && iteration < maxIterations) {
        changed = false;
        iteration++;

        // 行处理
        for (let rowIndex = 0; rowIndex < rows; rowIndex++) {
            const row = getRow(grid, rowIndex);
            if (!row) continue;

            const filteredRows = filter(row, rowPossibles[rowIndex]);
            if (filteredRows.length === 0) continue;

            const commonPart = getCommonPart(filteredRows);
            for (let i = 0; i < commonPart.length; i++) {
                if (commonPart[i] !== null && grid[rowIndex][i] === null) {
                    grid[rowIndex][i] = commonPart[i];
                    changed = true;
                }
            }
        }

        // 列处理
        for (let colIndex = 0; colIndex < cols; colIndex++) {
            const col = getCol(grid, colIndex);
            if (!col) continue;

            const filteredCols = filter(col, colPossibles[colIndex]);
            if (filteredCols.length === 0) continue;

            const commonPart = getCommonPart(filteredCols);
            for (let i = 0; i < commonPart.length; i++) {
                if (commonPart[i] !== null && grid[i][colIndex] === null) {
                    grid[i][colIndex] = commonPart[i];
                    changed = true;
                }
            }
        }
    }

    return grid;
}

function getCommonPart(possibles: boolean[][]): (boolean | null)[] {
    if (possibles.length === 0) return [];
    if (possibles.length === 1) return possibles[0];

    const len = possibles[0].length;
    const result: (boolean | null)[] = new Array(len).fill(null);

    for (let i = 0; i < len; i++) {
        let allTrue = true;
        let allFalse = true;

        for (const p of possibles) {
            if (p[i]) {
                allFalse = false;
            } else {
                allTrue = false;
            }
            // 如果既不全为真也不全为假，提前退出
            if (!allTrue && !allFalse) break;
        }

        if (allTrue) result[i] = true;
        else if (allFalse) result[i] = false;
    }

    return result;
}

function filter(known: (boolean | null)[], poss: boolean[][]) {
    const res: boolean[][] = [];
    for (const row of poss) {
        let match = true;
        for (let i = 0; i < row.length; i++) {
            if (known[i] !== null && known[i] !== row[i]) {
                match = false;
                break;
            }
        }
        if (match) res.push(row);
    }
    return res;
}

function getRow(
    grid: (boolean | null)[][],
    rowIndex: number
): (boolean | null)[] | undefined {
    if (rowIndex < 0 || rowIndex >= grid.length) {
        return undefined;
    }
    return [...grid[rowIndex]];
}

function getCol(
    grid: (boolean | null)[][],
    colIndex: number
): (boolean | null)[] | undefined {
    if (grid.length === 0 || colIndex < 0 || colIndex >= grid[0].length) {
        return undefined;
    }
    return grid.map((row) => row[colIndex]);
}
function validateConstraints(values: number[][], length: number) {
    for (let i = 0; i < values.length; i++) {
        const blocks = values[i];
        const sum = blocks.reduce((acc, val) => acc + val, 0);
        if (sum + (blocks.length - 1) > length) {
            return "fault"; // 不满足基本条件
        } else if (sum + (blocks.length - 1) === length) {
            return "equal";
        }
    }
    return "right";
}

// 缓存计算结果
const possibleCache: Record<string, boolean[][]> = {};

function possible(values: number[], length: number) {
    const key = `${values.join(",")},${length}`;
    if (possibleCache[key]) return possibleCache[key];

    const resNum =
        length -
        values.reduce((acc, val) => acc + val, 0) -
        (values.length - 1);
    if (resNum < 0) return [];

    const blankNum = values.length + 1;
    const bres = generateCombinations(resNum, blankNum);
    const pos = genPos(bres, values);

    possibleCache[key] = pos;
    return pos;
}

function genPos(bres: number[][], values: number[]) {
    let res: boolean[][] = [];
    bres.forEach((bre) => res.push(cross(bre, values)));
    return res;
}
function cross(bre: number[], values: number[]) {
    let res = [];
    for (let i = 0; i < bre.length; i++) {
        for (let j = 0; j < bre[i]; j++) {
            res.push(false);
        }
        for (let j = 0; j < values[i]; j++) {
            res.push(true);
        }
    }
    return res;
}

// 使用动态规划生成组合
function generateCombinations(resNum: number, blankNum: number): number[][] {
    // 记忆化缓存
    const memo: Record<string, number[][]> = {};

    function dp(remaining: number, index: number): number[][] {
        const key = `${remaining},${index}`;
        if (memo[key]) return memo[key];

        if (index === blankNum) {
            return remaining === 0 ? [[]] : [];
        }

        const results: number[][] = [];
        for (let i = 0; i <= remaining; i++) {
            const rest = dp(remaining - i, index + 1);
            for (const r of rest) {
                results.push([i, ...r]);
            }
        }

        memo[key] = results;
        return results;
    }

    const combinations = dp(resNum, 0);

    // 调整中间间隔的空白数
    return combinations.map((comb) =>
        comb.map((val, idx) => (idx > 0 && idx < blankNum - 1 ? val + 1 : val))
    );
}

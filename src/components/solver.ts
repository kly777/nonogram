export function solveNonogram(
    rowHints: number[][],
    colHints: number[][],
    rows: number,
    cols: number
) {
    if (rows <= 0 || cols <= 0) {
        return { solution: [], status: "fault" };
    }
    if (
        validateConstraints(rowHints, cols) === "fault" ||
        validateConstraints(colHints, rows) === "fault"
    ) {
        return { solution: [], status: "fault" };
    }
    // 缓存行约束验证结果
    const rowValidCache: Record<string, boolean> = {};
    const colValidCache: Record<string, boolean> = {};

    // 生成所有可能组合
    let rowCandidates = rowHints.map((hint) => {
        const key = `${hint.join(",")},${cols}`;
        if (!rowValidCache[key]) {
            rowValidCache[key] = validateConstraints([hint], cols) !== "fault";
        }
        return rowValidCache[key] ? generatePossibleRows(hint, cols) : [];
    });

    let colCandidates = colHints.map((hint) => {
        const key = `${hint.join(",")},${rows}`;
        if (!colValidCache[key]) {
            colValidCache[key] = validateConstraints([hint], rows) !== "fault";
        }
        return colValidCache[key] ? generatePossibleRows(hint, rows) : [];
    });

    // 初始化网格（true=填充，false=空，null=未知）
    let grid: (boolean | null)[][] = Array(rows)
        .fill(null)
        .map(() => Array(cols).fill(null));
    let hasChanged = true;
    let hasWrong = false;
    let iteration = 0;
    const maxIterations = rows * cols * 2; // 设置最大迭代次数防止无限循环

    while (hasChanged && iteration < maxIterations && !hasWrong) {
        hasChanged = false;
        iteration++;

        // 行
        for (let rowIndex = 0; rowIndex < rows; rowIndex++) {
            const row = getRow(grid, rowIndex);
            if (!row) continue;

            const filteredRows = filterCandidates(row, rowCandidates[rowIndex]);
            if (filteredRows.length === 0) {
                hasWrong = true;
                break;
            }

            const commonPart = findCommonSolution(filteredRows);
            for (let i = 0; i < commonPart.length; i++) {
                if (commonPart[i] !== null && grid[rowIndex][i] === null) {
                    grid[rowIndex][i] = commonPart[i];
                    hasChanged = true;
                }
            }
        }

        // 列
        for (let colIndex = 0; colIndex < cols; colIndex++) {
            const col = getCol(grid, colIndex);
            if (!col) continue;

            const filteredCols = filterCandidates(col, colCandidates[colIndex]);
            if (filteredCols.length === 0) {
                hasWrong = true;
                break;
            }

            const commonPart = findCommonSolution(filteredCols);
            for (let i = 0; i < commonPart.length; i++) {
                if (commonPart[i] !== null && grid[i][colIndex] === null) {
                    grid[i][colIndex] = commonPart[i];
                    hasChanged = true;
                }
            }
        }
    }

    let status: SolutionStatus = "none";
    if (hasWrong) {
        status = "none";
    } else {
        // 检查是否仍有未确定的单元格
        const hasUnknown = grid.some((row) => row.includes(null));
        if (!hasUnknown) {
            status = "unique";
        } else {
            status = "multiple";
            // 生成一个完整解
            const fullSolution = backtrackSolution(
                rowHints,
                colHints,
                rows,
                cols,
                grid
            );
            return { solution: fullSolution, status };
        }
    }

    return { solution: grid, status };
}
export type SolutionStatus = "none" | "unique" | "multiple";
function findCommonSolution(possibles: boolean[][]): (boolean | null)[] {
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

function filterCandidates(known: (boolean | null)[], poss: boolean[][]) {
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

function generatePossibleRows(values: number[], length: number) {
    const key = `${values.join(",")},${length}`;
    if (possibleCache[key]) return possibleCache[key];

    const totalBlanks =
        length -
        values.reduce((acc, val) => acc + val, 0) -
        (values.length - 1);
    if (totalBlanks < 0) return [];

    const gapCount = values.length + 1;
    const blankCombinations = generateCombinations(totalBlanks, gapCount);
    const allRows = generateAllRows(blankCombinations, values);

    possibleCache[key] = allRows;
    return allRows;
}

function generateAllRows(blankCombinations: number[][], values: number[]) {
    let res: boolean[][] = [];
    blankCombinations.forEach((blankCombination) =>
        res.push(generateRowFromBlankCombination(blankCombination, values))
    );
    return res;
}
function generateRowFromBlankCombination(
    blankCombination: number[],
    values: number[]
) {
    let res = [];
    for (let i = 0; i < blankCombination.length; i++) {
        for (let j = 0; j < blankCombination[i]; j++) {
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

function backtrackSolution(
    rowHints: number[][],
    colHints: number[][],
    rows: number,
    cols: number,
    partialGrid: (boolean | null)[][]
): boolean[][] {
    const grid: boolean[][] = partialGrid.map(
        (row) =>
            row.map((cell) => (cell !== null ? cell : undefined)) as boolean[]
    );

    // 生成每一行的候选解
    const rowCandidates = rowHints.map((hint, i) =>
        generatePossibleRows(hint, cols).filter((row) =>
            isValidRowWithPartial(row, partialGrid[i])
        )
    );

    // 回溯填充
    function backtrack(rowIndex: number): boolean {
        if (rowIndex === rows) {
            return isValidSolution(grid, colHints, cols);
        }

        for (const candidate of rowCandidates[rowIndex]) {
            grid[rowIndex] = candidate;
            if (isColumnConstraintsValid(grid, colHints, rowIndex + 1, cols)) {
                if (backtrack(rowIndex + 1)) return true;
            }
        }

        return false;
    }

    backtrack(0);
    return grid;
}

// 辅助函数：检查候选行是否与部分解兼容
function isValidRowWithPartial(
    candidate: boolean[],
    partial: (boolean | null)[]
): boolean {
    return candidate.every(
        (val, i) => partial[i] === null || val === partial[i]
    );
}

// 辅助函数：检查列约束是否满足
function isColumnConstraintsValid(
    grid: boolean[][],
    colHints: number[][],
    rows: number,
    cols: number
): boolean {
    for (let c = 0; c < cols; c++) {
        const col = grid.slice(0, rows).map((row) => row[c]);
        const runLength = getRunLength(col);
        if (!arraysEqual(runLength, colHints[c])) return false;
    }
    return true;
}

// 辅助函数：计算行/列的块长度
function getRunLength(arr: boolean[]): number[] {
    const result: number[] = [];
    let count = 0;
    for (const val of arr) {
        if (val) {
            count++;
        } else if (count > 0) {
            result.push(count);
            count = 0;
        }
    }
    if (count > 0) result.push(count);
    return result;
}

function arraysEqual(a: number[], b: number[]): boolean {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) return false;
    }
    return true;
}

function isValidSolution(
    grid: boolean[][],
    colHints: number[][],
    cols: number
): boolean {
    for (let c = 0; c < cols; c++) {
        const col = grid.map((row) => row[c]);
        const runLength = getRunLength(col);
        if (!arraysEqual(runLength, colHints[c])) {
            return false;
        }
    }
    return true;
}

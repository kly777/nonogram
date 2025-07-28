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
    console.log("rowHints", rowHints, "colHints", colHints);
    console.log("rows", rows, "cols", cols);

    let rowPossibles = rowHints.map((hint) => possible(hint, cols));
    console.log(rowPossibles);
    let colPossibles = colHints.map((hint) => possible(hint, rows));
    console.log(colPossibles);

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
    
    console.log(`Completed in ${iteration} iterations`);

    return grid;
}

function getCommonPart(known: boolean[][]): (boolean | null)[] {
    if (known.length === 0) return [];
    if (known.length === 1) return known[0];

    const length = known[0].length;
    const samePart: (boolean | null)[] = Array(length).fill(null);

    for (let i = 0; i < length; i++) {
        const firstVal = known[0][i];
        const isSame = known.every((arr) => arr[i] === firstVal);

        samePart[i] = isSame ? firstVal : null;
    }

    return samePart;
}

function filter(known: (boolean | null)[], poss: boolean[][]) {
    let res: boolean[][] = [];
    poss.forEach((row) => {
        let ok = true;
        for (let i = 0; i < row.length; i++) {
            if (known[i] === null) {
                continue;
            } else if (known[i] !== row[i]) {
                console.log("filter", known[i], row[i]);
                ok = false;
            }
        }
        if (ok) {
            res.push(row);
        }
    });
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
    const key = `${values.join(',')},${length}`;
    if (possibleCache[key]) return possibleCache[key];
    
    const resNum = length - values.reduce((acc, val) => acc + val, 0) - (values.length - 1);
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
    return combinations.map(comb =>
        comb.map((val, idx) =>
            (idx > 0 && idx < blankNum - 1) ? val + 1 : val
        )
    );
}

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
    let changed = false;
    while (!changed) {
        changed = false;
        for (let rowIndex = 0; rowIndex < rows; rowIndex++) {
            let row = getRow(grid, rowIndex);

            if (!row) {
                continue;
            }
            console.log("row snapshot", [...row]);
            const filteredRows = filter(row, rowPossibles[rowIndex]);
            console.log("filteredRows", filteredRows);
            const commonPart = getCommonPart(filteredRows); // 获取确定部分
            console.log("commonPart", commonPart);

            // 更新网格
            for (let i = 0; i < commonPart.length; i++) {
                if (commonPart[i] !== null && grid[rowIndex][i] === null) {
                    grid[rowIndex][i] = commonPart[i];
                    changed = true;
                }
            }
        }
        for (let colIndex = 0; colIndex < cols; colIndex++) {
            let col = getCol(grid, colIndex);
            if (!col) {
                continue;
            }
            const filteredCols = filter(col, colPossibles[colIndex]);
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

function possible(values: number[], length: number) {
    let resNum =
        length -
        values.reduce((acc, val) => acc + val, 0) -
        (values.length - 1);

    let blankNum = values.length + 1;

    let bres = generateCombinations(resNum, blankNum);

    let pos = genPos(bres, values);

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

function generateCombinations(resNum: number, blankNum: number): number[][] {
    const results: number[][] = [];
    const current: number[] = Array(blankNum).fill(0);

    function backtrack(remaining: number, index: number): void {
        if (index === blankNum) {
            if (remaining === 0) {
                results.push([...current]);
            }
            return;
        }

        // 当前盒子可分配 0 到 remaining 个小球
        for (let i = 0; i <= remaining; i++) {
            current[index] = i;
            backtrack(remaining - i, index + 1);
            current[index] = 0; // 回溯
        }
    }

    backtrack(resNum, 0);

    results.map((res) => {
        res.map((item, index) => {
            res[index] =
                index === 0 || index === res.length - 1 ? item : item + 1;
        });
    });
    return results;
}

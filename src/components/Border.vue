<template>
  <div class="nonogram-solver">
    <h2>Nonogram Solver ({{ props.rows }}×{{ props.cols }})</h2>

    <div class="puzzle-container">
      <!-- 列标题 -->
      <div class="col-header" :style="{ gridTemplateColumns: `120px repeat(${props.cols}, 40px)` }">
        <div class="empty-cell"></div>
        <div class="col-title" v-for="col in props.cols" :key="'col-' + col">
          <label>Col {{ col }}</label>
          <input type="text" v-model="colValues[col - 1]" placeholder="e.g. 2 3" />
        </div>
      </div>

      <!-- 行和内容区域 -->
      <div class="puzzle-grid">
        <div class="puzzle-row" v-for="row in props.rows" :key="'row-' + row"
          :style="{ gridTemplateColumns: `120px repeat(${props.cols}, 40px)` }">
          <!-- 行标题 -->
          <div class="row-title">
            <label>Row {{ row }}</label>
            <input type="text" v-model="rowValues[row - 1]" placeholder="e.g. 1 4" />
          </div>

          <!-- 单元格区域 -->
          <div class="cell" :class="{
            filled: result?.[row - 1]?.[col - 1] === true,
            empty: result?.[row - 1]?.[col - 1] === false,
            unknown: result?.[row - 1]?.[col - 1] === null
          }" v-for="col in props.cols" :key="'cell-' + row + '-' + col">
          </div>
        </div>
      </div>
    </div>

    <!-- 结果状态 -->
    <div class="status">
      <div class="status-item">
        <div class="color-box filled"></div>
        <span>Filled</span>
      </div>
      <div class="status-item">
        <div class="color-box empty"></div>
        <span>Empty</span>
      </div>
      <div class="status-item">
        <div class="color-box unknown"></div>
        <span>Unknown</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { solveNonogram } from './reslove';

const result = ref<(boolean | null)[][]>([])

const props = defineProps<{
  rows: number
  cols: number
}>()

const rowValues = ref<string[]>(
  Array(props.rows).fill("")
)
const colValues = ref<string[]>(
  Array(props.cols).fill("")
)

watch(() => [props.rows, props.cols], ([rows, cols]) => {
  rowValues.value = Array(rows).fill("")
  colValues.value = Array(cols).fill("")
})

const rowHints = computed(() => {
  let result: number[][] = []
  rowValues.value.forEach((value, index) => {
    const values = value.split(" ").map(num => Number(num))
    result[index] = values
  })
  return result
})

const colHints = computed(() => {
  let result: number[][] = []
  colValues.value.forEach((value, index) => {
    const values = value.split(" ").map(num => Number(num))
    result[index] = values
  })
  return result
})

watch(() => [rowHints.value, colHints.value, props.rows, props.cols], () => {
  result.value = solveNonogram(rowHints.value, colHints.value, props.rows, props.cols)
  console.log(result.value)
})




</script>

<style scoped>
.nonogram-solver {
  margin: 0 auto;
  font-family: Arial, sans-serif;
}

h2 {
  margin-top: 0;
  text-align: center;
  margin-bottom: 20px;
  color: #333;
}

.puzzle-container {
  display: grid;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 10px;
}

.col-header {
  display: grid;
  gap: 4px;
  margin-bottom: 5px;
  position: sticky;
  left: 0;
}

.empty-cell {
  /* 占位列 */
  grid-column: 1;
}

.col-title {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.col-title label,
.row-title label {
  font-size: 12px;
  color: #666;
}

.puzzle-grid {
  display: grid;
  gap: 8px;
}

.puzzle-row {
  display: grid;
  gap: 4px;
  min-width: max-content;
}

.row-title {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-right: 10px;
  grid-column: 1;
}

.cell {
  width: 40px;
  height: 40px;
  border: 1px solid #ddd;
  border-radius: 2px;
  transition: background-color 0.2s;
}

.filled {
  background-color: #2c3e50;
}

.empty {
  background-color: #ecf0f1;
}

.unknown {
  background-color: #bdc3c7;
}

input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  text-align: center;
}

input:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

.status {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 20px;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #2c3e50;
}

.color-box {
  width: 20px;
  height: 20px;
  border: 1px solid rgb(0, 0, 0);
}
</style>
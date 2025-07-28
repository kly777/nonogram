<template>
  {{ props.rows }}*{{ props.cols }} | {{ rowValues }}{{ colValues }}
  <div class="border-container">
    <!-- 列输入框顶部对齐 -->
    <div class="col-header">
      <input type="text" v-for="col in props.cols" :key="col" v-model="colValues[col - 1]" />
    </div>

    <!-- 行输入框和内容区域 -->
    <div class="border-grid">
      <div class="border-row" v-for="row in props.rows" :key="row">
        <!-- 行输入框 -->
        <input type="text" v-model="rowValues[row - 1]" />

        <!-- 单元格区域 -->
        <div class="cell-row">
          <div class="border-cell" :class="{
            filled: result?.[row - 1]?.[col - 1] === true,
            empty: result?.[row - 1]?.[col - 1] === false,
            null: result?.[row - 1]?.[col - 1] === null

          }" v-for="col in props.cols" :key="col"></div>
        </div>
      </div>
    </div>
  </div>

  <!-- 调试显示 -->
  {{ rowHints }}{{ colHints }}
  <div> {{ result }}</div>

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
.filled {
  background-color: black;
}

.empty {
  background-color: white;
  /* 或其他颜色 */
}

.null {
  background-color: gray;
  /* 或其他颜色 */
}

.border-container {
  display: grid;
  grid-template-rows: auto 1fr;
  gap: 0.5rem;
}

/* 列输入框水平排列 */
.col-header {
  display: flex;
  gap: 0.5rem;
}

/* 输入框基础样式 */
input {
  width: 4rem;
  padding: 0.2rem;
  box-sizing: border-box;
}

/* 行级布局 */
.border-grid {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.border-row {
  display: grid;
  grid-template-columns: 5rem 1fr;
  /* 固定行输入框宽度 */
  gap: 0.5rem;
  align-items: start;
}

/* 单元格行布局 */
.cell-row {
  display: flex;
  gap: 0.5rem;
}

.border-cell {
  width: 2rem;
  height: 2rem;
}
</style>
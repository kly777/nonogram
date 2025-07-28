<script setup lang="ts">
import { ref } from 'vue';
import Border from './components/Border.vue';

const row = ref(15)
const col = ref(15)
</script>

<template>
  <div class="app-container">
    <h4 class="title">Nonogram Puzzle Solver</h4>

    <div class="control-panel">
      <div class="input-group">
        <label>Rows:</label>
        <input v-model="row" type="number" min="1" />
      </div>
      <div class="input-group">
        <label>Columns:</label>
        <input v-model="col" type="number" min="1" />
      </div>
    </div>

    <div class="puzzle-container">
      <Border :rows="row" :cols="col" />
    </div>
  </div>
</template>

<style scoped>
.app-container {
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

h4 {
  font-size: 24px;
  margin-top: 0;
  text-align: center;
  color: #2c3e50;
  margin-bottom: 15px;
}

.description {
  text-align: center;
  color: #7f8c8d;
  margin-bottom: 30px;
}

.control-panel {
  display: flex;
  justify-content: center;
  gap: 30px;
  margin-bottom: 30px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 8px;
  color: #2c3e50;
}

.input-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.input-group label {
  font-weight: bold;
}

.input-group input {
  width: 80px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  text-align: center;
}

.puzzle-container {
  display: flex;
  justify-content: center;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

@media (max-width: 768px) {
  .control-panel {
    flex-direction: column;
    align-items: center;
    gap: 15px;
  }

  .puzzle-container {
    padding: 10px;
  }
}
</style>

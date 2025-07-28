<script setup lang="ts">
import { ref } from 'vue';
import Border from './components/Border.vue';


const row = ref(10)
const col = ref(15)
</script>

<template>
  <input v-model="row" type="number"></input>
  <input v-model="col" type="number"></input>
  <div class="container">
    <Border :rows="row" :cols="col" />
  </div>
</template>

<style scoped>
.container {
  margin: 20px;
  height: 50%;
  width: 50%;
}
</style>

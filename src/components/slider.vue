<template>
  <div class="slider">
    <a-row>
      <a-col :span="12">
        <a-slider v-model:value="inputValue" :min="1" :max="20" />
      </a-col>
      <a-col :span="4">
        <a-input-number
          v-model:value="inputValue"
          :min="1"
          :max="20"
          style="margin-left: 16px"
          @change="changValue"
        />
      </a-col>
    </a-row>
  </div>
</template>
<script setup>
import { onMounted, ref, watch, $emit } from "vue";
const inputValue = ref(1);
watch(inputValue, (newV, oldV) => {
  // changValue();
});
const changValue = () => {
  emit("offset", inputValue.value);
};
onMounted(() => {});
</script>
<style scoped>
.slider {
  position: absolute;
  margin-left: 220px;
  margin-top: 50px;
  z-index: 10;
}
.code-box-demo .ant-slider {
  margin-bottom: 16px;
}
</style>

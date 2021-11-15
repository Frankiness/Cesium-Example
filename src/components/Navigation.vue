<template>
  <a-menu
    id="dddddd"
    v-model:openKeys="openKeys"
    v-model:selectedKeys="selectedKeys"
    style="width: 256px"
    mode="inline"
    @click="handleClick"
  >
    <a-menu-item key="1">
      <template #icon>
        <PieChartOutlined />
      </template>
      <span>Option 1</span>
    </a-menu-item>
    <a-menu-item key="2">
      <template #icon>
        <PieChartOutlined />
      </template>
      <span>Option 1</span>
    </a-menu-item>
  </a-menu>
</template>
<script setup>
import { ref, watch } from "vue";
import { useRouter } from "vue-router";
const route = useRouter();
const selectedKeys = ref(["1"]);
const openKeys = ref(["sub1"]);

const handleClick = (e) => {
  console.log("click", e);
};

const titleClick = (e) => {
  console.log("titleClick", e);
};

watch(
  () => openKeys,
  (val) => {
    console.log("openKeys", val);
  }
);
</script>

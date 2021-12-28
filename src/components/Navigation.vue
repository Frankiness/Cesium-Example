<template>
  <a-menu
    v-model:selectedKeys="selectedKeys"
    style="width: 256px"
    mode="inline"
    @click="handleClick"
  >
    <a-sub-menu>
      <template #title>Cesium示例</template>
      <a-menu-item-group>
        <a-menu-item key="1">测量功能</a-menu-item>
        <a-menu-item key="2">Option 2</a-menu-item>
      </a-menu-item-group>
    </a-sub-menu>
  </a-menu>
</template>
<script setup>
import { ref, watch } from "vue";
import { useRouter } from "vue-router";
const route = useRouter();
const selectedKeys = ref(["1"]);

const handleClick = (e) => {
  if (e.key === "1") {
    route.push({
      path: "/page1",
    });
  } else {
    route.push({
      path: "/page2",
    });
  }
};
</script>

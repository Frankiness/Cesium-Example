//cesiumMap.vue
<template>
  <div id="cesiumContainer"></div>
</template>
<script setup lang="ts">
import * as Cesium from "cesium";
import { onMounted } from "vue";
const initCesium = () => {
  window.viewer = new Cesium.Viewer("cesiumContainer", {
    baseLayerPicker: false, // 如果设置为false，将不会创建右上角图层按钮。
    geocoder: false, // 如果设置为false，将不会创建右上角查询(放大镜)按钮。
    navigationHelpButton: false, // 如果设置为false，则不会创建右上角帮助(问号)按钮。
    homeButton: false, // 如果设置为false，将不会创建右上角主页(房子)按钮。
    sceneModePicker: false, // 如果设置为false，将不会创建右上角投影方式控件(显示二三维切换按钮)。
    animation: false, // 如果设置为false，将不会创建左下角动画小部件。
    timeline: false, // 如果设置为false，则不会创建正下方时间轴小部件。
    fullscreenButton: false, // 如果设置为false，将不会创建右下角全屏按钮。
    scene3DOnly: false, // 为 true 时，每个几何实例将仅以3D渲染以节省GPU内存。
    shouldAnimate: true, // 默认true ，否则为 false 。此选项优先于设置 Viewer＃clockViewModel 。
    // ps. Viewer＃clockViewModel 是用于控制当前时间的时钟视图模型。我们这里用不到时钟，就把shouldAnimate设为false
    infoBox: false, // 是否显示点击要素之后显示的信息
    sceneMode: 3, // 初始场景模式 1 2D模式 2 2D循环模式 3 3D模式  this.Cesium.SceneMode
    requestRenderMode: false, // 启用请求渲染模式，不需要渲染，节约资源吧
    selectionIndicator: false, // 关闭绿色选择框
  });
  window.viewer._cesiumWidget._creditContainer.style.display = "none"; //去除cesium按钮
  window.viewer.scene.globe.depthTestAgainstTerrain = true;
};
onMounted(() => {
  initCesium();
});
</script>

<style scoped>
#cesiumContainer {
  height: 100%;
  width: 100%;
  overflow: hidden;
}
</style>

<template>
  <div id="cesium-container">22222222</div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import * as Cesium from "cesium";
// import Distance from "../assets/js/test";
import DrawPoint from "../assets/js/drawPoint";
import DrawLine from "../assets/js/drawLine";
import DrawCurve from "../assets/js/drawCurve";
import DrawArrow from "../assets/js/drawArrow";
const initEarth = () => {
  const viewer = new Cesium.Viewer("cesium-container", {
    animation: false, //是否创建动画小器件，左下角仪表
    baseLayerPicker: false, //是否显示图层选择器
    fullscreenButton: true, //是否显示全屏按钮
    geocoder: true, //是否显示geocoder小器件，右上角查询按钮
    homeButton: false, //是否显示Home按钮
    infoBox: false, //是否显示信息框
    sceneModePicker: false, //是否显示3D/2D选择器
    selectionIndicator: false, //是否显示选取指示器组件
    timeline: false, //是否显示时间轴
    sceneMode: Cesium.SceneMode.SCENE3D, //设定3维地图的默认场景模式:Cesium.SceneMode.SCENE2D、Cesium.SceneMode.SCENE3D、Cesium.SceneMode.MORPHING
    navigationHelpButton: false, //是否显示右上角的帮助按钮
    scene3DOnly: true, //如果设置为true，则所有几何图形以3D模式绘制以节约GPU资源
    navigationInstructionsInitiallyVisible: false,
    showRenderLoopErrors: false, //是否显示渲染错误
    orderIndependentTranslucency: false,
    terrainProvider: Cesium.createWorldTerrain(), //地形
    contextOptions: {
      webgl: {
        alpha: true,
      },
    },
  });
  viewer._cesiumWidget._creditContainer.style.display = "none";
  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(-117.16, 32.71, 15000.0),
  });
  // Distance(viewer, {}, Cesium);
  let cb = () => {
    console.log("绘制完成");
  };
  let point = new DrawArrow({
    viewer,
    Cesium,
    callback: cb,
  });
  point.startCreate();
};
const distance = () => {};
onMounted(() => {
  // initEarth();
  // distance();
});
</script>

<style scoped>
#cesium-container {
  /* width: 100%;
  height: 100%; */
  margin: 0;
}
</style>

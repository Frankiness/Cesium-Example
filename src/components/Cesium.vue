<template>
  <div id="cesium-container" :style="{ cursor: cursorStyle }"></div>
  <div id="list">
    <div id="point" class="icon" title="点" @click="drawPoint"></div>
    <div id="line" class="icon" title="线" @click="drawLine"></div>
    <div id="curve" class="icon" title="曲线" @click="drawCurve"></div>
    <div id="polyline" class="icon" title="折线" @click="drawPolyline"></div>
    <div id="arrow" class="icon" title="箭头" @click="drawArrow"></div>
    <div id="clear" class="icon" title="清除全部"></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import * as Cesium from "cesium";
import DrawPoint from "../assets/js/drawPoint";
import DrawLine from "../assets/js/drawLine";
import DrawCurve from "../assets/js/drawCurve";
import DrawArrow from "../assets/js/drawArrow";
import DrawPolyline from "../assets/js/drawPolyline";

let cursorStyle = ref("default");
const initEarth = () => {
  window.viewer = new Cesium.Viewer("cesium-container", {
    animation: false, //是否创建动画小器件，左下角仪表
    baseLayerPicker: false, //是否显示图层选择器
    fullscreenButton: false, //是否显示全屏按钮
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
    destination: Cesium.Cartesian3.fromDegrees(117.16, 32.71, 5000000.0),
  });
  // let point = new DrawArrow({
  //   viewer,
  //   Cesium,
  //   callback: cb,
  // });
  // point.startCreate();
};
let cb = () => {
  cursorStyle.value = "default";
  console.log("绘制完成");
};
// draw point
const drawPoint = () => {
  cursorStyle.value = "crosshair";
  let point = new DrawPoint({ viewer, Cesium, callback: cb });
  point.startCreate();
};
// draw line
const drawLine = () => {
  cursorStyle.value = "crosshair";
  let line = new DrawLine({
    viewer,
    Cesium,
    callback: cb,
  });
  line.startCreate();
};
// draw curve
const drawCurve = () => {
  cursorStyle.value = "crosshair";
  let curve = new DrawCurve({
    viewer,
    Cesium,
    callback: cb,
  });
  curve.startCreate();
};
// draw arrow
const drawArrow = () => {
  cursorStyle.value = "crosshair";
  let arrow = new DrawArrow({
    viewer,
    Cesium,
    callback: cb,
  });
  arrow.startCreate();
};
// draw polyline
const drawPolyline = () => {
  cursorStyle.value = "crosshair";
  let polyline = new DrawPolyline({ viewer, Cesium, callback: cb });
  polyline.startCreate();
};
onMounted(() => {
  initEarth();
});
</script>

<style lang="less" scoped>
@import "../assets/css/globe.less";
#cesium-container {
  width: 100%;
  height: 100%;
  margin: 0;
}
#list {
  width: 100%;
  height: 40px;
  position: absolute;
  margin-left: 210px;
  display: flex;
  #point {
    .icon(url(../assets/images/点.png));
  }
  #line {
    .icon(url(../assets/images/line.png));
  }
  #curve {
    .icon(url(../assets/images/curve.png));
  }
  #arrow {
    .icon(url(../assets/images/箭头1.png));
  }
  #polyline {
    .icon(url(../assets/images/polyline.png));
  }
  #clear {
    .icon(url(../assets/images/清除.png));
  }
}
</style>

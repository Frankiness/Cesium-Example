<template>
  <div id="cesium-container" :style="{ cursor: cursorStyle }"></div>
  <div id="list">
    <div id="point" class="icon" title="点" @click="drawPoint"></div>
    <div id="curve" class="icon" title="曲线" @click="drawCurve"></div>
    <div id="polyline" class="icon" title="折线" @click="drawPolyline"></div>
    <div id="arrow" class="icon" title="箭头" @click="drawArrow"></div>
    <div id="rectangle" class="icon" title="矩形" @click="drawRectangle"></div>
    <div id="polygon" class="icon" title="多边形" @click="drawPolygon"></div>

    <div id="clear" class="icon" title="清除全部" @click="clearAll"></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import * as Cesium from "cesium";
import DrawPoint from "../assets/js/drawPoint";
import DrawCurve from "../assets/js/drawCurve";
import DrawArrow from "../assets/js/drawArrow";
import DrawPolyline from "../assets/js/drawPolyline";
import DrawRectangle from "../assets/js/drawRectangle";
import measureArea from "../assets/js/measureArea";

let cursorStyle = ref("default"); //鼠标样式
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
    // terrainProvider: Cesium.createWorldTerrain(), //地形
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
};
let cb = () => {
  cursorStyle.value = "default";
};
// draw point
const drawPoint = () => {
  cursorStyle.value = "crosshair";
  window.pointObj = new DrawPoint({ viewer, Cesium, callback: cb });
  pointObj.startCreate();
};
// draw curve
const drawCurve = () => {
  cursorStyle.value = "crosshair";
  window.curveObj = new DrawCurve({
    viewer,
    Cesium,
    callback: cb,
  });
  curveObj.startCreate();
};
// draw arrow
const drawArrow = () => {
  cursorStyle.value = "crosshair";
  window.arrowObj = new DrawArrow({
    viewer,
    Cesium,
    callback: cb,
  });
  arrowObj.startCreate();
};
// draw polyline
const drawPolyline = () => {
  cursorStyle.value = "crosshair";
  window.polylineObj = new DrawPolyline({ viewer, Cesium, callback: cb });
  polylineObj.startCreate();
};
const clearAll = () => {
  window.pointObj && pointObj.clear();
  window.curveObj && curveObj.clear();
  window.arrowObj && arrowObj.clear();
  window.polylineObj && polylineObj.clear();
};
const drawRectangle = () => {
  cursorStyle.value = "crosshair";
  window.rectangleObj = new DrawRectangle({ viewer, Cesium, callback: cb });
  rectangleObj.startCreate();
};
const drawPolygon = () => {
  cursorStyle.value = "crosshair";
  window.polygonAreaObj = new measureArea({ viewer, Cesium, callback: cb });
  polygonAreaObj.startCreate();
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
  #rectangle {
    .icon(url(../assets/images/面.png));
  }
  #polygon {
    .icon(url(../assets/images/polygon.png));
  }
}
</style>

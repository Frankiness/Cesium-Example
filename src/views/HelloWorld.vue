<template>
  <div id="cesium-container"></div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import * as Cesium from "cesium";
import Distance from "../utils/measureDistance";
import measureArea from "../utils/measureArea";
import ViewShedStage from "../utils/shadowMap";

Cesium.Ion.defaultAccessToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJlYmM3NzlhYS02YjhiLTRlOTAtOGEzZC1hZTllODU0NzA3ZWMiLCJpZCI6Njg4MzksImlhdCI6MTYzMjg5OTE3MH0.HdCmon1M2xx-DeEbEAiFqvZnfEWbQlGetJsFN2qh-Cg";

// let viewer = null;
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
  // measureArea(viewer, {}, Cesium);
  window.Cesium = Cesium;
  window.viewer = viewer;
  loadTiles();
  getPos();
};

function loadTiles() {
  const tileset = new Cesium.Cesium3DTileset({
    url: `http://localhost:9003/model/Qd8heKRv/tileset.json`,
    skipLevelOfDetail: true,
    baseScreenSpaceError: 1024,
    maximumScreenSpaceError: 64, // 数值加大，成像越模糊
    skipScreenSpaceErrorFactor: 16,
    skipLevels: 1,
    immediatelyLoadDesiredLevelOfDetail: false,
    loadSiblings: true, // 如果为true则不会在已加载完概况房屋后，自动从中心开始超清化房屋
    cullWithChildrenBounds: true,
    cullRequestsWhileMoving: true,
    cullRequestsWhileMovingMultiplier: 10, // 值越小能够更快的剔除
    preloadWhenHidden: true,
    preferLeaves: true,
    maximumMemoryUsage: 128, // 内存分配变小有利于倾斜摄影数据回收，提升性能体验
    progressiveResolutionHeightFraction: 0.8, // 数值偏于0能够让初始加载变得模糊
    dynamicScreenSpaceErrorDensity: 0.6, // 数值加大，能让周边加载变快
    dynamicScreenSpaceErrorFactor: 1,
    dynamicScreenSpaceError: false, // 根据测试，有了这个后，会在真正的全屏加载完之后才清晰化房屋
  });

  tileset.readyPromise.then(function (tileset) {
    //笛卡尔转换为弧度
    const cartographic = Cesium.Cartographic.fromCartesian(
      tileset.boundingSphere.center
    );
    const lng = Cesium.Math.toDegrees(cartographic.longitude); //使用经纬度和弧度的转换，将WGS84弧度坐标系转换到目标值，弧度转度
    const lat = Cesium.Math.toDegrees(cartographic.latitude);
    //计算中心点位置的地表坐标
    const surface = Cesium.Cartesian3.fromDegrees(lng, lat, 0);
    //偏移后的坐标
    const offset = Cesium.Cartesian3.fromDegrees(lng, lat, 5);
    const translation = Cesium.Cartesian3.subtract(
      offset,
      surface,
      new Cesium.Cartesian3()
    );
    tileset.modelMatrix = Cesium.Matrix4.fromTranslation(translation);
  });
  viewer.scene.primitives.add(tileset);
  viewer.flyTo(tileset);
}

function getPos() {
  // 获取点位信息
  let scene = viewer.scene;
  let handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);
  handler.setInputAction(function (event) {
    let wp = event.position;
    if (!Cesium.defined(wp)) {
      return;
    }
    // 笛卡尔坐标
    let cartesian = scene.pickPosition(wp);
    if (!Cesium.defined(cartesian)) {
      return;
    }
    // 经纬度坐标
    let ellipsoid = scene.globe.ellipsoid;
    let xyz = new Cesium.Cartesian3(cartesian.x, cartesian.y, cartesian.z);
    // let wgs84 = ellipsoid.cartesianToCartographic(xyz);
    // let lon = Cesium.Math.toDegrees(wgs84.longitude);
    // let lat = Cesium.Math.toDegrees(wgs84.latitude);
    console.log(cartesian);
    new ViewShedStage(viewer, {
      viewPosition: xyz,
      viewDistance: 1000,
    });
  }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
}

onMounted(() => {
  initEarth();
});
</script>

<style scoped>
#cesium-container {
  width: 100%;
  height: 100%;
  margin: 0;
}
</style>

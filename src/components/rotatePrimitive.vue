<template>
  <div class="slider">
    <p style="color: white">旋转X轴：</p>
    <a-col :span="50">
      <a-slider v-model:value="rotateX_Value" :min="1" :max="360" />
    </a-col>
    <p style="color: white">旋转Y轴：</p>
    <a-col :span="50">
      <a-slider v-model:value="rotateY_Value" :min="1" :max="360" />
    </a-col>
    <p style="color: white">旋转Z轴：</p>
    <a-col :span="50">
      <a-slider v-model:value="rotateZ_Value" :min="1" :max="360" />
    </a-col>
    <p style="color: white">缩放：</p>
    <a-col :span="50">
      <a-slider v-model:value="scaleVal" :min="1" :max="360" />
    </a-col>
  </div>
  <div id="cesium-container"></div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import * as Cesium from "cesium";

let rotateX_Value = ref(1);
let rotateY_Value = ref(1);
let rotateZ_Value = ref(1);
let scaleVal = ref(1);
let model;
watch(rotateX_Value, (newV) => {
  rotateX(newV);
});
watch(scaleVal, (val) => {
  scale(val);
});
watch(rotateY_Value, (val) => {
  rotateY(val);
});
watch(rotateZ_Value, (val) => {
  rotateZ(val);
});

//放大缩小
let scale = (value) => {
  let m1 = Cesium.Matrix3.fromScale(new Cesium.Cartesian3(value, value, value));
  trasnlate(m1);
};
//旋转
let rotateX = (anglex) => {
  let mat = model.modelMatrix;
  let m1 = Cesium.Matrix3.fromRotationX(Cesium.Math.toRadians(anglex));
  model.modelMatrix = Cesium.Matrix4.multiplyByMatrix3(
    mat,
    m1,
    new Cesium.Matrix4()
  );
};

let rotateY = (angley) => {
  let m1 = Cesium.Matrix3.fromRotationY(Cesium.Math.toRadians(angley));
  trasnlate(m1);
};

let rotateZ = (anglez) => {
  let m1 = Cesium.Matrix3.fromRotationZ(Cesium.Math.toRadians(anglez));
  trasnlate(m1);
};
let trasnlate = (transformin) => {};

const initEarth = async () => {
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
    // terrainProvider: new Cesium.CesiumTerrainProvider({
    //   url: "http://124.71.153.0:31080/tif",
    // }), //地形
    contextOptions: {
      webgl: {
        alpha: true,
      },
    },
  });
  viewer._cesiumWidget._creditContainer.style.display = "none";
};

let createPrimitive = () => {};
onMounted(() => {
  initEarth();
  createPrimitive();
});
</script>

<style lang="less" scoped>
@import "../assets/css/globe.less";
#cesium-container {
  width: 100%;
  height: 100%;
  margin: 0;
}
.slider {
  width: 200px;
  position: absolute;
  margin-left: 220px;
  margin-top: 50px;
  z-index: 10;
}
.code-box-demo .ant-slider {
  margin-bottom: 16px;
}
</style>

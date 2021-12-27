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
  <div id="cesium-container" :style="{ cursor: cursorStyle }"></div>
  <!-- <div id="list">
    <div id="point" class="icon" title="点" @click="drawPoint"></div>
    <div id="curve" class="icon" title="曲线" @click="drawCurve"></div>
    <div id="polyline" class="icon" title="折线" @click="drawPolyline"></div>
    <div id="arrow" class="icon" title="箭头" @click="drawArrow"></div>
    <div id="rectangle" class="icon" title="矩形" @click="drawRectangle"></div>
    <div id="polygon" class="icon" title="多边形" @click="drawPolygon"></div>
    <div id="clear" class="icon" title="清除全部" @click="clearAll"></div>
  </div> -->
  <Test></Test>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import * as Cesium from "cesium";
import DrawPoint from "../assets/js/drawPoint";
import DrawCurve from "../assets/js/drawCurve";
import DrawArrow from "../assets/js/drawArrow";
import DrawPolyline from "../assets/js/drawPolyline";
import DrawRectangle from "../assets/js/drawRectangle";
import measureArea from "../assets/js/measureArea";
import Test from "../components/test.vue";

let rotateX_Value = ref(1);
let rotateY_Value = ref(1);
let rotateZ_Value = ref(1);
let finalMatrix = null;
let scaleVal = ref(1);
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
  params.rx = anglex;
  update3dtilesMaxtrix();
  // 把旋转的度数转换为弧度制，并建立一个围绕X轴的旋转矩阵
  // let m1 = Cesium.Matrix3.fromRotationX(Cesium.Math.toRadians(anglex));
  // trasnlate(m1);
};

let rotateY = (angley) => {
  params.ry = angley;
  update3dtilesMaxtrix();
};

let rotateZ = (anglez) => {
  params.rz = anglez;
  update3dtilesMaxtrix();
};
let trasnlate = (transformin) => {
  console.log(transformin);
  let x = Cesium.Matrix4.fromRotationTranslation(transformin);
  console.log(x);
  // let transformMat
  // if(finalMatrix){
  //   Cesium.Matrix4.multiply(x, finalMatrix, transformMat);
  // }else{
  //   transformMat = m; //原矩阵
  // }

  // 因为是齐次变换矩阵，所以只需要用到三维矩阵
  let matRotation = Cesium.Matrix4.getMatrix3(
    transformMat,
    new Cesium.Matrix3()
  );
  let inverseMatRotation = Cesium.Matrix3.inverse(
    matRotation,
    new Cesium.Matrix3()
  ); //旋转矩阵的逆
  // 获得平移部分的坐标值
  let matTranslation = Cesium.Matrix4.getTranslation(
    transformMat,
    new Cesium.Cartesian3()
  );

  let transformation = Cesium.Transforms.eastNorthUpToFixedFrame(boxCenter); //以包围盒的中间建立一个矩阵
  let transformRotation = Cesium.Matrix4.getMatrix3(
    transformation,
    new Cesium.Matrix3()
  );
  // 获取齐次矩阵平移的值
  let transformTranslation = Cesium.Matrix4.getTranslation(
    transformation,
    new Cesium.Cartesian3()
  );
  // 平移的差值
  let matToTranslation = Cesium.Cartesian3.subtract(
    matTranslation,
    transformTranslation,
    new Cesium.Cartesian3()
  );
  matToTranslation = Cesium.Matrix4.fromTranslation(
    matToTranslation,
    new Cesium.Matrix4()
  );

  let matToTransformation = Cesium.Matrix3.multiply(
    inverseMatRotation,
    transformRotation,
    new Cesium.Matrix3()
  );
  matToTransformation = Cesium.Matrix3.inverse(
    matToTransformation,
    new Cesium.Matrix3()
  );
  matToTransformation =
    Cesium.Matrix4.fromRotationTranslation(matToTransformation);

  let rotationTranslation = Cesium.Matrix4.fromRotationTranslation(transformin);

  Cesium.Matrix4.multiply(transformation, rotationTranslation, transformation);
  Cesium.Matrix4.multiply(transformation, matToTransformation, transformation);
  Cesium.Matrix4.multiply(transformation, matToTranslation, transformation);
  tileset.modelMatrix = transformation;
  finalMatrix = Cesium.Matrix4.clone(tileset.modelMatrix);
};
let params = {
  tx: 121, //模型中心X轴坐标（经度，单位：十进制度）
  ty: 32, //模型中心Y轴坐标（纬度，单位：十进制度）
  tz: 10, //模型中心Z轴坐标（高度，单位：米）
  rx: -100, //X轴（经度）方向旋转角度（单位：度）圆心应该是在地心，改动其中一个值的时候，不止变化了该变量，比如改动ry，模型的高度也有了显著上升
  ry: 10, //Y轴（纬度）方向旋转角度（单位：度）
  rz: 0, //Z轴（高程）方向旋转角度（单位：度）
};
let update3dtilesMaxtrix = function () {
  //旋转
  var mx = Cesium.Matrix3.fromRotationX(Cesium.Math.toRadians(params.rx));
  var my = Cesium.Matrix3.fromRotationY(Cesium.Math.toRadians(params.ry));
  var mz = Cesium.Matrix3.fromRotationZ(Cesium.Math.toRadians(params.rz));
  var rotationX = Cesium.Matrix4.fromRotationTranslation(mx);
  var rotationY = Cesium.Matrix4.fromRotationTranslation(my);
  var rotationZ = Cesium.Matrix4.fromRotationTranslation(mz);
  //平移
  var position = Cesium.Cartesian3.fromDegrees(params.tx, params.ty, params.tz);

  var m = Cesium.Transforms.eastNorthUpToFixedFrame(position);
  //旋转、平移矩阵相乘
  Cesium.Matrix4.multiply(m, rotationX, m);
  Cesium.Matrix4.multiply(m, rotationY, m);
  Cesium.Matrix4.multiply(m, rotationZ, m);
  //赋值给tileset
  tileset._root.transform = m;
};
let cursorStyle = ref("default"); //鼠标样式
let boxCenter;
let m, tileset;
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
  // viewer.camera.flyTo({
  //   //定位过去
  //   destination: Cesium.Cartesian3.fromDegrees(105.931115, 27.961774, 1000),
  // });
  viewer._cesiumWidget._creditContainer.style.display = "none";

  tileset = new Cesium.Cesium3DTileset({
    url: "http://data.mars3d.cn/3dtiles/bim-daxue/tileset.json", //此处填写tileset url地址
    maximumScreenSpaceError: 1,
  });
  viewer.scene.primitives.add(tileset);
  viewer.zoomTo(tileset);
  tileset.readyPromise.then(function (tileset) {
    update3dtilesMaxtrix();
    boxCenter = Cesium.Cartesian3.clone(tileset.boundingSphere.center); //获取包围盒中心
  });

  m = Cesium.Matrix4.clone(tileset.modelMatrix);

  // viewer.camera.flyTo({
  //   destination: Cesium.Cartesian3.fromDegrees(117.16, 32.71, 5000000.0),
  // });
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

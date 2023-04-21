<template>
  <div id="cesium-container"></div>
</template>

<script setup>
import { onMounted } from "vue";
import * as Cesium from "cesium";

const terrainProvider = Cesium.createWorldTerrain();

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
    terrainProvider: terrainProvider, //地形
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
  window.Cesium = Cesium;
  window.viewer = viewer;
  loadTiles();
  // loadGLTF();
  viewer.scene.globe.show = false; // 不显示地球
};

function loadTiles() {
  const tileset = new Cesium.Cesium3DTileset({
    url: `http://localhost:9003/model/tHto7Ipcy/tileset.json`,
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
    customShader: new Cesium.CustomShader({
      lightingModel: Cesium.LightingModel.UNLIT,
      fragmentShaderText: `
        void fragmentMain(FragmentInput fsInput, inout czm_modelMaterial material)
        {
          vec3 normalEC = fsInput.attributes.normalEC; // 视图坐标下的法向量
          vec3 normalMC = czm_inverseNormal * normalEC; // 模型坐标下的法向量
          vec3 color = material.diffuse;
          vec3 white = vec3(1.0,1.0,1.0);
          float m = dot(normalMC, vec3(0.0,1.0,0.0)); // y轴方向雪覆盖程度
          m = pow(m,1.0); // 指数越小，积雪越厚
          material.diffuse = mix(color, white, clamp(m,0.0,1.0) * 0.7); // 混合颜色，调整透明度
        }
        `,
    }),
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

function loadGLTF() {
  const modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(
    Cesium.Cartesian3.fromDegrees(110.62898254394531, 40.02804946899414, 600.0)
  );
  const model = viewer.scene.primitives.add(
    Cesium.Model.fromGltf({
      url: "red.glb", //gltf文件的URL
      modelMatrix: modelMatrix,
      scale: 100.0, //放大倍数
      customShader: new Cesium.CustomShader({
        lightingModel: Cesium.LightingModel.UNLIT,
        fragmentShaderText: `
        void fragmentMain(FragmentInput fsInput, inout czm_modelMaterial material)
        {
          vec3 normalEC = fsInput.attributes.normalEC; // 视图坐标下的法向量
          vec3 normalMC = czm_inverseNormal * normalEC; // 模型坐标下的法向量
          vec3 color = material.diffuse;
          vec3 white = vec3(1.0,1.0,1.0);
          float m = dot(normalMC, vec3(0.0,1.0,0.0)); // y轴方向雪覆盖程度
          // m = pow(m,3.0);
          material.diffuse = mix(color, white, clamp(m,0.0,1.0) * 0.9); // 混合颜色，调整透明度
        }
        `,
      }),
    })
  );
  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(
      110.62898254394531,
      40.02804946899414,
      6000.0
    ), //相机飞入点
  });
}

onMounted(() => {
  initEarth();
});
</script>

<style scoped>
#cesium-container {
  width: 100%;
  height: 900px;
  margin: 0;
  position: relative;
}
</style>

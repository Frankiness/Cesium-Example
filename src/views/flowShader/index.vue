<template>
  <div id="cesium-container"></div>
</template>

<script setup>
import { onMounted } from "vue";
import * as Cesium from "cesium";
import { source, vertexShader, fragmentShader } from "./shader.js";

const initEarth = () => {
  var viewer = new Cesium.Viewer("cesium-container");
  viewer.scene.globe.show = false; // 不显示地球

  let inst = new Cesium.GeometryInstance({
    geometry: Cesium.BoxGeometry.createGeometry(
      new Cesium.BoxGeometry({
        vertexFormat: Cesium.VertexFormat.POSITION_NORMAL_AND_ST,
        maximum: new Cesium.Cartesian3(250000.0, 250000.0, 250000.0),
        minimum: new Cesium.Cartesian3(-250000.0, -250000.0, -250000.0),
      })
    ),
  });

  // 自定义材质
  let aper = new Cesium.MaterialAppearance({
    material: new Cesium.Material({
      fabric: {
        uniforms: {
          iTime: 0,
        },
        source: source,
      },
    }),
    translucent: true,
    vertexShaderSource: vertexShader,
    fragmentShaderSource: fragmentShader,
  });

  let modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(
    Cesium.Cartesian3.fromDegrees(110, 40, 10)
  );

  viewer.scene.primitives.add(
    new Cesium.Primitive({
      geometryInstances: new Cesium.GeometryInstance({
        geometry: new Cesium.RectangleGeometry({
          rectangle: Cesium.Rectangle.fromDegrees(116, 37, 119, 39.7),
        }),
      }),
      appearance: aper,
      // vertexFormat: Cesium.VertexFormat.POSITION_NORMAL_AND_ST,
    })
  );

  viewer.camera.flyToBoundingSphere(
    new Cesium.BoundingSphere(
      Cesium.Cartesian3.fromDegrees(116, 39, 10),
      950000
    ),
    {
      duration: 0.1,
    }
  );

  function renderLoop(timestamp) {
    aper.material.uniforms.iTime = timestamp / 1000;
    requestAnimationFrame(renderLoop);
  }

  renderLoop();
};

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

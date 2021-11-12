function Distance(viewer, handler, Cesium) {
  // 取消双击事件-追踪该位置
  viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(
    Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK
  );
  // 定义侦听器
  handler = new Cesium.ScreenSpaceEventHandler(
    viewer.scene._imageryLayerCollection
  );
  let positions = [];
  let poly = null;
  let distance = 0;
  let cartesian = null;
  let floatingPoint;
  // 获取鼠标最后的位置
  handler.setInputAction(function (movement) {
    let ray = viewer.camera.getPickRay(movement.endPosition);
    cartesian = viewer.scene.globe.pick(ray, viewer.scene);
    if (positions.length >= 2) {
      if (!Cesium.defined(poly)) {
        poly = new PolyLinePrimitive(positions, Cesium);
      } else {
        positions.pop();
        positions.push(cartesian);
      }
      distance = getSpaceDistance(positions);
    }
  }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

  handler.setInputAction(function (movement) {
    let ray = viewer.camera.getPickRay(movement.position);
    cartesian = viewer.scene.globe.pick(ray, viewer.scene);
    if (positions.length == 0) {
      positions.push(cartesian.clone());
    }
    positions.push(cartesian);
    //在三维场景中添加Label
    let textDisance = distance + "米";
    floatingPoint = viewer.entities.add({
      name: "空间直线距离",
      position: positions[positions.length - 1],
      point: {
        pixelSize: 5,
        color: Cesium.Color.RED,
        outlineColor: Cesium.Color.WHITE,
        outlineWidth: 2,
      },
      label: {
        text: textDisance,
        font: "18px sans-serif",
        fillColor: Cesium.Color.GOLD,
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        outlineWidth: 2,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        pixelOffset: new Cesium.Cartesian2(20, -20),
      },
    });
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

  handler.setInputAction(function (movement) {
    handler.destroy(); //关闭事件句柄
    positions.pop(); //最后一个点无效
  }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);

  //空间两点距离计算函数
  function getSpaceDistance(positions) {
    let distance = 0; //总距离
    // 与后一个点之间计算距离然后叠加
    for (let i = 0; i < positions.length - 1; i++) {
      let point1cartographic = Cesium.Cartographic.fromCartesian(positions[i]); //笛卡尔坐标转经纬度
      let point2cartographic = Cesium.Cartographic.fromCartesian(
        positions[i + 1]
      );
      /**根据经纬度计算出球面距离**/
      let geodesic = new Cesium.EllipsoidGeodesic();
      geodesic.setEndPoints(point1cartographic, point2cartographic);
      let s = geodesic.surfaceDistance;
      //返回两点之间的距离
      s = Math.sqrt(
        Math.pow(s, 2) +
          Math.pow(point2cartographic.height - point1cartographic.height, 2)
      );
      distance = distance + s;
    }
    return distance.toFixed(2);
  }
}
// 绘制point的class
class PolyLinePrimitive {
  constructor(positions) {
    this.options = {
      name: "直线",
      polyline: {
        show: true,
        positions: [],
        material: Cesium.Color.CHARTREUSE,
        width: 10,
        clampToGround: true,
      },
    };
    this.positions = positions;
    this.init();
  }
  init() {
    let self = this;
    let update = () => {
      return self.positions;
    };
    //实时更新polyline.positions
    this.options.polyline.positions = new Cesium.CallbackProperty(
      update,
      false
    );
    viewer.entities.add(this.options); //绘制
  }
}
export default Distance;

/**
 *
 * @param {{}} viewer
 * @param {Function} handler 回调函数
 * @param {} Cesium
 */
export default function meatureArea(viewer, handler, Cesium) {
  // 取消双击事件-追踪该位置
  viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(
    Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK
  );
  // 鼠标事件
  handler = new Cesium.ScreenSpaceEventHandler(
    viewer.scene._imageryLayerCollection
  );
  let positions = [];
  let tempPoints = [];
  let polygon = null;
  let cartesian = null;
  let floatingPoint; //浮动点

  handler.setInputAction(function (movement) {
    let ray = viewer.camera.getPickRay(movement.endPosition);
    cartesian = viewer.scene.globe.pick(ray, viewer.scene);

    if (positions.length >= 2) {
      if (!Cesium.defined(polygon)) {
        polygon = new PolygonPrimitive(positions);
      } else {
        positions.pop();
        positions.push(cartesian);
      }
    }
  }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

  handler.setInputAction(function (movement) {
    // tooltip.style.display = "none";
    // cartesian = viewer.scene.pickPosition(movement.position);
    let ray = viewer.camera.getPickRay(movement.position);
    cartesian = viewer.scene.globe.pick(ray, viewer.scene);
    // cartesian = viewer.scene.camera.pickEllipsoid(movement.position, viewer.scene.globe.ellipsoid);
    if (positions.length == 0) {
      positions.push(cartesian.clone());
    }
    //positions.pop();
    positions.push(cartesian);
    //在三维场景中添加点
    let cartographic = Cesium.Cartographic.fromCartesian(
      positions[positions.length - 1]
    );
    let longitudeString = Cesium.Math.toDegrees(cartographic.longitude);
    let latitudeString = Cesium.Math.toDegrees(cartographic.latitude);
    let heightString = cartographic.height;
    tempPoints.push({
      lon: longitudeString,
      lat: latitudeString,
      hei: heightString,
    });
    floatingPoint = viewer.entities.add({
      name: "多边形面积",
      position: positions[positions.length - 1],
      point: {
        pixelSize: 5,
        color: Cesium.Color.RED,
        outlineColor: Cesium.Color.WHITE,
        outlineWidth: 2,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
      },
    });
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

  handler.setInputAction(function (movement) {
    handler.destroy();
    positions.pop();

    let textArea = getArea(tempPoints) + "平方公里";
    viewer.entities.add({
      name: "多边形面积",
      position: positions[positions.length - 1],
      label: {
        text: textArea,
        font: "18px sans-serif",
        fillColor: Cesium.Color.GOLD,
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        outlineWidth: 2,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        pixelOffset: new Cesium.Cartesian2(20, -40),
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
      },
    });
  }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);

  let radiansPerDegree = Math.PI / 180.0; //角度转化为弧度(rad)
  let degreesPerRadian = 180.0 / Math.PI; //弧度转化为角度

  //计算多边形面积
  function getArea(points) {
    let res = 0;
    //拆分三角曲面

    for (let i = 0; i < points.length - 2; i++) {
      let j = (i + 1) % points.length;
      let k = (i + 2) % points.length;
      let totalAngle = Angle(points[i], points[j], points[k]);

      let dis_temp1 = Cesium.Cartesian3.distance(positions[i], positions[j]);
      let dis_temp2 = Cesium.Cartesian3.distance(positions[j], positions[k]);
      res += dis_temp1 * dis_temp2 * Math.abs(Math.sin(totalAngle));
    }

    return (res / 1000000.0).toFixed(4);
  }

  /*角度*/
  function Angle(p1, p2, p3) {
    let bearing21 = Bearing(p2, p1);
    let bearing23 = Bearing(p2, p3);
    let angle = bearing21 - bearing23;
    if (angle < 0) {
      angle += 360;
    }
    return angle;
  }
  /*方向*/
  function Bearing(from, to) {
    let lat1 = from.lat * radiansPerDegree;
    let lon1 = from.lon * radiansPerDegree;
    let lat2 = to.lat * radiansPerDegree;
    let lon2 = to.lon * radiansPerDegree;
    let angle = -Math.atan2(
      Math.sin(lon1 - lon2) * Math.cos(lat2),
      Math.cos(lat1) * Math.sin(lat2) -
        Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon1 - lon2)
    );
    if (angle < 0) {
      angle += Math.PI * 2.0;
    }
    angle = angle * degreesPerRadian; //角度
    return angle;
  }

  let PolygonPrimitive = (function () {
    function _(positions) {
      this.options = {
        name: "多边形",
        polygon: {
          hierarchy: [],
          // perPositionHeight : true,
          material: Cesium.Color.GREEN.withAlpha(0.5),
          // heightReference:20000
        },
      };

      this.hierarchy = { positions };
      this._init();
    }

    _.prototype._init = function () {
      let _self = this;
      let _update = function () {
        return _self.hierarchy;
      };
      //实时更新polygon.hierarchy
      this.options.polygon.hierarchy = new Cesium.CallbackProperty(
        _update,
        false
      );
      viewer.entities.add(this.options);
    };

    return _;
  })();
}

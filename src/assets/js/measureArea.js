// 绘制面(面积测量)
class measureArea {
  constructor(arg) {
    this.objId = Number(
      new Date().getTime() + "" + Number(Math.random() * 1000).toFixed(0)
    );
    this.viewer = arg.viewer;
    this.Cesium = arg.Cesium;
    this.callback = arg.callback;
    this._polygon = null; //活动面
    this._polygonLast = null; //最后一个面
    this._positions = []; //活动点
    this._entities_point = []; //脏数据
    this._entities_polygon = []; //脏数据
    this._polygonData = null; //用户构造面
  }

  //返回最后活动面
  get polygon() {
    return this._polygonLast;
  }

  //返回面数据用于加载面
  getData() {
    return this._polygonData;
  }

  //加载面
  loadPolygon(data) {
    var self = this;
    return this.viewer.entities.add({
      polygon: {
        hierarchy: new self.Cesium.PolygonHierarchy(data),
        clampToGround: true,
        show: true,
        fill: true,
        material: self.Cesium.Color.RED.withAlpha(0.5),
        width: 3,
        outlineColor: self.Cesium.Color.BLACK,
        outlineWidth: 1,
        outline: false,
      },
    });
  }

  //开始绘制
  startCreate() {
    var self = this;
    this.handler = new this.Cesium.ScreenSpaceEventHandler(
      this.viewer.scene.canvas
    );
    // this.handler.removeInputAction(
    //   this.Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK
    // );
    this.handler.setInputAction(function (evt) {
      //单机开始绘制
      var cartesian = self.getCatesian3FromPX(evt.position);
      if (self._positions.length == 0) {
        self._positions.push(cartesian.clone());
      }
      self.createPoint(cartesian);
      self._positions.push(cartesian);
    }, self.Cesium.ScreenSpaceEventType.LEFT_CLICK);
    this.handler.setInputAction(function (evt) {
      //移动时绘制面
      if (self._positions.length < 1) return;
      var cartesian = self.getCatesian3FromPX(evt.endPosition);
      if (self._positions.length == 3) {
        if (!self.Cesium.defined(self._polygon)) {
          self._polygon = self.createPolygon();
        }
      }
      self._positions.pop();
      self._positions.push(cartesian);
    }, self.Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    this.handler.setInputAction(function (evt) {
      if (!self._polygon) return;
      var cartesian = self.getCatesian3FromPX(evt.position);
      self._positions.pop();
      self._positions.push(cartesian);
      self.createPoint(cartesian);
      self._polygonData = self._positions.concat();
      self.viewer.entities.remove(self._positions); //移除
      self._positions = null;
      self._positions = [];
      var Polygon = self.loadPolygon(self._polygonData);
      self._entities_polygon.push(Polygon);
      self._polygonLast = Polygon;
      var textArea = self.getArea(self._polygonData) + "平方公里";
      self.createPointLabel(
        self._polygonData[self._polygonData.length - 1],
        textArea
      );
      self.callback();
      self.destroy();
    }, self.Cesium.ScreenSpaceEventType.RIGHT_CLICK);
  }

  //创建面
  createPolygon() {
    var self = this;
    var polygon = this.viewer.entities.add({
      polygon: {
        hierarchy: new self.Cesium.CallbackProperty(function () {
          return new self.Cesium.PolygonHierarchy(self._positions);
        }, false),
        clampToGround: true,
        show: true,
        fill: true,
        material: self.Cesium.Color.RED.withAlpha(0.5),
        width: 3,
        outlineColor: self.Cesium.Color.BLACK,
        outlineWidth: 1,
        outline: false,
      },
    });
    self._entities_polygon.push(polygon);
    return polygon;
  }

  //创建点
  createPoint(cartesian) {
    var self = this;
    var point = this.viewer.entities.add({
      position: cartesian,
      point: {
        pixelSize: 10,
        color: self.Cesium.Color.YELLOW,
      },
    });
    point.objId = this.objId;
    self._entities_point.push(point);
    return point;
  }

  //创建点
  createPointLabel(cartesian, textArea) {
    var self = this;
    var point = this.viewer.entities.add({
      position: cartesian,
      label: {
        text: textArea,
        font: "18px sans-serif",
        fillColor: self.Cesium.Color.GOLD,
        style: self.Cesium.LabelStyle.FILL_AND_OUTLINE,
        outlineWidth: 2,
        verticalOrigin: self.Cesium.VerticalOrigin.BOTTOM,
        pixelOffset: new self.Cesium.Cartesian2(20, -40),
        heightReference: self.Cesium.HeightReference.CLAMP_TO_GROUND,
      },
    });
    point.objId = this.objId;
    self._entities_point.push(point);
    return point;
  }

  //销毁事件
  destroy() {
    if (this.handler) {
      this.handler.destroy();
      this.handler = null;
    }
  }

  //清空实体对象
  clear() {
    for (var i = 0; i < this._entities_point.length; i++) {
      this.viewer.entities.remove(this._entities_point[i]);
    }
    for (var i = 0; i < this._entities_polygon.length; i++) {
      this.viewer.entities.remove(this._entities_polygon[i]);
    }
    this._polygon = null; //活动面
    this._polygonLast = null; //最后一个面
    this._positions = []; //活动点
    this._entities_point = []; //脏数据
    this._entities_polygon = []; //脏数据
    this._polygonData = null; //用户构造面
  }

  getCatesian3FromPX(px) {
    var cartesian;
    var ray = this.viewer.camera.getPickRay(px);
    if (!ray) return null;
    cartesian = this.viewer.scene.globe.pick(ray, this.viewer.scene);
    return cartesian;
  }

  //计算多边形面积
  getArea(points) {
    var res = 0;
    //拆分三角曲面
    for (var i = 0; i < points.length - 2; i++) {
      var j = (i + 1) % points.length;
      var k = (i + 2) % points.length;
      var totalAngle = this.Angle(points[i], points[j], points[k]);

      var dis_temp1 = this.distance(points[i], points[j]);
      var dis_temp2 = this.distance(points[j], points[k]);
      res += dis_temp1 * dis_temp2 * Math.abs(Math.sin(totalAngle));
    }

    return (res / 1000000.0).toFixed(4);
  }

  /*角度*/
  Angle(p1, p2, p3) {
    var bearing21 = this.Bearing(p2, p1);
    var bearing23 = this.Bearing(p2, p3);
    var angle = bearing21 - bearing23;
    if (angle < 0) {
      angle += 360;
    }
    return angle;
  }

  /*方向*/
  Bearing(from, to) {
    var radiansPerDegree = Math.PI / 180.0; //角度转化为弧度(rad)
    var degreesPerRadian = 180.0 / Math.PI; //弧度转化为角度
    var cartographic_from = this.Cesium.Cartographic.fromCartesian(from);
    var cartographic_to = this.Cesium.Cartographic.fromCartesian(to);
    var lon_from = this.Cesium.Math.toDegrees(cartographic_from.longitude);
    var lat_from = this.Cesium.Math.toDegrees(cartographic_from.latitude);

    var lon_to = this.Cesium.Math.toDegrees(cartographic_to.longitude);
    var lat_to = this.Cesium.Math.toDegrees(cartographic_to.latitude);

    var lat1 = lat_from * radiansPerDegree;
    var lon1 = lon_from * radiansPerDegree;
    var lat2 = lat_to * radiansPerDegree;
    var lon2 = lon_to * radiansPerDegree;
    var angle = -Math.atan2(
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

  distance(point1, point2) {
    var point1cartographic = this.Cesium.Cartographic.fromCartesian(point1);
    var point2cartographic = this.Cesium.Cartographic.fromCartesian(point2);
    /**根据经纬度计算出距离**/
    var geodesic = new this.Cesium.EllipsoidGeodesic();
    geodesic.setEndPoints(point1cartographic, point2cartographic);
    var s = geodesic.surfaceDistance;
    //返回两点之间的距离
    s = Math.sqrt(
      Math.pow(s, 2) +
        Math.pow(point2cartographic.height - point1cartographic.height, 2)
    );
    return s;
  }
}

export default measureArea;

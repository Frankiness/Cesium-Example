// DrawPolyline
/*
绘制线
 */
class DrawPolyline {
  constructor(arg) {
    this.viewer = arg.viewer;
    this.Cesium = arg.Cesium;
    this.callback = arg.callback;
    this.distance = 0; //距离
    this.pointArray = []; //点位数组
    this.poly = null;
    this._polyline = null; //活动线
    this._polylineLast = null; //最后一条线
    this._positions = []; //活动点
    this._entities_point = []; //脏数据
    this._entities_line = []; //脏数据
    this._entities_line = [];
    this._polylineData = null; //用于构造线数据
  }

  //返回最后活动线
  get line() {
    return this._polylineLast;
  }

  //返回线数据用于加载线
  getData() {
    return this._polylineData;
  }

  //加载线
  loadPolyline(data) {
    var self = this;
    var polyline = this.viewer.entities.add({
      polyline: {
        positions: data,
        show: true,
        material: self.Cesium.Color.RED,
        width: 3,
        clampToGround: true,
      },
    });
    return polyline;
  }

  //开始创建
  startCreate() {
    var self = this;
    this.handler = new this.Cesium.ScreenSpaceEventHandler(
      this.viewer.scene.canvas
    );
    this.handler.setInputAction(function (evt) {
      //单机开始绘制
      //屏幕坐标转地形上坐标
      var cartesian = self.getCatesian3FromPX(evt.position);
      if (self._positions.length == 0) {
        self._positions.push(cartesian.clone());
      }
      self._positions.push(cartesian);
      self.createPoint(cartesian); // 绘制点

      self.pointArray.push(cartesian);
      if (self.pointArray.length >= 2) {
        self.distance = self.getSpaceDistance(self.pointArray);
      }
      // 绘制标签
      self.createLabel(self._positions);
    }, self.Cesium.ScreenSpaceEventType.LEFT_CLICK);

    this.handler.setInputAction(function (evt) {
      //移动时绘制线
      if (self._positions.length < 1) return;
      var cartesian = self.getCatesian3FromPX(evt.endPosition);
      if (!self.Cesium.defined(self._polyline)) {
        self._polyline = self.createPolyline();
      }
      if (self._polyline) {
        self._positions.pop();
        self._positions.push(cartesian);
      }
    }, self.Cesium.ScreenSpaceEventType.MOUSE_MOVE);

    this.handler.setInputAction(function (evt) {
      if (!self._polyline) return;
      var cartesian = self.getCatesian3FromPX(evt.position);
      self._positions.pop();
      self._positions.push(cartesian);
      self.createPoint(cartesian); // 绘制点

      self.pointArray.push(cartesian);
      if (self.pointArray.length >= 2) {
        self.distance = self.getSpaceDistance(self.pointArray);
      }
      // 绘制标签
      self.createLabel(self._positions);

      self._polylineData = self._positions.concat();
      self.viewer.entities.remove(self._polyline); //移除
      self._polyline = null;
      self._positions = [];
      var line = self.loadPolyline(self._polylineData); //加载线
      self._entities_line.push(line);
      self._polylineLast = line;

      if (typeof self.callback == "function") {
        self.callback();
      }
      self.destroy();
    }, self.Cesium.ScreenSpaceEventType.RIGHT_CLICK);
  }

  // 添加标签
  createLabel(positions) {
    let self = this;
    //在三维场景中添加Label
    let textDisance = self.distance + "米";
    let label = self.viewer.entities.add({
      name: "空间直线距离",
      position: positions[positions.length - 1],
      point: {
        pixelSize: 5,
        color: self.Cesium.Color.RED,
        outlineColor: self.Cesium.Color.WHITE,
        outlineWidth: 2,
      },
      label: {
        text: textDisance,
        font: "18px sans-serif",
        fillColor: self.Cesium.Color.GOLD,
        style: self.Cesium.LabelStyle.FILL_AND_OUTLINE,
        outlineWidth: 2,
        verticalOrigin: self.Cesium.VerticalOrigin.BOTTOM,
        pixelOffset: new self.Cesium.Cartesian2(20, -20),
      },
    });
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
    self._entities_point.push(point);
    return point;
  }

  //创建线
  createPolyline() {
    var self = this;
    var polyline = this.viewer.entities.add({
      polyline: {
        //使用cesium的peoperty
        positions: new self.Cesium.CallbackProperty(function () {
          return self._positions;
        }, false),
        show: true,
        material: self.Cesium.Color.RED,
        width: 3,
        clampToGround: true,
      },
    });
    self._entities_line.push(polyline);
    return polyline;
  }

  //销毁
  destroy() {
    if (this.handler) {
      this.handler.destroy();
      this.handler = null;
    }
  }

  //清空实体对象
  clear() {
    for (let i = 0; i < this._entities_point.length; i++) {
      console.log(this._entities_point[i]);
      this.viewer.entities.remove(this._entities_point[i]);
    }
    for (let i = 0; i < this._entities_line.length; i++) {
      this.viewer.entities.remove(this._entities_line[i]);
    }
    this._polyline = null;
    this._positions = [];
    this._entities_point = []; //脏数据
    this._entities_line = []; //脏数据
    this._polylineData = null; //用于构造线数据
    this._polylineLast = null;
  }

  getCatesian3FromPX(px) {
    var cartesian;
    var ray = this.viewer.camera.getPickRay(px);
    if (!ray) return null;
    cartesian = this.viewer.scene.globe.pick(ray, this.viewer.scene);
    return cartesian;
  }
  //空间两点距离计算函数
  getSpaceDistance(positions) {
    let self = this;
    let distance = 0; //总距离
    // 与后一个点之间计算距离然后叠加
    for (let i = 0; i < positions.length - 1; i++) {
      let point1cartographic = self.Cesium.Cartographic.fromCartesian(
        positions[i]
      ); //笛卡尔坐标转经纬度
      let point2cartographic = self.Cesium.Cartographic.fromCartesian(
        positions[i + 1]
      );
      /**根据经纬度计算出球面距离**/
      let geodesic = new self.Cesium.EllipsoidGeodesic();
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

export default DrawPolyline;

class DrawPolyline {
  constructor(arg) {
    this.viewer = arg.viewer;
    this.Cesium = arg.Cesium;
    this.callback = arg.callback;
    this.distance = 0; //距离
    this.pointArray = []; //点位数组
    this._polyline = null; //活动线
    this._polylineLast = null; //最后一条线
    this._positions = []; //存储需要绘制的点
    this._entities_point = []; //脏数据
    this._entities_line = []; //脏数据
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
    let self = this;
    let polyline = this.viewer.entities.add({
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
    const self = this;
    this.handler = new this.Cesium.ScreenSpaceEventHandler(
      this.viewer.scene.canvas
    );
    // 左键绘制点
    this.handler.setInputAction(function (evt) {
      //屏幕坐标转地形上坐标
      let cartesian = self.getCatesian3FromPX(evt.position);
      if (self._positions.length == 0) {
        self._positions.push(cartesian.clone());
      }
      self._positions.push(cartesian);
      self.createPoint(cartesian); // 绘制点
    }, self.Cesium.ScreenSpaceEventType.LEFT_CLICK);
    // 鼠标移动事件
    this.handler.setInputAction(function (evt) {
      //移动时绘制线
      if (self._positions.length < 1) return; //还没确定一个点
      let cartesian = self.getCatesian3FromPX(evt.endPosition);
      //若这条线不存在
      if (!self.Cesium.defined(self._polyline)) {
        self._polyline = self.createPolyline();
      }
      // 不断的删除最后一个点，保持只有两个点连成一条直线
      if (self._polyline) {
        self._positions.pop();
        self._positions.push(cartesian);
      }
    }, self.Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    // 右键停止绘制
    this.handler.setInputAction(function (evt) {
      if (!self._polyline) return;
      let cartesian = self.getCatesian3FromPX(evt.position);
      self._positions.pop();
      self._positions.push(cartesian);
      self.createPoint(cartesian); // 绘制点
      self._polylineData = self._positions.concat();
      self.viewer.entities.remove(self._polyline); //移除
      self._polyline = null;
      self._positions = [];
      let line = self.loadPolyline(self._polylineData); //加载线
      self._entities_line.push(line);
      self._polylineLast = line;
      console.log(self);
      if (typeof self.callback == "function") {
        self.callback();
      }
      self.destroy();
    }, self.Cesium.ScreenSpaceEventType.RIGHT_CLICK);
  }

  //创建点
  createPoint(cartesian) {
    let self = this;
    let point = this.viewer.entities.add({
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
    let self = this;
    let polyline = this.viewer.entities.add({
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
  // 屏幕坐标转笛卡尔坐标
  getCatesian3FromPX(px) {
    let cartesian;
    let ray = this.viewer.camera.getPickRay(px);
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

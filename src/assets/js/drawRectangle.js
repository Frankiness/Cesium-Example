// DrawCurve
/*
绘制矩形
 */
class DrawRectangle {
  constructor(arg) {
    this.viewer = arg.viewer;
    this.Cesium = arg.Cesium;
    this.callback = arg.callback;
    this.floatingPoint = null; //标识点
    this._rectangle = null; //活动矩形
    this._rectangleLast = null; //最后一个矩形
    this._positions = []; //活动点
    this._entities_point = []; //脏数据
    this._entities_rectangle = []; //脏数据
    this._rectangleData = null; //用于构造矩形数据
  }

  //返回最后图形
  get line() {
    return this._rectangleLast;
  }

  //返回矩形数据
  getData() {
    return this._rectangleData;
  }

  //加载
  loadRectangle(data) {
    var self = this;
    var shape = this.viewer.entities.add({
      name: "rectangle",
      rectangle: {
        coordinates: self.Cesium.Rectangle.fromCartesianArray(data),
        material: self.Cesium.Color.RED.withAlpha(0.5),
      },
    });
    self._entities_rectangle.push(shape);
    return shape;
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
        self.floatingPoint = self.createPoint(cartesian);
        self.createPoint(cartesian); // 绘制点
      }
      self._positions.push(cartesian);
    }, self.Cesium.ScreenSpaceEventType.LEFT_CLICK);
    this.handler.setInputAction(function (evt) {
      //移动时绘制线
      if (self._positions.length < 3) return;
      var cartesian = self.getCatesian3FromPX(evt.endPosition);
      if (!self.Cesium.defined(self._rectangle)) {
        self._rectangle = self.createRectangle();
      }
      self.floatingPoint.position.setValue(cartesian);
      if (self._rectangle) {
        self._positions.pop();
        self._positions.push(cartesian);
      }
    }, self.Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    this.handler.setInputAction(function (evt) {
      if (!self._rectangle) return;
      var cartesian = self.getCatesian3FromPX(evt.position);
      self._positions.pop();
      self._positions.push(cartesian);
      self.createPoint(cartesian); // 绘制点
      self._rectangleData = self._positions.concat();
      self.viewer.entities.remove(self._rectangle); //移除
      self._rectangle = null;
      self._positions = [];
      self.floatingPoint.position.setValue(cartesian);
      var rectangle = self.loadRectangle(self._rectangleData); //加载
      self._entities_rectangle.push(rectangle);
      self._rectangleLast = rectangle;
      if (typeof self.callback == "function") {
        self.callback();
      }
      self.destroy();
    }, self.Cesium.ScreenSpaceEventType.RIGHT_CLICK);
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

  //创建矩形
  createRectangle() {
    var self = this;
    var shape = this.viewer.entities.add({
      name: "rectangle",
      rectangle: {
        coordinates: new self.Cesium.CallbackProperty(function () {
          var obj = self.Cesium.Rectangle.fromCartesianArray(self._positions);
          return obj;
        }, false),
        material: self.Cesium.Color.RED.withAlpha(0.5),
      },
    });
    self._entities_rectangle.push(shape);
    return shape;
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
    for (var i = 0; i < this._entities_point.length; i++) {
      this.viewer.entities.remove(this._entities_point[i]);
    }
    for (var i = 0; i < this._entities_rectangle.length; i++) {
      this.viewer.entities.remove(this._entities_rectangle[i]);
    }
    this.floatingPoint = null; //标识点
    this._rectangle = null; //活动矩形
    this._rectangleLast = null; //最后一个矩形
    this._positions = []; //活动点
    this._entities_point = []; //脏数据
    this._entities_rectangle = []; //脏数据
    this._rectangleData = null; //用于构造矩形数据
  }

  getCatesian3FromPX(px) {
    var cartesian;
    var ray = this.viewer.camera.getPickRay(px);
    if (!ray) return null;
    cartesian = this.viewer.scene.globe.pick(ray, this.viewer.scene);
    return cartesian;
  }
}

export default DrawRectangle;

// DrawCurve
/*
绘制曲线
 */
class DrawCurve {
  constructor(arg) {
    this.viewer = arg.viewer;
    this.Cesium = arg.Cesium;
    this.callback = arg.callback;
    this.floatingPoint = null; //标识点
    this._curveline = null; //活动曲线
    this._curvelineLast = null; //最后一条曲线
    this._positions = []; //活动点
    this._entities_point = []; //脏数据
    this._entities_line = []; //脏数据
    this._curvelineData = null; //用于构造曲线数据
  }

  //返回最后活动曲线
  get curveline() {
    return this._curvelineLast;
  }

  //返回线数据用于加载线
  getData() {
    return this._curvelineData;
  }

  //加载曲线
  loadCurveline(data) {
    var self = this;
    var points = self.fineBezier(data);
    var polyline = this.viewer.entities.add({
      polyline: {
        positions: points,
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
        self.floatingPoint = self.createPoint(cartesian);
        self.createPoint(cartesian); // 绘制点
      }
      self._positions.push(cartesian);
    }, self.Cesium.ScreenSpaceEventType.LEFT_CLICK);
    this.handler.setInputAction(function (evt) {
      //移动时绘制线
      if (self._positions.length < 4) return;
      var cartesian = self.getCatesian3FromPX(evt.endPosition);
      if (!self.Cesium.defined(self._curveline)) {
        self._curveline = self.createCurveline();
      }
      self.floatingPoint.position.setValue(cartesian);
      if (self._curveline) {
        self._positions.pop();
        self._positions.push(cartesian);
      }
    }, self.Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    this.handler.setInputAction(function (evt) {
      if (!self._curveline) return;
      var cartesian = self.getCatesian3FromPX(evt.position);
      self._positions.pop();
      self._positions.push(cartesian);
      self.createPoint(cartesian); // 绘制点
      self._curvelineData = self._positions.concat();
      self.viewer.entities.remove(self._curveline); //移除
      self._curveline = null;
      self._positions = [];
      self.floatingPoint.position.setValue(cartesian);
      var line = self.loadCurveline(self._curvelineData); //加载曲线
      self._entities_line.push(line);
      self._curvelineLast = line;
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

  //创建曲线
  createCurveline() {
    var self = this;
    var polyline = this.viewer.entities.add({
      polyline: {
        //使用cesium的peoperty
        positions: new self.Cesium.CallbackProperty(function () {
          return self.fineBezier(self._positions);
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
    for (var i = 0; i < this._entities_point.length; i++) {
      this.viewer.entities.remove(this._entities_point[i]);
    }
    for (var i = 0; i < this._entities_line.length; i++) {
      this.viewer.entities.remove(this._entities_line[i]);
    }
    this.floatingPoint = null; //标识点
    this._curveline = null; //活动曲线
    this._curvelineLast = null; //最后一条曲线
    this._positions = []; //活动点
    this._entities_point = []; //脏数据
    this._entities_line = []; //脏数据
    this._curvelineData = null; //用于构造曲线数据
  }

  getCatesian3FromPX(px) {
    var cartesian;
    var ray = this.viewer.camera.getPickRay(px);
    if (!ray) return null;
    cartesian = this.viewer.scene.globe.pick(ray, this.viewer.scene);
    return cartesian;
  }

  cartesianToLatlng(cartesian) {
    var latlng =
      this.viewer.scene.globe.ellipsoid.cartesianToCartographic(cartesian);
    var lat = this.Cesium.Math.toDegrees(latlng.latitude);
    var lng = this.Cesium.Math.toDegrees(latlng.longitude);
    return [lng, lat];
  }

  //贝塞尔曲线实现

  fineBezier(points) {
    var self = this;
    var pointNUM = 40; //个点
    var poins2D = [];
    var d = [];
    for (var i = 0; i < points.length; i++) {
      var res = self.cartesianToLatlng(points[i]);
      var point = new Object();
      point.x = res[0];
      point.y = res[1];
      poins2D.push(point);
    }
    var cbs = self.ComputeBezier(poins2D, pointNUM);
    for (var j = 0; j < cbs.length; j++) {
      d.push(cbs[j].x);
      d.push(cbs[j].y);
    }
    return self.Cesium.Cartesian3.fromDegreesArray(d);
  }

  /*
 cp在此是四個元素的陣列:
 cp[0]為起始點，或上圖中的P0
 cp[1]為第一個控制點，或上圖中的P1
 cp[2]為第二個控制點，或上圖中的P2
 cp[3]為結束點，或上圖中的P3
 t為參數值，0 <= t <= 1
*/
  PointOnCubicBezier(cp, t) {
    var ax, bx, cx;
    var ay, by, cy;
    var tSquared, tCubed;
    var result = new Object();
    var length = cp.length;
    var inteval = Math.floor(length / 4); // 向下取整
    /*計算多項式係數*/
    cx = 3.0 * (cp[inteval].x - cp[0].x);
    bx = 3.0 * (cp[2 * inteval].x - cp[inteval].x) - cx;
    ax = cp[length - 1].x - cp[0].x - cx - bx;
    cy = 3.0 * (cp[inteval].y - cp[0].y);
    by = 3.0 * (cp[2 * inteval].y - cp[inteval].y) - cy;
    ay = cp[length - 1].y - cp[0].y - cy - by;
    /*計算位於參數值t的曲線點*/
    tSquared = t * t;
    tCubed = tSquared * t;
    result.x = ax * tCubed + bx * tSquared + cx * t + cp[0].x;
    result.y = ay * tCubed + by * tSquared + cy * t + cp[0].y;
    return result;
  }

  /*
 ComputeBezier以控制點cp所產生的曲線點，填入Point2D結構的陣列。
 呼叫者必須分配足夠的記憶體以供輸出結果，其為<sizeof(Point2D) numberOfPoints>
*/
  ComputeBezier(cp, numberOfPoints) {
    var self = this;
    var dt;
    var i;
    var curve = [];
    dt = 1.0 / (numberOfPoints - 1);
    for (i = 0; i < numberOfPoints; i++) {
      curve[i] = self.PointOnCubicBezier(cp, i * dt);
    }
    return curve;
  }
}

export default DrawCurve;

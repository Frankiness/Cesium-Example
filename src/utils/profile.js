import * as echarts from "echarts";

let points = [];
let totalDistance = 0; // 总距离
let xAxisData = [];

/**
 * 标点采样
 * @param {viewer} viewer
 * @param {Cesium} Cesium
 * @param {String} type 类型：terrain-地形  tiles-瓦片
 */
function Profile(viewer, Cesium, type) {
  // 取消双击事件-追踪该位置
  viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(
    Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK
  );
  // 定义侦听器
  let handler = new Cesium.ScreenSpaceEventHandler(
    viewer.scene._imageryLayerCollection
  );
  let positions = [];
  let poly = null;
  let distance = 0;
  let cartesian = null;
  let floatingPoint;
  // 获取鼠标最后的位置
  handler.setInputAction(function (movement) {
    // 判断拾取对象类型
    if (type === "terrain") {
      let ray = viewer.camera.getPickRay(movement.endPosition);
      cartesian = viewer.scene.globe.pick(ray, viewer.scene);
    } else {
      let pick = viewer.scene.pickPosition(movement.endPosition);
      let pickModel = viewer.scene.pick(movement.endPosition);
      if (pickModel && pick && !pickModel.id) {
        let height = Cesium.Cartographic.fromCartesian(pick).height;
        let lat = Cesium.Math.toDegrees(
          Cesium.Cartographic.fromCartesian(pick).latitude
        );
        let lng = Cesium.Math.toDegrees(
          Cesium.Cartographic.fromCartesian(pick).longitude
        );
        cartesian = Cesium.Cartesian3.fromDegrees(lng, lat, height);
      }
    }

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
    if (type === "terrain") {
      let ray = viewer.camera.getPickRay(movement.position);
      cartesian = viewer.scene.globe.pick(ray, viewer.scene);
    } else {
      let pick = viewer.scene.pickPosition(movement.position);
      let pickModel = viewer.scene.pick(movement.position);
      if (pickModel && pick && !pickModel.id) {
        let height = Cesium.Cartographic.fromCartesian(pick).height;
        let lat = Cesium.Math.toDegrees(
          Cesium.Cartographic.fromCartesian(pick).latitude
        );
        let lng = Cesium.Math.toDegrees(
          Cesium.Cartographic.fromCartesian(pick).longitude
        );
        cartesian = Cesium.Cartesian3.fromDegrees(lng, lat, height);
      }
    }

    if (positions.length == 0) {
      positions.push(cartesian.clone());
    }

    // 如果已经绘制了两个点就停止
    if (positions.length < 2) {
      positions.push(cartesian);
      setPoint();
    } else {
      setPoint();
      profileAnalyse(positions[0], positions[1], type);
      dispose();
    }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

  handler.setInputAction(function () {
    handler.destroy(); //关闭事件句柄
    positions.pop(); //最后一个点无效
  }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);

  function dispose() {
    handler.destroy(); //关闭事件句柄
    positions = [];
    points = [];
    xAxisData = [];
  }
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
  // 设置点与标签
  function setPoint() {
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
  }
}
// 绘制point的class
class PolyLinePrimitive {
  constructor(positions) {
    viewer.entities.removeAll(); // 清除先前的实体
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

function sampledTerrain(positions) {
  const cartographicArr = positions.map((i) => {
    return Cesium.Cartographic.fromCartesian(i);
  });
  const promise = Cesium.sampleTerrainMostDetailed(
    Cesium.createWorldTerrain(),
    cartographicArr
  );
  Promise.resolve(promise).then(function (clampedCartesians) {
    console.log(clampedCartesians);
    initChart(clampedCartesians);
  });
}

/**
 * 采样3dtiles
 * @param {Array<Cartesian3>} cartesianArr
 */
function sampleTile(cartesianArr) {
  const promise = viewer.scene.clampToHeightMostDetailed(cartesianArr);
  promise.then(function (clampedCartesians) {
    let height = [];
    for (let i = 0; i < clampedCartesians.length; ++i) {
      height.push(Cesium.Cartographic.fromCartesian(clampedCartesians[i]));
    }
    initChart(height);
  });
}

/**
 * 插值采样
 * @param {Cartrsian3} start
 * @param {Cartrsian3} end
 */
function profileAnalyse(start, end, type) {
  // 插值100个点，点越多模拟越精确，但是效率会低
  let count = 1000;
  points.push(start);
  xAxisData.push(totalDistance);

  for (let i = 1; i < count; i++) {
    let cart = Cesium.Cartesian3.lerp(
      start,
      end,
      i / count,
      new Cesium.Cartesian3()
    );
    if (i > 1) {
      const distance = Cesium.Cartesian3.distance(points[i - 1], cart); // 计算两点距离
      totalDistance = Number(totalDistance) + Number(distance.toFixed(2));
      xAxisData.push(totalDistance); // 计算到当前点的总距离
    }
    points.push(cart);
  }
  points.push(end);
  let cartesianArr = points.map((i) => {
    return Cesium.Cartographic.fromCartesian(i);
  });
  // initChart(cartesianArr);
  type === "terrain" ? sampledTerrain(points) : sampleTile(points);
}

let option = {
  backgroundColor: "#394056",
  title: {
    text: "剖面分析",
    textStyle: {
      fontWeight: "normal",
      fontSize: 16,
      color: "#F1F1F3",
    },
    left: "6%",
  },
  tooltip: {
    trigger: "axis",
    axisPointer: {
      lineStyle: {
        color: "#57617B",
      },
    },
  },
  grid: {
    left: "3%",
    right: "4%",
    bottom: "3%",
    containLabel: true,
  },
  xAxis: [
    {
      type: "category",
      boundaryGap: false,
      data: [],
      axisLine: {
        lineStyle: {
          color: "#57617B",
        },
      },
      axisLabel: {
        interval: 100,
        hideOverlap: true,
      },
    },
  ],
  yAxis: [
    {
      type: "value",
      name: "高度(米)",
      axisTick: {
        show: false,
      },
      axisLine: {
        lineStyle: {
          color: "#57617B",
        },
      },
      axisLabel: {
        margin: 10,
        textStyle: {
          fontSize: 14,
        },
      },
      splitLine: {
        lineStyle: {
          color: "#57617B",
        },
      },
      min: "dataMin",
    },
  ],
  series: [
    {
      type: "line",
      smooth: true,
      symbol: "circle",
      symbolSize: 5,
      showSymbol: false,
      lineStyle: {
        normal: {
          width: 1,
        },
      },
      areaStyle: {
        normal: {
          color: new echarts.graphic.LinearGradient(
            0,
            0,
            0,
            1,
            [
              {
                offset: 0,
                color: "rgba(219, 50, 51, 0.6)",
              },
              {
                offset: 0.8,
                color: "rgba(219, 50, 51, 0.2)",
              },
            ],
            false
          ),
          shadowColor: "rgba(0, 0, 0, 0.2)",
          shadowBlur: 10,
        },
      },
      itemStyle: {
        normal: {
          color: "rgb(219,50,51)",
          borderColor: "rgba(219,50,51,0.2)",
          borderWidth: 12,
        },
      },
      data: [],
      max: "dataMax",
      scale: true,
    },
  ],
};
let myChart = undefined;
/**
 * 初始化图表
 * @param {Cartographic} points 弧度制数组
 */
function initChart(points) {
  let yData = points.map((i) => {
    return i.height;
  });

  // 判断是否是第一次创建图表
  if (!myChart) {
    let chartDom = document.getElementById("chart");
    myChart = echarts.init(chartDom);
  }
  option.series[0].data = yData;
  option.xAxis[0].data = xAxisData;
  myChart.setOption(option);
}

export default Profile;

import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import * as Cesium from "cesium";
import "cesium/Source/Widgets/widgets.css";
import { router } from "./router";

import Antd from "ant-design-vue";
import "ant-design-vue/dist/antd.css";

const app = createApp(App);
Cesium.Ion.defaultAccessToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJhMTY5YmIwNS1iMjkxLTQyMTQtOWM1ZC1iMmQzZGRiNDQwNmEiLCJpZCI6Njg4MzksImlhdCI6MTY4MjA0NDUyMX0.QM4j-mLKMAPhsh_VRuGex2sImpfwp48h_wjOBIE6jx8";
app.config.globalProperties.$Cesium = Cesium;

app.use(router).use(Antd).mount("#app");

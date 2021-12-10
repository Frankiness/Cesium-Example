import {
  createRouter,
  createWebHashHistory
} from "vue-router";
const routes = [{
    path: "/",
    name: "home",
    component: () => import("../components/Cesium.vue"),
  },
  {
    path: "/page1",
    name: "cesium",
    component: () => import("../components/Cesium.vue"),
  },
  {
    path: "/page2",
    name: "rotatePrimitive",
    component: () => import("../components/rotatePrimitive.vue"),
  },
];
const router = createRouter({
  history: createWebHashHistory(),
  routes,
});
export default router;
import { createRouter, createWebHistory } from "vue-router";

const routes = [
  {
    path: "/",
    redirect: "/profile",
  },
  {
    path: "/profile",
    name: "采样高度",
    component: () => import("../views/Profile.vue"),
  },
  {
    path: "/customShader",
    name: "雪覆盖shader",
    component: () => import("../views/customShader.vue"),
  },
  {
    path: "/water",
    name: "水面映射",
    component: () => import("../views/waterReflect/index.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export { routes, router };

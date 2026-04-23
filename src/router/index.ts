import { createWebHashHistory, createRouter } from "vue-router";

const routes = [
  {
    path: "/",
    component: () => import("../views/Index.vue"),
    children: [
      {
        path: "",
        name: "DashBoard",
        component: () => import("../views/dashBoard/DashBoard.vue"),
      },
    ],
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;

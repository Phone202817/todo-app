import { type RouteRecordRaw } from "vue-router";

import Login from "../pages/Login.vue";
import Register from "../pages/Register.vue";
import UserManage from "../pages/UserManage.vue";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    redirect: "/login",
  },
  {
    path: "/login",
    component: Login,
  },
  {
    path: "/register",
    component: Register,
  },
  {
  path: '/usermanage',
  component: () => import("../layouts/MainLayout.vue"),
  meta: { requiresAuth: true },
  children: [
    {
      path: '',
      component: UserManage
    }
  ]
},
];

export default routes;

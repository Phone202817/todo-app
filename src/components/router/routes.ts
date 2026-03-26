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
  meta: { requiresAuth: true, requiresAdmin: true },
  children: [
    {
      path: '',
      component: UserManage
    }
  ]
},
{
  path: '/overview',
  component: () => import("../layouts/MainLayout.vue"),
  meta: { requiresAuth: true },
  children: [
    {
      path: '',
      component: () => import("../pages/Overview.vue")
    }
  ]
},
];

export default routes;

import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { getToken } from '@/utils/auth'
import SubPageLayout from '@/components/SubPageLayout.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/home/index.vue'),
    meta: { navKey: 'home', title: '政策大脑 - 全国政策数据AI辅助申报平台' },
  },
  {
    path: '/news',
    component: SubPageLayout,
    meta: { navKey: 'news' },
    children: [
      {
        path: '',
        name: 'news',
        component: () => import('@/views/policyNews/index.vue'),
        meta: { title: '政策资讯' },
      },
      {
        path: ':id(\\d+)',
        name: 'news-detail',
        component: () => import('@/views/policyNews/detail.vue'),
        meta: { hideHero: true, title: '资讯详情' },
      },
    ],
  },
  {
    path: '/policy-db',
    component: SubPageLayout,
    meta: { navKey: 'policy-db' },
    children: [
      {
        path: '',
        name: 'policy-db',
        component: () => import('@/views/policyDb/index.vue'),
        meta: { title: '政策数据库' },
      },
      {
        path: ':id(\\d+)',
        name: 'policy-db-detail',
        component: () => import('@/views/policyDb/detail.vue'),
        meta: { hideHero: true, title: '政策详情' },
      },
    ],
  },
  {
    path: '/enterprise-db',
    component: SubPageLayout,
    meta: { navKey: 'enterprise-db' },
    children: [
      {
        path: '',
        name: 'enterprise-db',
        component: () => import('@/views/enterpriseDb/index.vue'),
        meta: { title: '企业数据库' },
      },
      {
        path: ':id(\\d+)',
        name: 'enterprise-db-detail',
        component: () => import('@/views/enterpriseDb/detail.vue'),
        meta: { hideHero: true, title: '企业详情' },
      },
    ],
  },
  {
    path: '/invest-db',
    component: SubPageLayout,
    meta: { navKey: 'invest-db' },
    children: [
      {
        path: '',
        name: 'invest-db',
        component: () => import('@/views/investDb/index.vue'),
        meta: { title: '投资项目库' },
      },
    ],
  },
  {
    path: '/export',
    component: SubPageLayout,
    meta: { navKey: 'export' },
    children: [
      {
        path: '',
        name: 'export',
        component: () => import('@/views/dataExport/index.vue'),
        meta: { title: '数据导出' },
      },
    ],
  },
  {
    path: '/api',
    component: SubPageLayout,
    meta: { navKey: 'api' },
    children: [
      {
        path: '',
        name: 'api',
        component: () => import('@/views/comingSoon/index.vue'),
        meta: { title: 'API接口目录' },
      },
    ],
  },
  {
    path: '/personal-center',
    component: SubPageLayout,
    meta: { navKey: 'personal-center', hideHero: true },
    children: [
      {
        path: '',
        name: 'personal-center',
        component: () => import('@/views/personalCenter/index.vue'),
        meta: { title: '个人中心', requiresAuth: true },
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/not-found/index.vue'),
    meta: { title: '页面未找到' },
  },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

const AUTH_PAGES = new Set(['personal-center'])

router.beforeEach((to) => {
  // 动态页面标题
  const title = (to.meta.title as string) || '政策大脑'
  document.title = `${title} - 政策大脑`

  // 需要登录的页面鉴权
  if (to.meta.requiresAuth && !getToken()) {
    return { name: 'home' }
  }

  // 通过 route name 检查（子路由的 name 在 to.name 上）
  if (AUTH_PAGES.has(to.name as string) && !getToken()) {
    return { name: 'home' }
  }
})

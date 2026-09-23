import {
  createRouter,
  createWebHistory,
  type RouteLocationNormalized,
  type RouteRecordRaw,
} from 'vue-router'
import { getToken, triggerNeedLogin } from '@/utils/auth'
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
    path: '/membership',
    name: 'membership',
    component: () => import('@/views/membership/index.vue'),
    meta: { title: '开通会员', immersiveHeader: true, navKey: 'membership' },
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

export const applyAuthGuard = (to: RouteLocationNormalized) => {
  const title = (to.meta.title as string) || '政策大脑'
  document.title = `${title} - 政策大脑`

  const needsAuth = to.matched.some((record) => record.meta.requiresAuth)
  if (needsAuth && !getToken()) {
    triggerNeedLogin()
    return { name: 'home' }
  }
  return true
}

router.beforeEach(applyAuthGuard)

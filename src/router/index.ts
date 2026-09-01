import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import SubPageLayout from '@/components/SubPageLayout.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/home/index.vue'),
    meta: { navKey: 'home' },
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
      },
      {
        path: ':id(\\d+)',
        name: 'news-detail',
        component: () => import('@/views/policyNews/detail.vue'),
        meta: { hideHero: true },
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
      },
      {
        path: ':id(\\d+)',
        name: 'policy-db-detail',
        component: () => import('@/views/policyDb/detail.vue'),
        meta: { hideHero: true },
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
      },
      {
        path: ':id(\\d+)',
        name: 'enterprise-db-detail',
        component: () => import('@/views/enterpriseDb/detail.vue'),
        meta: { hideHero: true },
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
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

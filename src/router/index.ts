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
        meta: { navKey: 'news' },
      },
      {
        path: ':id(\\d+)',
        name: 'news-detail',
        component: () => import('@/views/policyNews/detail.vue'),
        meta: { navKey: 'news', hideHero: true },
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
        meta: { navKey: 'policy-db' },
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
        component: () => import('@/views/comingSoon/index.vue'),
        meta: { navKey: 'enterprise-db' },
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
        meta: { navKey: 'invest-db' },
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
        meta: { navKey: 'export' },
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
        meta: { navKey: 'api' },
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

/// <reference types="vitest/config" />
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const cliPort = Number(env.VITE_CLI_PORT || 8001)
  const serverPort = env.VITE_SERVER_PORT || '9012'
  const basePath = (env.VITE_BASE_PATH || 'http://127.0.0.1').replace(/\/$/, '')
  const proxyTarget = `${basePath}:${serverPort}`
  const exposeLan = env.VITE_DEV_HOST === 'true'

  return {
    plugins: [
      vue(),
      AutoImport({
        imports: ['vue', 'vue-router', 'pinia'],
        dts: 'src/auto-imports.d.ts',
        vueTemplate: true,
      }),
      Components({
        resolvers: [
          AntDesignVueResolver({
            importStyle: false,
          }),
        ],
        dts: 'src/components.d.ts',
      }),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData(content: string, filepath: string) {
            const normalized = filepath.replaceAll('\\', '/')
            if (
              normalized.endsWith('/styles/tokens.scss') ||
              normalized.endsWith('/styles/pc-table.scss')
            ) {
              return content
            }
            return `@use "styles/tokens" as *;\n@use "styles/pc-table" as *;\n${content}`
          },
          loadPaths: [fileURLToPath(new URL('./src', import.meta.url))],
        },
      },
    },
    server: {
      host: exposeLan ? true : 'localhost',
      port: cliPort,
      proxy: {
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
          bypass(req) {
            if (req.headers.accept?.includes('text/html')) {
              return req.url
            }
          },
        },
        ...Object.fromEntries(
          [
            '/auth',
            '/account',
            '/health',
            '/system',
            '/meta',
            '/invest',
            '/policies',
            '/news',
            '/enterprises',
            '/search',
            '/match',
            '/kb',
          ].map((prefix) => [
            prefix,
            {
              target: proxyTarget,
              changeOrigin: true,
              // 浏览器打开 /news 等前端路由时要落到 SPA，接口请求仍转发后端
              bypass(req: { headers: { accept?: string }; url?: string }) {
                if (req.headers.accept?.includes('text/html')) return req.url
              },
            },
          ]),
        ),
      },
    },
    // 勿对 vue / ant-design-vue 做跨 chunk 硬拆：Vite 8(rolldown) 下易出现
    // 「e is not a function」白屏（vendor 与 ant-design-vue 循环/绑定错乱）
    build: {},
    test: {
      environment: 'jsdom',
      globals: false,
      include: ['src/**/*.test.ts'],
    },
  }
})

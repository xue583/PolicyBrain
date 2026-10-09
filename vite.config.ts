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
        '/auth': {
          target: proxyTarget,
          changeOrigin: true,
        },
        '/account': {
          target: proxyTarget,
          changeOrigin: true,
        },
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id: string) {
            const match = id.match(
              /[\\/]node_modules[\\/](@[^\\/]+[\\/][^\\/]+|[^\\/]+)/,
            )
            if (!match) return undefined
            const pkg = match[1]!
            if (pkg === 'ant-design-vue' || pkg === '@ant-design/icons-vue') {
              return 'ant-design-vue'
            }
            if (
              ['vue', 'vue-router', 'pinia', 'axios'].includes(pkg) ||
              pkg.startsWith('@vue/')
            ) {
              return 'vendor'
            }
            return undefined
          },
        },
      },
    },
    test: {
      environment: 'jsdom',
      globals: false,
      include: ['src/**/*.test.ts'],
    },
  }
})

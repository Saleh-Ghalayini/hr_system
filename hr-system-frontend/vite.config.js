import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  const hmrHost = env.VITE_HMR_HOST
  const hmrProtocol = env.VITE_HMR_PROTOCOL || (hmrHost ? 'wss' : 'ws')
  const hmrClientPort = Number(env.VITE_HMR_CLIENT_PORT || (hmrHost ? 443 : 5173))

  return {
    plugins: [react()],
    server: {
      host: '0.0.0.0',
      port: 5173,
      strictPort: true,
      allowedHosts: true,
      hmr: hmrHost
        ? {
            host: hmrHost,
            protocol: hmrProtocol,
            clientPort: hmrClientPort,
          }
        : undefined,
      proxy: {
        '/api': {
          target: 'http://127.0.0.1:8000',
          changeOrigin: true,
          secure: false,
        },
        '/storage': {
          target: 'http://127.0.0.1:8000',
          changeOrigin: true,
          secure: false,
        }
      }
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) return

            if (id.includes('react-dom') || id.includes('react-router-dom') || id.includes('react/')) {
              return 'react-vendor'
            }

            if (id.includes('@mui') || id.includes('@emotion')) {
              return 'mui-vendor'
            }

            if (id.includes('chart.js') || id.includes('react-chartjs-2')) {
              return 'charts-vendor'
            }

            if (id.includes('@iconify')) {
              return 'icons-vendor'
            }

            if (id.includes('axios') || id.includes('openai')) {
              return 'network-vendor'
            }
          },
        },
      },
    },
  }
})

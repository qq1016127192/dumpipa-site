import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    host: '0.0.0.0', // 允许外部访问
    port: 5174, // 分站前端端口，避免与主站(5173)冲突
    proxy: {
      '/api': {
        target: 'http://localhost:3001', // 指向分站后端
        changeOrigin: true,
      },
    },
  },
})

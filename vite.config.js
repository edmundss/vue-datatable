import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.js'),
      name: 'DatatableCard',
      fileName: (format) => `datatable-card.${format}.js`,
      cssFileName: 'style',
    },
    rollupOptions: {
      external: [
        'vue',
        '@inertiajs/vue3',
      ],
      output: {
        globals: {
          vue: 'Vue',
          '@inertiajs/vue3': 'InertiaVue3',
        }
      }
    }
  },
  plugins: [vue()],
})

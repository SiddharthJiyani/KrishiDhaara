import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  assetsInclude: ['**/*.JPG'],
  build: {
    rollupOptions: {
      external: ['zwitch'], // Externalize the module
    },
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  optimizeDeps: {
    include: ["zwitch"],
  },
  resolve: {
    alias: {
      "zwitch": "zwitch/index.js",
    },
  },
});

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    'process.env': process.env
  },
  server: {
    allowedHosts: true,
    proxy: {
      '/api': {
        target: 'https://g1ve.xyz',
        changeOrigin: true,
        secure: true,
      }
    }
  },
});

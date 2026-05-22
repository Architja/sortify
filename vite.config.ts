import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Sortify Smart City',
        short_name: 'Sortify',
        description: 'AI-Powered Smart City Waste Management Platform',
        theme_color: '#22c55e',
        background_color: '#ffffff',
        display: 'standalone'
        // icons removed – files were missing and caused manifest errors
      }
    })
  ],
  build: {
    chunkSizeWarningLimit: 2000,
  }
});

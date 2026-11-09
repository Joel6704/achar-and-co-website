import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// Vite plugin to rewrite /admin/* requests to /admin/index.html for client-side routing
function adminSpaFallback() {
  return {
    name: 'admin-spa-fallback',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url && (req.url === '/admin' || req.url.startsWith('/admin/')) && !req.url.includes('.')) {
          req.url = '/admin/index.html';
        }
        next();
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), adminSpaFallback()],
  server: {
    port: 3000,
    open: false,
    host: true
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        about: resolve(__dirname, 'about.html'),
        products: resolve(__dirname, 'products.html'),
        services: resolve(__dirname, 'services.html'),
        reviews: resolve(__dirname, 'reviews.html'),
        contact: resolve(__dirname, 'contact.html'),
        admin: resolve(__dirname, 'admin/index.html')
      }
    }
  }
});


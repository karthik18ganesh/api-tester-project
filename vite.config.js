import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { VitePWA } from 'vite-plugin-pwa'
import analyzer from 'rollup-plugin-analyzer'

export default defineConfig({
  plugins: [
    react({
      // React Fast Refresh optimization
      fastRefresh: true,
    }),
    
    // PWA Plugin for offline support
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\./,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24, // 24 hours
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|ico)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
            },
          },
        ],
      },
      includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
      manifest: {
        name: 'API Tester Pro',
        short_name: 'API Tester',
        description: 'Professional API Testing Tool',
        theme_color: '#3b82f6',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
  ],
  
  // ESBuild configuration to handle JSX in .js files
  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.[jt]sx?$/,
    exclude: [],
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
  },
  
  // Development server configuration
  server: {
    port: 3000,
    open: true,
    host: true,
    cors: true,
    // Enable HMR for better development experience
    hmr: {
      overlay: true,
    },
  },
  
  // Build configuration
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info'],
      },
      mangle: {
        safari10: true,
      },
    },
    rollupOptions: {
      plugins: [
        // Bundle analyzer (only when ANALYZE=true)
        process.env.ANALYZE && analyzer({
          summaryOnly: true,
          limit: 20,
        }),
      ].filter(Boolean),
      
      output: {
        manualChunks: {
          // React and React DOM
          'react-vendor': ['react', 'react-dom'],
          
          // React Router
          'router': ['react-router-dom'],
          
          // React Query and state management
          'state-management': ['@tanstack/react-query', 'zustand'],
          
          // UI libraries
          'ui-vendor': ['react-icons', 'react-toastify'],
          
          // Virtual scrolling
          'virtual': ['@tanstack/react-virtual'],
          
          // Error boundary and monitoring
          'monitoring': ['react-error-boundary', 'web-vitals'],
          
          // Utilities
          'utils': ['axios'],
        },
        
        // Optimize chunk file names
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
            ? chunkInfo.facadeModuleId.split('/').pop().replace('.js', '')
            : 'chunk';
          return `js/${facadeModuleId}-[hash].js`;
        },
        
        // Optimize asset file names
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `images/[name]-[hash][extname]`;
          }
          if (/css/i.test(ext)) {
            return `css/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
      },
      
      // External dependencies (for CDN optimization if needed)
      external: [],
    },
    reportCompressedSize: true,
  },
  
  // Path resolution
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@features': path.resolve(__dirname, './src/features'),
      '@stores': path.resolve(__dirname, './src/stores'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@assets': path.resolve(__dirname, './src/assets'),
    }
  },
  
  // Environment variables prefix
  envPrefix: 'VITE_',
  
  // CSS configuration
  css: {
    postcss: './postcss.config.js'
  },
  
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      '@tanstack/react-virtual',
      'zustand',
      'axios',
      'react-icons',
      'react-toastify',
      'web-vitals',
    ],
    exclude: ['@tanstack/react-query-devtools'],
  },

  // Define global constants
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
}) 
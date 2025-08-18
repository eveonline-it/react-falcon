import { defineConfig, loadEnv } from 'vite';
import fs from 'fs/promises';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import compileSCSS from './compile-scss';

export default ({ mode }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };

  return defineConfig({
    plugins: [react(), tsconfigPaths(), compileSCSS()],
    base: process.env.VITE_PUBLIC_URL || '/',
    esbuild: {
      loader: 'tsx',
      include: /src\/.*\.[jt]sx?$/,
      exclude: []
    },
    optimizeDeps: {
      esbuildOptions: {
        plugins: [
          {
            name: 'load-js-files-as-tsx',
            setup(build) {
              build.onLoad({ filter: /src\/.*\.[jt]s$/ }, async args => ({
                loader: 'tsx',
                contents: await fs.readFile(args.path, 'utf8')
              }));
            }
          }
        ]
      }
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            // React ecosystem
            'react-vendor': ['react', 'react-dom', 'react-router'],
            
            // Bootstrap and UI
            'ui-vendor': ['react-bootstrap', 'bootstrap', 'classnames'],
            
            // Charts and visualization
            'charts-vendor': ['echarts', 'echarts-for-react', 'chart.js', 'react-chartjs-2', 'd3'],
            
            // Maps
            'maps-vendor': ['@react-google-maps/api', 'leaflet', 'react-leaflet', 'react-leaflet-markercluster'],
            
            // Form handling
            'forms-vendor': ['react-hook-form', '@hookform/resolvers', 'yup', 'react-select'],
            
            // Icons and media
            'icons-media-vendor': [
              '@fortawesome/fontawesome-svg-core',
              '@fortawesome/free-solid-svg-icons',
              '@fortawesome/free-regular-svg-icons',
              '@fortawesome/free-brands-svg-icons',
              '@fortawesome/react-fontawesome',
              'react-icons',
              'lottie-react'
            ],
            
            // Calendar and date
            'calendar-vendor': [
              '@fullcalendar/react',
              '@fullcalendar/daygrid',
              '@fullcalendar/timegrid',
              '@fullcalendar/list',
              '@fullcalendar/interaction',
              '@fullcalendar/bootstrap',
              'dayjs',
              'react-datepicker'
            ],
            
            // Editor and rich content
            'editor-vendor': ['@tinymce/tinymce-react', 'tinymce', 'prism-react-renderer'],
            
            // Utilities
            'utils-vendor': ['uuid', 'fuse.js', 'imask', 'react-imask']
          }
        }
      }
    },
    define: {
      global: 'window'
    },
    server: {
      open: true,
      port: Number(process.env.VITE_APP_PORT) || 3000,
      host: process.env.VITE_APP_HOST || 'localhost',
      allowedHosts: [
        'localhost',
        '127.0.0.1',
        'react.eveonline.it'
      ]
    }
  });
};

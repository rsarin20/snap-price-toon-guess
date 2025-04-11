
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    host: "::",
    port: 8080,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    'import.meta.env.VITE_OPENAI_API_KEY': JSON.stringify('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')
  }
});

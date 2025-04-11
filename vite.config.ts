
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    'import.meta.env.VITE_OPENAI_API_KEY': JSON.stringify('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')
  }
});

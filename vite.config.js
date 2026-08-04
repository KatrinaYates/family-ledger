import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // GitHub Pages needs /family-ledger/; local dev uses / (see package.json scripts).
  base: process.env.GITHUB_PAGES === 'true' ? '/family-ledger/' : '/',
});

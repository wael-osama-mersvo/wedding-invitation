import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// Must match the GitHub repository name for GitHub Pages.
const REPO_NAME = 'wedding-invitation'

export default defineConfig({
  plugins: [vue()],
  base: `/${REPO_NAME}/`,
  test: {
    environment: 'jsdom',
    globals: true,
  },
})
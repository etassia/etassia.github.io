import { defineConfig } from 'astro/config'
import vue from '@astrojs/vue'
import sitemap from '@astrojs/sitemap'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  site: 'https://www.etassia.org',
  integrations: [vue(), sitemap()],
  vite: { plugins: [tailwindcss()] },
})

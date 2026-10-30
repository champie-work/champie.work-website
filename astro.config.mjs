import { defineConfig } from 'astro/config';

// format 'file': /project/ralph-lauren zonder slash-redirect (project-page.js haalt die URL op)
export default defineConfig({
  site: 'https://champie.work',
  build: { format: 'file' },
});

import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://nordy-sukmana.vercel.app',
  output: 'static',
  trailingSlash: 'always',
  build: {
    format: 'directory'
  }
});

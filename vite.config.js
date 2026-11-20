import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import rsc from '@vitejs/plugin-rsc'
import { recordClientServerReferences } from './record.js'

// Which page the RSC entry renders: src/pages/<VARIANT>.jsx.
const variant = process.env.VARIANT ?? 'browser'
// Two-round control: a module importing the server references the previous build's client
// environment found (written by repro.mjs), so the next RSC build sees them.
const seed = path.resolve(process.env.SEED_FILE ?? 'src/no-seed.js')

export default defineConfig({
  plugins: [
    react(),
    rsc({
      entries: {
        rsc: './src/entry.rsc.jsx',
        ssr: './src/entry.ssr.jsx',
        client: './src/entry.browser.jsx',
      },
      serverHandler: false,
    }),
    recordClientServerReferences(),
  ],
  resolve: {
    alias: { page: path.resolve(`src/pages/${variant}.jsx`), seed },
  },
  build: { minify: false },
})

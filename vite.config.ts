import { defineConfig } from 'vite';
export default defineConfig({root:'app',publicDir:'../public',base:'./',build:{outDir:'../dist',emptyOutDir:true,target:'es2022',chunkSizeWarningLimit:2500},server:{host:'127.0.0.1'}});

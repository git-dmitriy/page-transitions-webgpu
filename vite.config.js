import {defineConfig} from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
    plugins: [vue()],
    appType: 'spa',
    build: {
        outDir: 'dist',
        emptyOutDir: true,
    },
});

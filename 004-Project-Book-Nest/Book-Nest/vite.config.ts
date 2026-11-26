import { defineConfig } from 'vitest/config';
import adapter from '@sveltejs/adapter-auto';
import { sveltekit } from '@sveltejs/kit/vite';
import { svelteTesting } from '@testing-library/svelte/vite';

const shared = { globals: true, setupFiles: './src/test/setup.ts' };

export default defineConfig({
    plugins: [sveltekit({ adapter: adapter() })],
    test: {
        // server code must resolve SvelteKit's server build (redirect() reads window in the browser one)
        projects: [
            {
                extends: true,
                plugins: [svelteTesting()],
                test: {
                    ...shared,
                    name: 'client',
                    environment: 'jsdom',
                    include: ['src/**/*.svelte.test.ts'],
                },
            },
            {
                extends: true,
                test: {
                    ...shared,
                    name: 'server',
                    environment: 'node',
                    include: ['src/**/*.test.ts'],
                    exclude: ['src/**/*.svelte.test.ts'],
                },
            },
        ],
    },
});

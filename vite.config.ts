import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';
import Icons from 'unplugin-icons/vite';
import IconResolver from 'unplugin-icons/resolver';

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		vue(),
		vueJsx(),
		AutoImport({
			imports: ['vue', 'vue-router'],
			dts: 'src/@types/auto-imports.d.ts',
			dirs: ['src/auto/*.ts'],
			include: [/\.vue$/, /\.vue\?vue/],
			vueTemplate: true,
			resolvers: [
				ElementPlusResolver(),
				IconResolver({
					prefix: 'Icon',
				}),
			],
		}),
		Components({
			dts: 'src/@types/components.d.ts',
			dirs: 'src/components',
			globs: ['!./**/*'],
			resolvers: [
				IconResolver({
					enabledCollections: ['ep'],
				}),
				ElementPlusResolver(),
			],
			types: [
				{
					from: 'vue-router',
					names: ['RouterLink', 'RouterView'],
				},
			],
			version: 3,
			extensions: ['vue', 'tsx'],
			directives: false,
		}),
		Icons({
			autoInstall: true,
			scale: 1,
		}),
	],
	resolve: {
		alias: {
			'@': fileURLToPath(new URL('./src', import.meta.url)),
		},
	},
});

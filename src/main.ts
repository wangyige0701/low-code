import type { ComponentCustomProperties } from 'vue';

import 'element-plus/es/components/message/style/css';
import 'element-plus/es/components/message-box/style/css';
import 'element-plus/es/components/loading/style/css';
import './assets/main.css';
import '@/assets/tailwind.css';

import { createApp } from 'vue';
import { createPinia } from 'pinia';

import { ElLoading, ElInfiniteScroll } from 'element-plus';

import App from './App.vue';
import router, { registerBeforeEach } from './router';

const app = createApp(App);

app.use(createPinia());
app.use(router);
registerBeforeEach(router);
app.use(ElLoading).use(ElInfiniteScroll);

// @ts-expect-error
export const $global = app.mount('#app').global as ComponentCustomProperties;

import { createRouter, createWebHistory } from 'vue-router';
import { autoCreateRouterconfig } from './auto-router';

export * from './guard/beforeEach';

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes: autoCreateRouterconfig(),
});

export default router;

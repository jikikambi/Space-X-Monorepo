import { createRouter, createWebHistory } from 'vue-router';

// Lazy load pages
const LaunchList = () => import('../components/LaunchList.vue')
const LaunchDetail = () => import('../components/LaunchDetails.vue')

const routes = [
    { path: '/', redirect: '/launches' },
    { path: '/launches', component: LaunchList },
    { path: '/launches/:id', component: LaunchDetail },

    // Fallback route for 404s
    {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        component: {
            template: '<div class="p-4 text-center text-red-600">404 - Page Not Found</div>',
        }
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;
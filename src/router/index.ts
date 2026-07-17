import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import ManualView from '../views/ManualView.vue'
import ManualPageView from '../views/ManualPageView.vue'
import NamesView from '../views/NamesView.vue'
import GlossaryView from '../views/GlossaryView.vue'
import VideosView from '../views/VideosView.vue'
import WeeklyHubView from '../views/WeeklyHubView.vue'
import WeeklyContentView from '../views/WeeklyContentView.vue'
import ActivitiesView from '../views/ActivitiesView.vue'
import TeacherView from '../views/TeacherView.vue'
import ContactView from '../views/ContactView.vue'
import LinksView from '../views/LinksView.vue'
import PrintView from '../views/PrintView.vue'

export const router = createRouter({
  history: createWebHashHistory(),
  scrollBehavior: () => ({ top: 0 }),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/manual', name: 'manual', component: ManualView },
    { path: '/manual/page/:page', name: 'manual-page', component: ManualPageView },
    { path: '/names', name: 'names', component: NamesView },
    { path: '/videos', name: 'videos', component: VideosView },
    { path: '/weekly', name: 'weekly', component: WeeklyHubView },
    {
      path: '/weekly/:kind(summary|assignment|contemplation)',
      name: 'weekly-content',
      component: WeeklyContentView
    },
    { path: '/activities', name: 'activities', component: ActivitiesView },
    { path: '/teacher', name: 'teacher', component: TeacherView },
    { path: '/contact', name: 'contact', component: ContactView },
    { path: '/links', name: 'links', component: LinksView },
    { path: '/print', name: 'print', component: PrintView, meta: { print: true } },
    { path: '/:pathMatch(.*)*', redirect: '/' }
  ]
})

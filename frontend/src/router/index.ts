import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import Home from '../views/Home.vue'
import Tracker from '../views/Tracker.vue'
import Stats from '../views/Stats.vue'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import Profile from '../views/Profile.vue'
import editWorkoutWithWeights from '../components/editWorkoutWithWeights.vue'

const routes = [
  { 
    path: '/login', 
    name: 'Login', 
    component: Login,
    meta: { requiresGuest: true }
  },
  { 
    path: '/register', 
    name: 'Register', 
    component: Register,
    meta: { requiresGuest: true }
  },
  { 
    path: '/', 
    name: 'Home', 
    component: Home,
    meta: { requiresAuth: true }
  },
  { 
    path: '/tracker', 
    name: 'TrackerList', 
    component: Tracker,
    meta: { requiresAuth: true }
  },
  { 
    path: '/stats', 
    name: 'Stats', 
    component: Stats,
    meta: { requiresAuth: true }
  },
  { 
    path: '/profile', 
    name: 'Profile', 
    component: Profile,
    meta: { requiresAuth: true }
  },
  { 
    path: '/tracker/:id', 
    name: 'TrackerDetail', 
    component: Tracker,
    meta: { requiresAuth: true }
  },
  {
    path: '/stats/:id',
    name: 'EditWorkoutWithWeights',
    component: editWorkoutWithWeights,
    props: true,
    meta: { requiresAuth: true }
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Router Guards für Authentifizierung
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // Authentifizierung initialisieren wenn noch nicht geschehen
  if (authStore.token && !authStore.user) {
    try {
      await authStore.getCurrentUser()
    } catch (error) {
      console.error('Fehler beim Laden des Benutzers:', error)
      authStore.logout()
    }
  }
  
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const requiresGuest = to.matched.some(record => record.meta.requiresGuest)
  
  // Prüfe nur auf Token für Authentifizierung, da user asynchron geladen wird
  const isAuthenticated = !!authStore.token
  
  if (requiresAuth && !isAuthenticated) {
    // Benutzer ist nicht authentifiziert, leite zu Login weiter
    next('/login')
  } else if (requiresGuest && isAuthenticated) {
    // Benutzer ist bereits angemeldet, leite zur Startseite weiter
    next('/')
  } else {
    next()
  }
})

export default router

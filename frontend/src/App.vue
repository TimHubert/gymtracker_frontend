<template>
  <div id="app">
    <header class="header" v-if="authStore.isAuthenticated">
      <nav class="nav-container">
        <div class="logo-wrapper">
          <img src="@/assets/logo.png" alt="Logo" class="logo" />
        </div>
        <div class="links">
          <router-link to="/">Home</router-link>
          <router-link to="/tracker">Tracker</router-link>
          <router-link to="/stats">Stats</router-link>
          <div class="user-menu">
            <button @click="toggleUserDropdown" class="user-button">
              <span class="user-avatar">{{ userInitial }}</span>
              <span class="username">{{ authStore.user?.username }}</span>
              <span class="dropdown-arrow">▼</span>
            </button>
            <div v-if="showUserDropdown" class="user-dropdown">
              <router-link to="/profile" class="dropdown-item" @click="showUserDropdown = false">
                👤 Profil
              </router-link>
              <button @click="handleLogout" class="dropdown-item logout-item">🚪 Abmelden</button>
            </div>
          </div>
        </div>
      </nav>
    </header>
    <main class="main-content" :class="{ 'no-auth': !authStore.isAuthenticated }">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from './stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const showUserDropdown = ref(false)

const userInitial = computed(() => {
  return authStore.user?.username?.charAt(0).toUpperCase() || '?'
})

const toggleUserDropdown = () => {
  showUserDropdown.value = !showUserDropdown.value
}

const handleLogout = async () => {
  showUserDropdown.value = false
  await authStore.logout()
  router.push('/login')
}

// Close dropdown when clicking outside
const handleClickOutside = (event: Event) => {
  const target = event.target as HTMLElement
  if (!target.closest('.user-menu')) {
    showUserDropdown.value = false
  }
}

onMounted(() => {
  // Initialize auth on app start
  authStore.initializeAuth()

  // Add global click listener for dropdown
  document.addEventListener('click', handleClickOutside)
})
</script>

<style>
.logo {
  height: 50px;
  width: auto;
}

.logo-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 1rem;
}

.header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
}

.nav-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  padding: 1rem 2rem;
  max-width: cover;
  margin: 0 auto;
  background: linear-gradient(rgba(12, 12, 12, 0.8), rgba(19, 19, 19, 0.8));
  backdrop-filter: blur(10px);
  background-color: transparent;
  border-radius: 1px 0 10px 10px;
  box-shadow: 0 0 20px 10px rgba(0, 0, 0, 0.5);
  position: relative;
  z-index: 1000;
  opacity: 1;
}

.links {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
}

nav a {
  color: white;
  text-align: center;
  text-decoration: none;
  font-weight: bold;
  padding: 0.5rem 1rem;
  border-radius: 30px;
  width: 8rem;
  transition: background-color 0.3s;
  background-color: rgba(255, 255, 255, 0.1);
}

nav a:hover {
  background-color: rgb(0, 110, 255);
}

nav a.router-link-exact-active {
  background-color: rgb(0, 110, 255);
}

.user-menu {
  position: relative;
}

.user-button {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 30px;
  padding: 8px 16px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: bold;
}

.user-button:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.user-avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: linear-gradient(135deg, #006eff, #0056cc);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: bold;
}

.username {
  font-size: 14px;
}

.dropdown-arrow {
  font-size: 10px;
  transition: transform 0.3s ease;
}

.user-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 10px;
  padding: 8px 0;
  min-width: 150px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  z-index: 1001;
  margin-top: 8px;
}

.dropdown-item {
  display: block;
  width: 100%;
  padding: 12px 16px;
  color: white;
  text-decoration: none;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s ease;
  text-align: left;
}

.dropdown-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.logout-item {
  color: #ff6b6b;
}

.logout-item:hover {
  background-color: rgba(255, 107, 107, 0.1);
}

.main-content {
  width: 80%;
  max-width: 1300px;
  margin: 150px auto 30px auto;
  padding: 2rem;
  border-radius: 10px;
  overflow-y: visible;
}

.main-content.no-auth {
  margin: 0 auto;
  padding: 0;
  width: 100%;
  max-width: none;
}

body {
  overflow-y: auto;
}

@media (max-width: 768px) {
  .links {
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .user-button {
    padding: 6px 12px;
  }

  .username {
    display: none;
  }

  nav a {
    width: auto;
    padding: 0.5rem 0.8rem;
  }
}
</style>

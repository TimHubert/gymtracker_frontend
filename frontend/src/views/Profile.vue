<template>
  <div class="profile-container">
    <div class="profile-card">
      <h2>👤 Mein Profil</h2>
      
      <div v-if="authStore.user" class="profile-info">
        <div class="user-header">
          <h3 class="username-display">{{ authStore.user.username }}</h3>
        </div>
        
        <form @submit.prevent="handleUpdateProfile">
          <div class="form-group">
            <label for="username">Benutzername:</label>
            <input
              id="username"
              v-model="profileData.username"
              type="text"
              required
              :disabled="authStore.isLoading"
            />
          </div>
          
          <div class="form-group">
            <label for="email">E-Mail:</label>
            <input
              id="email"
              v-model="profileData.email"
              type="email"
              required
              :disabled="authStore.isLoading"
            />
          </div>
          
          <div v-if="authStore.error" class="error-message">
            {{ authStore.error }}
          </div>
          
          <div v-if="successMessage" class="success-message">
            {{ successMessage }}
          </div>
          
          <div class="button-group">
            <button 
              type="submit" 
              class="save-btn"
              :disabled="authStore.isLoading || !hasChanges"
            >
              {{ authStore.isLoading ? 'Speichern...' : 'Profil aktualisieren' }}
            </button>
            
            <button 
              type="button" 
              class="logout-btn"
              @click="handleLogout"
            >
              Abmelden
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const profileData = ref({
  username: '',
  email: ''
})

const successMessage = ref('')

const hasChanges = computed(() => {
  if (!authStore.user) return false
  
  return (
    profileData.value.username !== authStore.user.username ||
    profileData.value.email !== authStore.user.email
  )
})

const loadProfileData = () => {
  if (authStore.user) {
    profileData.value = {
      username: authStore.user.username,
      email: authStore.user.email
    }
  }
}

const handleUpdateProfile = async () => {
  authStore.clearError()
  successMessage.value = ''
  
  const result = await authStore.updateProfile(profileData.value)
  
  if (result.success) {
    successMessage.value = 'Profil erfolgreich aktualisiert! Sie werden in 3 Sekunden abgemeldet und müssen sich erneut anmelden.'
    
    // Nach 3 Sekunden automatisch abmelden
    setTimeout(async () => {
      await authStore.logout()
      router.push('/login')
    }, 3000)
  }
}

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}

onMounted(() => {
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }
  loadProfileData()
})
</script>

<style scoped>
.profile-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 70vh;
  padding: 20px;
}

.profile-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 40px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

h2 {
  text-align: center;
  color: var(--color-text);
  margin-bottom: 30px;
  font-size: 1.8em;
}

.user-header {
  display: flex;
  justify-content: center;
  margin-bottom: 30px;
}

.username-display {
  font-size: 1.5em;
  font-weight: bold;
  color: var(--color-text);
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  color: var(--color-text);
  margin-bottom: 8px;
  font-weight: 600;
}

input {
  width: 100%;
  padding: 12px 16px;
  border: none;
  border-radius: 10px;
  background: var(--color-background-soft);
  color: var(--color-text);
  font-size: 16px;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

input:focus {
  outline: none;
  background: var(--color-background-mute);
  box-shadow: 0 0 0 2px rgba(0, 110, 255, 0.5);
}

input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.button-group {
  display: flex;
  gap: 15px;
  margin-top: 30px;
}

.save-btn, .logout-btn {
  flex: 1;
  padding: 14px;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.save-btn {
  background: linear-gradient(135deg, #28a745, #20923a);
  color: white;
}

.save-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #20923a, #1e7e34);
  transform: translateY(-2px);
}

.save-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.logout-btn {
  background: linear-gradient(135deg, #dc3545, #c82333);
  color: white;
}

.logout-btn:hover {
  background: linear-gradient(135deg, #c82333, #bd2130);
  transform: translateY(-2px);
}

.error-message {
  background: rgba(255, 107, 107, 0.2);
  color: #ff6b6b;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
  border: 1px solid rgba(255, 107, 107, 0.3);
}

.success-message {
  background: rgba(40, 167, 69, 0.2);
  color: #28a745;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
  border: 1px solid rgba(40, 167, 69, 0.3);
}

@media (max-width: 480px) {
  .profile-card {
    padding: 30px 20px;
    margin: 10px;
  }
  
  .button-group {
    flex-direction: column;
  }
  
  h2 {
    font-size: 1.5em;
  }
}
</style>
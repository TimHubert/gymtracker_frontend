<template>
  <div class="login-container">
    <div class="login-form">
      <h2>
        <img src="/favicon.png" alt="Gym Tracker Logo" class="logo" />
        Gym Tracker Login
      </h2>
      
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="username">Benutzername:</label>
          <input
            id="username"
            v-model="credentials.username"
            type="text"
            required
            :disabled="authStore.isLoading"
          />
        </div>
        
        <div class="form-group">
          <label for="password">Passwort:</label>
          <input
            id="password"
            v-model="credentials.password"
            type="password"
            required
            :disabled="authStore.isLoading"
          />
        </div>
        
        <div v-if="authStore.error" class="error-message">
          {{ authStore.error }}
        </div>
        
        <button 
          type="submit" 
          class="login-btn"
          :disabled="authStore.isLoading"
        >
          {{ authStore.isLoading ? 'Anmelden...' : 'Anmelden' }}
        </button>
      </form>
      
      <div class="register-link">
        <p>Noch kein Account? 
          <router-link to="/register">Hier registrieren</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const credentials = ref({
  username: '',
  password: ''
})

const handleLogin = async () => {
  authStore.clearError()
  
  const result = await authStore.login(credentials.value)
  
  if (result.success) {
    router.push('/')
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 70vh;
  padding: 20px;
}

.login-form {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 40px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.logo {
  width: 30px;
  height: 30px;
}

h2 {
  text-align: center;
  color: var(--color-text);
  margin-bottom: 30px;
  font-size: 1.8em;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
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
}

input::placeholder {
  color: var(--color-text);
  opacity: 0.6;
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

.login-btn {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #006eff, #0056cc);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 10px;
}

.login-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #0056cc, #004499);
  transform: translateY(-2px);
}

.login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.error-message {
  background: rgba(255, 107, 107, 0.2);
  color: #ff6b6b;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
  border: 1px solid rgba(255, 107, 107, 0.3);
}

.register-link {
  text-align: center;
  margin-top: 20px;
}

.register-link p {
  color: var(--color-text);
  margin: 0;
}

.register-link a {
  color: #006eff;
  text-decoration: none;
  font-weight: 600;
}

.register-link a:hover {
  text-decoration: underline;
}

@media (max-width: 480px) {
  .login-form {
    padding: 30px 20px;
    margin: 10px;
  }
  
  h2 {
    font-size: 1.5em;
  }
}
</style>
<template>
  <div class="register-container">
    <div class="register-form">
      <h2>🏋️‍♂️ Gym Tracker Registrierung</h2>
      
      <form @submit.prevent="handleRegister">
        <div class="form-group">
          <label for="username">Benutzername:</label>
          <input
            id="username"
            v-model="registerData.username"
            type="text"
            required
            :disabled="authStore.isLoading"
            placeholder="Dein Benutzername"
          />
        </div>
        
        <div class="form-group">
          <label for="email">E-Mail:</label>
          <input
            id="email"
            v-model="registerData.email"
            type="email"
            required
            :disabled="authStore.isLoading"
            placeholder="deine@email.com"
          />
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label for="firstName">Vorname:</label>
            <input
              id="firstName"
              v-model="registerData.firstName"
              type="text"
              :disabled="authStore.isLoading"
              placeholder="Vorname"
            />
          </div>
          
          <div class="form-group">
            <label for="lastName">Nachname:</label>
            <input
              id="lastName"
              v-model="registerData.lastName"
              type="text"
              :disabled="authStore.isLoading"
              placeholder="Nachname"
            />
          </div>
        </div>
        
        <div class="form-group">
          <label for="password">Passwort:</label>
          <input
            id="password"
            v-model="registerData.password"
            type="password"
            required
            :disabled="authStore.isLoading"
            placeholder="Mindestens 6 Zeichen"
            minlength="6"
          />
        </div>
        
        <div class="form-group">
          <label for="confirmPassword">Passwort bestätigen:</label>
          <input
            id="confirmPassword"
            v-model="confirmPassword"
            type="password"
            required
            :disabled="authStore.isLoading"
            placeholder="Passwort wiederholen"
          />
        </div>
        
        <div v-if="passwordError" class="error-message">
          {{ passwordError }}
        </div>
        
        <div v-if="authStore.error" class="error-message">
          {{ authStore.error }}
        </div>
        
        <button 
          type="submit" 
          class="register-btn"
          :disabled="authStore.isLoading || !!passwordError"
        >
          {{ authStore.isLoading ? 'Registrieren...' : 'Registrieren' }}
        </button>
      </form>
      
      <div class="login-link">
        <p>Bereits einen Account? 
          <router-link to="/login">Hier anmelden</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const registerData = ref({
  username: '',
  email: '',
  password: '',
  firstName: '',
  lastName: ''
})

const confirmPassword = ref('')

const passwordError = computed(() => {
  if (!registerData.value.password || !confirmPassword.value) return null
  if (registerData.value.password !== confirmPassword.value) {
    return 'Passwörter stimmen nicht überein'
  }
  if (registerData.value.password.length < 6) {
    return 'Passwort muss mindestens 6 Zeichen lang sein'
  }
  return null
})

const handleRegister = async () => {
  if (passwordError.value) return
  
  authStore.clearError()
  
  const result = await authStore.register(registerData.value)
  
  if (result.success) {
    router.push('/')
  }
}
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 70vh;
  padding: 20px;
}

.register-form {
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
  color: white;
  margin-bottom: 30px;
  font-size: 1.8em;
}

.form-row {
  display: flex;
  gap: 15px;
}

.form-row .form-group {
  flex: 1;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  color: white;
  margin-bottom: 8px;
  font-weight: 600;
}

input {
  width: 100%;
  padding: 12px 16px;
  border: none;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 16px;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

input::placeholder {
  color: rgba(255, 255, 255, 0.6);
}

input:focus {
  outline: none;
  background: rgba(255, 255, 255, 0.2);
  box-shadow: 0 0 0 2px rgba(0, 110, 255, 0.5);
}

input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.register-btn {
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

.register-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #0056cc, #004499);
  transform: translateY(-2px);
}

.register-btn:disabled {
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

.login-link {
  text-align: center;
  margin-top: 20px;
}

.login-link p {
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
}

.login-link a {
  color: #006eff;
  text-decoration: none;
  font-weight: 600;
}

.login-link a:hover {
  text-decoration: underline;
}

@media (max-width: 480px) {
  .register-form {
    padding: 30px 20px;
    margin: 10px;
  }
  
  .form-row {
    flex-direction: column;
    gap: 0;
  }
  
  h2 {
    font-size: 1.5em;
  }
}
</style>
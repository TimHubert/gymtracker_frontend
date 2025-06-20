<template>
  <div>
    <h1>Neues Workout</h1>
    <input class="input-line" placeholder="Name des Workouts" required v-model="workout.name" />

    <div class="column" v-if="zeigeÜbungen">
      <div v-for="(übung, index) in übungen" :key="index" class="exercise">
        <div style="display: flex; align-items: center; width: 100%">
          Name
          <div style="flex: 1; margin-left: 0.5rem">
            <select v-model="übung.name" id="übungname" style="width: 100%">
              <option value="custom">Benutzerdefiniert</option>
              <option disabled value="">Übung auswählen</option>
              <option v-for="exercise in uniqueExerciseNames" :key="exercise" :value="exercise">
                {{ exercise }}
              </option>
            </select>
            <input
              v-if="übung.name === 'custom'"
              v-model="übung.customName"
              placeholder="Benutzerdefinierter Übungsname"
              required
              class="custom-input-inline"
            />
          </div>
        </div>
        <div style="display: flex; align-items: center; width: 100%">
          Equipment
          <div style="flex: 1; margin-left: 0.5rem">
            <select v-model="übung.gerät" id="übungequipment" style="width: 100%">
              <option value="custom">Benutzerdefiniert</option>
              <option disabled value="">Equipment auswählen</option>
              <option v-for="exercise in uniqueEquipmentNames" :key="exercise" :value="exercise">
                {{ exercise }}
              </option>
            </select>
            <input
              v-if="übung.gerät === 'custom'"
              v-model="übung.customEquipment"
              placeholder="Benutzerdefiniertes Equipment"
              required
              class="custom-input-inline"
            />
          </div>
        </div>
        <div style="display: flex; align-items: center">
          Muskelgruppe
          <select v-model="übung.muskelgruppe" id="muskelgruppe">
            <option disabled value="">Muskelgruppe</option>
            <option v-for="gruppe in übung.muskelgruppen" :key="gruppe" :value="gruppe">
              {{ gruppe }}
            </option>
          </select>
          <button @click="removeÜbung(index)" type="button">
            <img src="@/assets/remove.svg" alt="Löschen" style="width: 15px; height: auto" />
          </button>
        </div>
        <hr class="exercise-separator" />
      </div>
    </div>

    <button @click="toggleÜbungen" type="button" class="add">
      <img src="@/assets/add.svg" alt="Löschen" style="width: 15px; height: auto" />
    </button>
    <div style="display: flex; justify-content: center; margin-top: 1rem; align-items: center">
      <button @click="submitWorkout" type="submit" class="submit">Erstellen</button>
    </div>
  </div>
</template>

<script setup>
import { ref, vModelCheckbox, onMounted, computed } from 'vue'
import { useAuthStore } from '../stores/auth'
import axios from 'axios'
import { createApiUrl, API_CONFIG } from '../config/api'

const authStore = useAuthStore()

onMounted(() => {
  fetchWorkouts()
})

async function fetchWorkouts() {
  try {
    console.log('NewWorkout: Lade Workouts...')
    
    // Warte bis Authentifizierung initialisiert ist
    if (!authStore.isAuthenticated) {
      console.log('⏳ NewWorkout: Warte auf Authentifizierung...')
      return
    }

    const response = await axios.get(createApiUrl(API_CONFIG.WORKOUTS.ALL))
    console.log('NewWorkout: Workouts geladen:', response.data)

    const exercises = response.data.flatMap((workout) => workout.exercise)
    workouts.value = exercises
  } catch (error) {
    console.error('NewWorkout: Fehler beim Laden der Workouts:', error)
    if (error.response?.status === 401) {
      console.error('🔒 NewWorkout: Authentifizierung fehlgeschlagen')
    }
  }
}

const zeigeÜbungen = ref(false)
const übungen = ref([
  {
    name: '',
    customName: '',
    gerät: '',
    customEquipment: '',
    muskelgruppe: '',
    muskelgruppen: ['Brust', 'Lat', 'Trizeps', 'Bizeps', 'Schulter', 'Beine'],
  },
])

const workout = ref({
  name: '',
  exercises: [],
  namen: [],
})

const workouts = ref([])

const uniqueExerciseNames = computed(() => {
  return [...new Set(workouts.value.map((exercise) => exercise.name))]
})

const uniqueEquipmentNames = computed(() => {
  return [...new Set(workouts.value.map((exercise) => exercise.equipment))]
})

function toggleÜbungen() {
  if (!zeigeÜbungen.value) {
    zeigeÜbungen.value = true
  } else {
    addÜbung()
  }
}

function addÜbung() {
  übungen.value.push({
    name: '',
    customName: '',
    gerät: '',
    customEquipment: '',
    muskelgruppe: '',
    muskelgruppen: ['Brust', 'Lat', 'Trizeps', 'Bizeps', 'Schulter', 'Beine'],
  })
}

function removeÜbung(index) {
  übungen.value.splice(index, 1)
}

async function submitWorkout() {
  try {
    console.log('Erstelle Workout:', workout.value)

    if (!workout.value.name.trim()) {
      alert('Bitte geben Sie einen Namen für das Workout ein.')
      return
    }

    if (übungen.value.length === 0) {
      alert('Ein Workout muss mindestens eine Übung enthalten.')
      return
    }

    for (const übung of übungen.value) {
      const finalName = übung.name === 'custom' ? übung.customName : übung.name
      const finalEquipment = übung.gerät === 'custom' ? übung.customEquipment : übung.gerät

      if (!finalName.trim() || !finalEquipment.trim() || !übung.muskelgruppe.trim()) {
        alert('Bitte füllen Sie alle Felder für die Übungen aus.')
        return
      }
    }

    workout.value.exercises = übungen.value.map((übung) => ({
      name: übung.name === 'custom' ? übung.customName : übung.name,
      equipment: übung.gerät === 'custom' ? übung.customEquipment : übung.gerät,
      targetMuscleGroup: übung.muskelgruppe,
    }))

    const payload = {
      name: workout.value.name,
      exercise: workout.value.exercises,
      show: true,
    }

    console.log('📦 NewWorkout: Gesendete Daten:', JSON.stringify(payload))

    const response = await axios.post(createApiUrl('/workout'), payload)

    console.log('NewWorkout: Workout erfolgreich erstellt:', response.data)
    alert('Workout erfolgreich erstellt')
    window.location.reload()
  } catch (error) {
    console.error('NewWorkout: Fehler:', error)
    if (error.response?.status === 401) {
      alert('Authentifizierung fehlgeschlagen. Bitte melden Sie sich erneut an.')
    } else {
      alert('Fehler beim Erstellen des Workouts')
    }
  }
}
</script>

<style>
.column {
  display: flex;
  flex-direction: column;
  margin-top: 1rem;
}
.exercise {
  margin-top: 0.3rem;
}
.exercise input,
.exercise select {
  width: 100%;
  margin-right: 0.5rem;
  margin-left: 0.5rem;
  margin-top: 0.9rem;
  margin-bottom: 0.5rem;
  padding: 0.5rem;
  border-radius: 10px;
  border: 1px solid var(--color-border);
  background-color: var(--color-background-soft);
  color: var(--color-text);
  outline: none;
}

.custom-input-inline {
  width: 100% !important;
  margin-top: 0.5rem !important;
  margin-left: 0 !important;
  margin-right: 0 !important;
}
.exercise input[type='checkbox'] {
  width: auto;
  margin-right: 0.5rem;
}
.exercise button {
  margin-top: 0.2rem;
  background-color: #ff4d4d;
  color: white;
  border: none;
  padding: 0.3rem 0.4rem;
  border-radius: 15px;
  cursor: pointer;
  outline: none;
  display: flex;
  justify-content: center;
  align-items: center;
}
.exercise button:hover {
  background-color: #ff1a1a;
}

.add {
  background-color: rgb(0, 110, 255);
  margin-top: 0.4rem;
  color: white;
  border: none;
  padding: 0.3rem 0.4rem;
  border-radius: 30px;
  cursor: pointer;
  outline: none;
  display: flex;
  justify-content: center;
  align-items: center;
}
.add:hover {
  background-color: rgb(0, 65, 150);
}

.submit {
  background-color: rgb(0, 110, 255);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 30px;
  cursor: pointer;
  outline: none;
  display: flex;
  justify-content: center;
  align-items: center;
}
.submit:hover {
  background-color: rgb(0, 84, 194);
}
.input-line {
  padding: 0.5rem 0;
  border: none;
  border-bottom: 2px solid var(--color-border);
  background-color: transparent;
  color: var(--color-text);
  outline: none;
  width: 100%;
  font-size: large;
}

.input-line:focus {
  border-bottom: 2px solid rgb(0, 110, 255);
}

.table {
  width: 100%;
  border-collapse: none;
}
.table th,
.table td {
  padding: 8px;
  text-align: left;
  background-color: var(--color-background-soft);
  color: var(--color-text);
}
.table th {
  background-color: var(--color-background-mute);
  color: var(--color-text);
}

.exercise_name {
  font-weight: thin;
  font-size: 1.2rem;
  color: var(--color-text);
}

.exercise-separator {
  border: none;
  height: 1px;
  background-color: var(--color-border);
  margin: 1rem 0;
  opacity: 0.5;
}
</style>

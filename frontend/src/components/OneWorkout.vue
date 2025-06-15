<template>
  <div class="stats-dashboard">
    <div v-if="workout" class="workout-content">
      <h2>
        <button v-if="!isEditing" @click="$emit('back')" class="button back-button">
          <img src="@/assets/back.svg" alt="Löschen" style="width: 15px" />
        </button>
        <template v-if="isEditing">
          <input
            v-model="workout.name"
            placeholder="Workout-Name"
            required
            class="input workout-name-input"
          />
        </template>
        <template v-else>
          {{ workout.name }}
        </template>
      </h2>

      <div class="workout-list">
        <div
          v-for="(exercise, index) in workout.exercises"
          :key="exercise.id"
          class="exercise-block"
        >
          <div class="exercise-details-row">
            <div class="exercise-detail">
              <template v-if="isEditing">
                <div class="inline-input-group">
                  <select v-model="exercise.name" class="input select-input">
                    <option value="custom">Benutzerdefiniert</option>
                    <option disabled value="">Übungsname auswählen</option>
                    <option v-for="option in exerciseOptions" :key="option" :value="option">
                      {{ option }}
                    </option>
                  </select>
                  <input
                    v-if="exercise.name === 'custom'"
                    v-model="exercise.customName"
                    placeholder="Übungsname"
                    required
                    class="input custom-input inline-custom-input"
                  />
                </div>
              </template>
              <template v-else>
                {{ exercise.customName || exercise.name }}
              </template>
            </div>
            <div class="exercise-detail">
              <template v-if="isEditing">
                <div class="inline-input-group">
                  <select v-model="exercise.equipment" class="input select-input">
                    <option disabled value="">Equipment auswählen</option>
                    <option value="custom">Benutzerdefiniert</option>
                    <option
                      v-for="option in equipmentOptions.filter((opt) => opt !== 'custom')"
                      :key="option"
                      :value="option"
                    >
                      {{ option }}
                    </option>
                  </select>
                  <input
                    v-if="exercise.equipment === 'custom'"
                    v-model="exercise.customEquipment"
                    placeholder="Equipment"
                    required
                    class="input custom-input inline-custom-input"
                  />
                </div>
              </template>
              <template v-else>
                {{ exercise.customEquipment || exercise.equipment }}
              </template>
            </div>
            <div class="exercise-detail">
              <template v-if="isEditing">
                <select v-model="exercise.targetMuscleGroup" class="input select-input">
                  <option disabled value="">Muskelgruppe</option>
                  <option v-for="group in muscleGroups" :key="group" :value="group">
                    {{ group }}
                  </option>
                </select>
              </template>
              <template v-else>
                {{ exercise.targetMuscleGroup }}
              </template>
            </div>
          </div>
          <div class="exercise-reps-row">
            <div v-for="(rep, repIndex) in exercise.reps" :key="repIndex" class="rep-container">
              <template v-if="isEditing">
                <input
                  v-model="exercise.reps[repIndex]"
                  placeholder="Reps"
                  required
                  class="input rep-input"
                  type="number"
                  min="0"
                />
                <span class="separator">x</span>
                <input
                  v-model="exercise.weights[repIndex]"
                  placeholder="Weight"
                  required
                  class="input weight-input"
                  type="number"
                  min="0"
                />
                kg
              </template>
              <template v-else>
                <span>{{ exercise.reps[repIndex] }}</span>
                <span class="separator">x</span>
                <span>{{ exercise.weights[repIndex] }}</span>
                kg
              </template>
            </div>
            <div class="button-container">
              <button v-if="isEditing" @click="addRep(index)" class="button add-button">+</button>
              <button
                v-if="isEditing"
                @click="removeRep(index)"
                :disabled="exercise.reps.length <= 1"
                class="button remove-button"
              >
                -
              </button>
            </div>
          </div>
        </div>
      </div>
      <div class="action-buttons">
        <button v-if="isEditing" @click="cancelEdit" class="button">
          <img src="@/assets/back.svg" alt="Löschen" style="width: 15px" />
        </button>
        <button v-if="isEditing" @click="addExercise" class="button add-button">
          Übung hinzufügen
        </button>
        <button v-if="isEditing" @click="removeExercise" class="button remove-button">
          Übung entfernen
        </button>
        <button v-if="isEditing" @click="saveWorkout" class="button submit-button">
          Änderungen Übernehmen
        </button>
        <button v-else @click="toggleEditMode" class="button edit-button">Bearbeiten</button>
        <button v-if="!isEditing" @click="saveWorkoutWithWeights" class="button submit-button">
          Speichern
        </button>
      </div>
    </div>
    <p v-else>Workout wird geladen...</p>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import axios from 'axios'

const props = defineProps({
  workoutId: {
    type: Number,
    required: true,
  },
})

const emit = defineEmits(['back'])
const authStore = useAuthStore()
const workouts = ref([])
const exerciseOptions = ref([])
const equipmentOptions = ref([])
const flattenedWorkouts = ref([])
const workout = ref(null)
const isEditing = ref(false)
const originalWorkout = ref(null)
const router = useRouter()

const muscleGroups = ['Brust', 'Lat', 'Trizeps', 'Bizeps', 'Schulter', 'Beine']

const loadOptions = async () => {
  try {
    console.log('OneWorkout: Lade Workout-Optionen...')
    
    // Warte bis Authentifizierung initialisiert ist
    if (!authStore.isAuthenticated) {
      console.log('OneWorkout: Warte auf Authentifizierung...')
      return
    }

    const response = await axios.get('http://localhost:8080/workoutsWithWeights')
    console.log('OneWorkout: Workout-Optionen geladen:', response.data)
    const data = response.data
    workouts.value = data

    flattenedWorkouts.value = data.flatMap((workout) =>
      workout.workout.exercise.map((exercise, index) => {
        const weightEntry = workout.weights[index] || {}
        return {
          workoutWithWeightsId: workout.id,
          workoutId: workout.workout.id,
          workoutName: workout.workout.name,
          exerciseName: exercise.name,
          exId: exercise.id,
          targetMuscleGroup: exercise.targetMuscleGroup,
          equipment: exercise.equipment,
          reps: weightEntry.reps || [],
          weights: weightEntry.weights || [],
          date: workout.date || new Date().toISOString().split('T')[0],
        }
      }),
    )

    exerciseOptions.value = [...new Set(flattenedWorkouts.value.map((item) => item.exerciseName))]
    equipmentOptions.value = [...new Set(flattenedWorkouts.value.map((item) => item.equipment))]
  } catch (error) {
    console.error('OneWorkout: Fehler beim Laden der Workouts:', error)
    if (error.response?.status === 401) {
      console.error('OneWorkout: Authentifizierung fehlgeschlagen')
    }
  }
}

const loadWorkout = async () => {
  try {
    console.log('OneWorkout: Lade Workout...', props.workoutId)
    
    // Warte bis Authentifizierung initialisiert ist
    if (!authStore.isAuthenticated) {
      console.log('OneWorkout: Warte auf Authentifizierung...')
      return
    }

    const response = await axios.get(`http://localhost:8080/workout/${props.workoutId}`)
    console.log('OneWorkout: Workout geladen:', response.data)
    const data = response.data
    const loadedWorkout = {
      id: data.id,
      name: data.name,
      date: data.date || new Date().toISOString().split('T')[0],
      exercises:
        data.exercise.map((ex) => ({
          ...ex,
          reps: ex.reps || [0, 0, 0],
          weights: ex.weights || [0, 0, 0],
        })) || [],
    }
    workout.value = JSON.parse(JSON.stringify(loadedWorkout))
    originalWorkout.value = JSON.parse(JSON.stringify(loadedWorkout))
  } catch (error) {
    console.error('OneWorkout: Fehler beim Laden des Workouts:', error)
    if (error.response?.status === 401) {
      console.error('OneWorkout: Authentifizierung fehlgeschlagen')
    } else if (error.response?.status === 403) {
      console.error('OneWorkout: Zugriff verweigert')
    }
  }
}

const addRep = (exerciseIndex) => {
  const exercise = workout.value.exercises[exerciseIndex]
  exercise.reps.push(0)
  exercise.weights.push(0)
}

const removeRep = (exerciseIndex) => {
  const exercise = workout.value.exercises[exerciseIndex]
  if (exercise.reps.length > 1) {
    exercise.reps.pop()
    exercise.weights.pop()
  }
}

const addExercise = () => {
  workout.value.exercises.push({
    name: '',
    equipment: '',
    targetMuscleGroup: '',
    reps: [0],
    weights: [0],
  })
}

const removeExercise = () => {
  workout.value.exercises.pop()
}

const saveWorkout = () => {
  try {
    if (!workout.value.name.trim()) {
      alert('Bitte geben Sie einen Namen für das Workout ein.')
      return
    }

    for (const exercise of workout.value.exercises) {
      if (
        !exercise.name.trim() ||
        !exercise.equipment.trim() ||
        !exercise.targetMuscleGroup.trim()
      ) {
        alert('Bitte füllen Sie alle Felder für jede Übung aus.')
        return
      }
      if (exercise.name === 'custom' && (!exercise.customName || !exercise.customName.trim())) {
        alert('Bitte geben Sie einen benutzerdefinierten Übungsnamen ein.')
        return
      }
      if (
        exercise.equipment === 'custom' &&
        (!exercise.customEquipment || !exercise.customEquipment.trim())
      ) {
        alert('Bitte geben Sie ein benutzerdefiniertes Equipment ein.')
        return
      }
    }

    isEditing.value = false
  } catch (error) {
    console.error('Fehler:', error)
    alert('Fehler beim Speichern des Workouts: ' + error.message)
  }
}

const toggleEditMode = () => {
  if (isEditing.value) {
    workout.value = JSON.parse(JSON.stringify(originalWorkout.value))
  } else {
    originalWorkout.value = JSON.parse(JSON.stringify(workout.value))
  }
  isEditing.value = !isEditing.value
}

const cancelEdit = () => {
  workout.value = JSON.parse(JSON.stringify(originalWorkout.value))
  isEditing.value = false
}

const saveWorkoutWithWeights = async () => {
  try {
    console.log('OneWorkout: Speichere Workout mit Gewichten...')
    
    if (!workout.value.name.trim()) {
      alert('Bitte geben Sie einen Namen für das Workout ein.')
      return
    }

    for (const exercise of workout.value.exercises) {
      if (
        !exercise.name.trim() ||
        !exercise.equipment.trim() ||
        !exercise.targetMuscleGroup.trim()
      ) {
        alert('Bitte füllen Sie alle Felder für jede Übung aus.')
        return
      }

      if (exercise.name === 'custom' && (!exercise.customName || !exercise.customName.trim())) {
        alert('Bitte geben Sie einen benutzerdefinierten Übungsnamen ein.')
        return
      }

      if (
        exercise.equipment === 'custom' &&
        (!exercise.customEquipment || !exercise.customEquipment.trim())
      ) {
        alert('Bitte geben Sie ein benutzerdefiniertes Equipment ein.')
        return
      }

      for (let i = 0; i < exercise.reps.length; i++) {
        const rep = exercise.reps[i]
        const weight = exercise.weights[i]

        if (isNaN(rep) || rep.toString().includes(',')) {
          alert(`Ungültiger Wert für Reps in Übung "${exercise.name}".`)
          return
        }

        if (isNaN(weight) || weight.toString().includes(',')) {
          alert(`Ungültiger Wert für Gewicht in Übung "${exercise.name}".`)
          return
        }
      }
    }

    // Korrigierte Payload-Struktur für WorkoutWithWeights
    const payload = {
      workout: {
        name: workout.value.name,
        show: false, // show gehört zum Workout, nicht zu WorkoutWithWeights
        exercise: workout.value.exercises.map((ex) => ({
          name: ex.customName || ex.name,
          description: 'Keine Beschreibung vorhanden',
          equipment: ex.customEquipment || ex.equipment,
          targetMuscleGroup: ex.targetMuscleGroup,
        })),
      },
      date: workout.value.date || new Date().toISOString().split('T')[0],
      weights: workout.value.exercises.map((ex) => ({
        reps: ex.reps,
        weights: ex.weights,
      })),
    }

    console.log('OneWorkout: Korrigierte Payload:', payload)
    const response = await axios.post('http://localhost:8080/OneWorkout', payload)
    console.log('OneWorkout: Workout erfolgreich gespeichert:', response.data)

    alert('Workout erfolgreich gespeichert')
    loadOptions()
    emit('back')
  } catch (error) {
    console.error('OneWorkout: Fehler beim Speichern des Workouts:', error)
    if (error.response?.status === 401) {
      alert('Authentifizierung fehlgeschlagen. Bitte melden Sie sich erneut an.')
    } else {
      alert('Fehler beim Speichern des Workouts: ' + (error.response?.data || error.message))
    }
  }
}

watch(() => props.workoutId, loadWorkout)
onMounted(() => {
  loadWorkout()
  loadOptions()
})
</script>

<style scoped>
.stats-dashboard {
  max-width: 1200px;
  margin: 0 auto;
  padding: 25px;
  background: none;
  border-radius: 25px;
  color: #ffffff;
  min-height: 100vh;
  box-shadow:
    0 10px 40px rgba(0, 0, 0, 0.1),
    0 4px 20px rgba(0, 0, 0, 0.06);
  position: relative;
  overflow: hidden;
}

.stats-dashboard::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(79, 70, 229, 0.03) 0%, transparent 70%);
  pointer-events: none;
}

.dashboard-header {
  text-align: center;
  margin-bottom: 40px;
}

.dashboard-header h1 {
  font-size: 2.8em;
  margin: 0 0 15px 0;
  font-weight: 800;
  background: linear-gradient(135deg, #4f46e5, #059669);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.02em;
}

.subtitle {
  font-size: 1.3em;
  color: #6b7280;
  margin: 0;
  font-weight: 500;
}

.input,
.select-input,
.custom-input {
  border-radius: 18px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  border: 1px solid #4d4d4d;
  padding: 8px 14px;
  transition:
    box-shadow 0.2s,
    border-color 0.2s;
  font-size: 1em;
  background: #3d3d3d;
  color: #ffffff;
  margin-bottom: 18px;
  max-width: 100%;
}

select option {
  background: #3d3d3d;
  color: #ffffff;
}

select option:disabled {
  color: #999999;
}

.button {
  border: none;
  border-radius: 16px;
  padding: 8px 18px;
  font-size: 1em;
  font-weight: 600;
  cursor: pointer;
  margin: 4px 6px;
  transition:
    background 0.2s,
    transform 0.1s;
  background: #3b82f6; /* Einheitliches Blau statt Gradient */
  color: #fff;
  box-shadow: 0 2px 8px rgba(79, 70, 229, 0.08);
}

.button:hover {
  filter: brightness(1.1);
}

.button:active {
  transform: scale(0.97);
}

.button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.add-button {
  background: #22c55e; /* Einheitliches Grün statt Gradient */
}

.remove-button {
  background: #ef4444; /* Einheitliches Rot statt Gradient */
}

.edit-button {
  background: #f59e0b; /* Einheitliches Orange statt Gradient */
}

.submit-button {
  background: #3b82f6; /* Einheitliches Blau statt Gradient */
}

.back-button {
  background: transparent;
  box-shadow: none;
  padding: 6px 10px;
  margin-right: 10px;
  vertical-align: middle;
}

.workout-list {
  display: flex;
  flex-direction: column;
  gap: 28px;
  margin-top: 24px;
}

.exercise-block {
  background: #2d2d2d;
  border-radius: 18px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  padding: 18px;
}

.exercise-details-row {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 18px;
  margin-bottom: 10px;
}

.exercise-detail {
  flex: 1 1 0;
  min-width: 0;
  font-weight: 600;
  font-size: 1.08em;
  display: flex;
  align-items: center;
  max-width: 100%;
}

.inline-input-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.inline-input-group .input,
.inline-input-group .custom-input,
.inline-input-group .select-input,
.inline-custom-input {
  height: 38px;
  padding-top: 0;
  padding-bottom: 0;
  margin-bottom: 0;
  box-sizing: border-box;
  font-size: 1em;
}

.inline-custom-input {
  width: 120px;
}

.exercise-reps-row {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 12px;
  margin-bottom: 0;
}

.rep-container {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #4d4d4d;
  border-radius: 12px;
  padding: 6px 12px;
  font-size: 1em;
}

.separator {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  vertical-align: middle;
  font-size: 1.1em;
  margin: 0 6px;
  color: #ffffff;
  font-weight: 500;
  line-height: 1;
  height: auto;
}

.rep-input,
.weight-input {
  width: 70px;
  height: 38px;
  padding: 8px 14px;
  font-size: 1em;
  border: 1px solid #d1d5db;
  border-radius: 18px;
  background: #fff;
  color: #000000;
  box-sizing: border-box;
  text-align: center;
  margin-bottom: 0;
  appearance: textfield;
  -moz-appearance: textfield;
  outline: none;
}
.rep-input:focus,
.weight-input:focus {
  outline: none;
  box-shadow: none;
  border-color: #d1d5db;
}
.rep-input::-webkit-outer-spin-button,
.rep-input::-webkit-inner-spin-button,
.weight-input::-webkit-outer-spin-button,
.weight-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.button-container {
  display: flex;
  gap: 6px;
  margin-left: 12px;
  align-items: center;
}

.action-buttons {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 20px;
}

@media (max-width: 768px) {
  .stats-dashboard {
    padding: 20px;
    margin: 0;
    border-radius: 30px;
    width: 100%;
  }

  .exercise-details-row {
    flex-direction: column;
    gap: 8px;
    align-items: center;
  }

  .exercise-detail {
    width: 100%;
    justify-content: center;
    text-align: center;
  }

  .inline-input-group {
    width: 100%;
    flex-direction: column;
    align-items: center;
  }

  .select-input {
    width: 100%;
    text-align: center;
  }

  .inline-custom-input {
    margin-top: 8px;
    margin-bottom: 4px;
    width: 100%;
    text-align: center;
  }

  .exercise-reps-row {
    flex-direction: column;
    align-items: center;
  }

  .rep-container {
    width: calc(100% - 24px);
    justify-content: center;
    text-align: center;
  }

  .rep-input,
  .weight-input {
    width: 70px;
    height: 38px;
    padding: 8px 14px;
    font-size: 1em;
    border: 1px solid #d1d5db;
    border-radius: 18px;
    background: #fff;
    color: #000000;
    box-sizing: border-box;
    text-align: center;
    margin-bottom: 0;
  }

  .button-container {
    width: 100%;
    justify-content: center;
    margin-left: 0;
    margin-top: 8px;
  }

  .action-buttons .button {
    padding: 8px 16px;
    margin: 6px;
  }

  .workout-name-input {
    text-align: center;
  }
}

@media (max-width: 480px) {
  .stats-dashboard {
    border-radius: 30px;
    padding: 15px;
    width: 100%;
    min-height: 100vh;
  }

  h2 {
    font-size: 1.5em;
    text-align: center;
  }

  .workout-name-input {
    width: 100%;
    max-width: 250px;
    margin: 0 auto;
    text-align: center;
  }

  .exercise-block {
    padding: 14px;
    text-align: center;
  }

  .rep-input,
  .weight-input {
    width: 55px;
    height: 38px;
    padding: 8px 14px;
    font-size: 1em;
    border: 1px solid #d1d5db;
    border-radius: 18px;
    background: #fff;
    color: #000000;
    box-sizing: border-box;
    text-align: center;
    margin-bottom: 0;
  }

  .button {
    padding: 8px 12px;
    font-size: 0.9em;
    margin: 5px;
  }

  .back-button {
    display: block;
    margin: 0 auto 10px auto;
  }
}
</style>

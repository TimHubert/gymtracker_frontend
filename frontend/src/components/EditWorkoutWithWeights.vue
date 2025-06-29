<template>
  <div class="stats-dashboard">
    <div v-if="workoutWithWeights?.workout" class="workout-content">
      <h2>
        <button
          v-if="!isEditing"
          @click="$router.push({ name: 'Stats' })"
          class="button back-button"
        >
          <img src="@/assets/back.svg" alt="Zurück" style="width: 15px" />
        </button>
        <template v-if="isEditing">
          <input
            v-model="workoutWithWeights.workout.name"
            placeholder="Workout-Name"
            required
            class="input workout-name-input"
          />
        </template>
        <template v-else>
          {{ workoutWithWeights.workout.name }}
        </template>
      </h2>
      <div class="workout-list">
        <div
          v-for="(exercise, index) in workoutWithWeights.workout.exercise"
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
            <div
              v-for="(rep, repIndex) in workoutWithWeights.weights[index]?.reps || []"
              :key="repIndex"
              class="rep-container"
            >
              <input
                v-if="isEditing"
                v-model="workoutWithWeights.weights[index].reps[repIndex]"
                placeholder="Reps"
                required
                class="input rep-input"
                type="number"
                min="0"
              />
              <span v-else>{{ workoutWithWeights.weights[index].reps[repIndex] }}</span>
              x
              <input
                v-if="isEditing"
                v-model="workoutWithWeights.weights[index].weights[repIndex]"
                placeholder="Weight"
                required
                class="input weight-input"
                type="number"
                min="0"
              />
              <span v-else>{{ workoutWithWeights.weights[index].weights[repIndex] }}</span>
              kg
            </div>
            <div class="button-container">
              <button v-if="isEditing" @click="addRep(index)" class="button add-button">+</button>
              <button
                v-if="isEditing"
                @click="removeRep(index)"
                :disabled="workoutWithWeights.weights[index]?.reps.length <= 1"
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
          <img src="@/assets/back.svg" alt="Zurück" style="width: 15px" />
        </button>
        <button v-if="isEditing" @click="addExercise" class="button add-button">
          Übung hinzufügen
        </button>
        <button v-if="isEditing" @click="removeExercise" class="button remove-button">
          Übung entfernen
        </button>
        <button v-if="isEditing" @click="toggleEditMode" class="button submit-button">
          Änderungen Übernehmen
        </button>
        <button v-else @click="toggleEditMode" class="button edit-button">Bearbeiten</button>
        <button v-if="!isEditing" @click="saveWorkout" class="button submit-button">
          Speichern
        </button>
      </div>
    </div>
    <p v-else>Workout-Daten werden geladen...</p>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import { createApiUrl, API_CONFIG } from '../config/api'

const route = useRoute()
const router = useRouter()

const workoutWithWeights = ref(null)
const isEditing = ref(false)
const exerciseOptions = ref([])
const equipmentOptions = ref([])
const muscleGroups = ['Brust', 'Lat', 'Trizeps', 'Bizeps', 'Schulter', 'Beine']
const originalWorkout = ref(null)

const loadOptions = async () => {
  try {
    const response = await axios.get(createApiUrl(API_CONFIG.WORKOUTS.WITH_WEIGHTS))
    const data = response.data

    // Sicherstellen, dass data ein Array ist
    if (!Array.isArray(data)) {
      console.warn('workoutsWithWeights API returned non-array:', data)
      exerciseOptions.value = []
      equipmentOptions.value = []
      return
    }

    const flattenedWorkouts = data.flatMap((workout) => {
      // Sicherstellen, dass workout und workout.workout existieren
      if (!workout || !workout.workout || !workout.workout.exercise || !Array.isArray(workout.workout.exercise)) {
        console.warn('Invalid workout structure:', workout)
        return []
      }
      
      return workout.workout.exercise.map((exercise) => ({
        exerciseName: exercise.name,
        equipment: exercise.equipment,
      }))
    })

    exerciseOptions.value = [...new Set(flattenedWorkouts.map((item) => item.exerciseName))]
    equipmentOptions.value = [...new Set(flattenedWorkouts.map((item) => item.equipment))]
    
    console.log('Loaded exercise options:', exerciseOptions.value.length)
    console.log('Loaded equipment options:', equipmentOptions.value.length)
  } catch (error) {
    console.error('Fehler beim Laden der Optionen:', error)
    exerciseOptions.value = []
    equipmentOptions.value = []
  }
}

const toggleEditMode = () => {
  if (isEditing.value) {
    if (!workoutWithWeights.value.workout.name.trim()) {
      alert('Bitte geben Sie einen Namen für das Workout ein.')
      return
    }
    for (const [i, exercise] of workoutWithWeights.value.workout.exercise.entries()) {
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
      const repsArr = workoutWithWeights.value.weights[i]?.reps || []
      const weightsArr = workoutWithWeights.value.weights[i]?.weights || []
      for (let j = 0; j < repsArr.length; j++) {
        const rep = repsArr[j]
        const weight = weightsArr[j]
        if (isNaN(rep) || rep.toString().includes(',')) {
          alert(`Ungültiger Wert für Reps in Übung "${exercise.customName || exercise.name}".`)
          return
        }
        if (isNaN(weight) || weight.toString().includes(',')) {
          alert(`Ungültiger Wert für Gewicht in Übung "${exercise.customName || exercise.name}".`)
          return
        }
      }
    }
    originalWorkout.value = JSON.parse(JSON.stringify(workoutWithWeights.value))
  } else {
    originalWorkout.value = JSON.parse(JSON.stringify(workoutWithWeights.value))
  }
  isEditing.value = !isEditing.value
}

const cancelEdit = () => {
  workoutWithWeights.value = JSON.parse(JSON.stringify(originalWorkout.value))
  isEditing.value = false
}

const addRep = (exerciseIndex) => {
  workoutWithWeights.value.weights[exerciseIndex].reps.push(0)
  workoutWithWeights.value.weights[exerciseIndex].weights.push(0)
}

const removeRep = (exerciseIndex) => {
  const reps = workoutWithWeights.value.weights[exerciseIndex].reps
  const weights = workoutWithWeights.value.weights[exerciseIndex].weights
  if (reps.length > 1) {
    reps.pop()
    weights.pop()
  }
}

const addExercise = () => {
  workoutWithWeights.value.workout.exercise.push({
    name: '',
    equipment: '',
    targetMuscleGroup: '',
    customName: '',
    customEquipment: '',
  })
  workoutWithWeights.value.weights.push({
    reps: [0],
    weights: [0],
  })
}

const removeExercise = () => {
  workoutWithWeights.value.workout.exercise.pop()
  workoutWithWeights.value.weights.pop()
}

const saveWorkout = async () => {
  try {
    if (!workoutWithWeights.value.workout.name.trim()) {
      alert('Bitte geben Sie einen Namen für das Workout ein.')
      return
    }

    for (const [i, exercise] of workoutWithWeights.value.workout.exercise.entries()) {
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
      // Reps/Weights validieren
      const repsArr = workoutWithWeights.value.weights[i]?.reps || []
      const weightsArr = workoutWithWeights.value.weights[i]?.weights || []
      for (let j = 0; j < repsArr.length; j++) {
        const rep = repsArr[j]
        const weight = weightsArr[j]
        if (isNaN(rep) || rep.toString().includes(',')) {
          alert(`Ungültiger Wert für Reps in Übung "${exercise.customName || exercise.name}".`)
          return
        }
        if (isNaN(weight) || weight.toString().includes(',')) {
          alert(`Ungültiger Wert für Gewicht in Übung "${exercise.customName || exercise.name}".`)
          return
        }
      }
    }

    const payload = {
      ...workoutWithWeights.value,
      workout: {
        ...workoutWithWeights.value.workout,
        exercise: workoutWithWeights.value.workout.exercise.map((ex) => ({
          name: ex.customName || ex.name,
          equipment: ex.customEquipment || ex.equipment,
          targetMuscleGroup: ex.targetMuscleGroup,
        })),
      },
    }
    
    const response = await axios.put(createApiUrl(`/OneWorkout/${workoutWithWeights.value.id}`), payload)
    alert('Workout erfolgreich gespeichert')
    isEditing.value = false
    // Original aktualisieren
    originalWorkout.value = JSON.parse(JSON.stringify(workoutWithWeights.value))
  } catch (error) {
    console.error('Fehler beim Speichern des Workouts:', error)
    alert('Fehler beim Speichern des Workouts')
  }
}

onMounted(async () => {
  try {
    const response = await axios.get(createApiUrl(API_CONFIG.WORKOUTS.WITH_WEIGHTS_BY_ID(route.params.id)))
    workoutWithWeights.value = response.data
    originalWorkout.value = JSON.parse(JSON.stringify(response.data))
  } catch (error) {
    console.error('Fehler beim Laden des Workouts:', error)
  }

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
  color: var(--color-text);
  min-height: 100vh;
  position: relative;
  overflow: hidden;
}

.stats-dashboard::before {
  display: none;
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
  color: var(--color-text);
  margin: 0;
  font-weight: 500;
}

.input,
.select-input,
.custom-input {
  border-radius: 18px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  border: 1px solid var(--input-border);
  padding: 8px 14px;
  outline: none;
  transition:
    box-shadow 0.2s,
    border-color 0.2s;
  font-size: 1em;
  background: var(--input-bg);
  color: var(--color-text);
  margin-bottom: 10px;
  margin-top: 0px;
  max-width: 100%;
}

/* Neue Styles für Select-Optionen */
select option {
  background: var(--input-bg);
  color: var(--color-text);
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
    background 0.18s,
    color 0.18s,
    box-shadow 0.18s,
    transform 0.1s;
  background: rgb(0, 110, 255);
  color: #fff;
  box-shadow: 0 2px 8px rgba(79, 70, 229, 0.08);
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
  background: rgb(77, 77, 77); /* Einheitliches Orange statt Gradient */
}

.submit-button {
  background: rgb(0, 110, 255); /* Einheitliches Blau statt Gradient */
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
  background: var(--exercise-bg);
  border-radius: 18px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  padding: 18px 18px 12px 18px;
  margin-bottom: 0;
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
  box-sizing: border-box;
  font-size: 1em;
  margin-bottom: 6px;
  margin-top: -2px;
  outline: none;
}

.inline-custom-input {
  width: 180px;
  margin-bottom: 0;
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
  margin-bottom: 0;
  background: var(--input-bg);
  border-radius: 12px;
  padding: 6px 12px;
  font-size: 1em;
}

.rep-input,
.weight-input {
  width: 70px; /* von 60px auf 70px erhöht */
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
    min-width: unset;
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
    max-width: 100%;
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
    text-align: center;
  }

  .button-container {
    width: 100%;
    justify-content: center;
    margin-left: 0;
    margin-top: 8px;
  }

  .action-buttons {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    width: 100%;
  }

  .button {
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
    width: 120%;
    margin-left: -10%;
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
    width: 80px; 
    padding: 6px 10px;
    text-align: center;
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

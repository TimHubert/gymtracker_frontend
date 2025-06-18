<template>
  <div class="workout-list">
    <div class="filter-section">
      <label for="date-filter">Filter nach Datum:</label>
      <input id="date-filter" type="date" v-model="selectedDate" @change="applyFilters" />

      <label for="workout-select">Workout auswählen:</label>
      <select id="workout-select" v-model="selectedWorkout" @change="applyFilters">
        <option value="">Alle Workouts</option>
        <option v-for="name in uniqueWorkoutNames" :key="name" :value="name">
          {{ name }}
        </option>
      </select>
    </div>
    <div v-if="filteredWorkouts.length">
      <div
        v-for="(workout, workoutIndex) in filteredWorkouts"
        :key="workoutIndex"
        class="table"
        style="margin-bottom: 0.1rem"
      >
        <h3>
          {{ workout.workout.name }} am {{ new Date(workout.date).toLocaleDateString('de-DE') }}

          <button
            class="delete-button"
            @click="deleteWorkout(workout.id)"
            style="margin-bottom: 0.2rem"
          >
            <img src="@/assets/delete.svg" alt="Löschen" style="width: 15px" />
          </button>
          <router-link
            :to="{ name: 'EditWorkoutWithWeights', params: { id: workout.id } }"
            class="edit-button"
            style="margin-bottom: 0.2rem"
          >
            <img src="@/assets/edit.svg" alt="Löschen" style="width: 15px" />
          </router-link>
          <button class="duplicate-button" @click="duplicateWorkout(workout.id)">
            <img src="@/assets/duplicate.svg" alt="Löschen" style="width: 15px" />
          </button>
        </h3>
        <table v-if="workout.workout.exercise?.length > 0" class="styled-table">
          <thead>
            <tr>
              <th>Übung</th>
              <th v-for="setIndex in maxSets(workout.weights)" :key="'set-' + setIndex">
                Set {{ setIndex }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(exercise, exIndex) in workout.workout.exercise" :key="exercise.id">
              <td>
                <span>
                  <span class="exercise_name">{{ exercise.name }}</span>
                 
                </span>
              </td>
              <td v-for="setIndex in maxSets(workout.weights)" :key="'data-' + setIndex">
                <template
                  v-if="
                    workout.weights[exIndex]?.reps[setIndex - 1] !== undefined &&
                    workout.weights[exIndex]?.weights[setIndex - 1] !== undefined
                  "
                >
                  {{
                    workout.weights[exIndex].reps[setIndex - 1] +
                    'x' +
                    workout.weights[exIndex].weights[setIndex - 1] +
                    'kg'
                  }}
                </template>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <p v-else class="no-workouts">Keine Workouts gefunden.</p>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '../stores/auth'
import axios from 'axios'
import { createApiUrl, API_CONFIG } from '../config/api'

const authStore = useAuthStore()
const workouts = ref([])
const filteredWorkouts = ref([])
const selectedDate = ref('')
const selectedWorkout = ref('')

// Funktion zum Finden des letzten Workout-Datums
const findLatestWorkoutDate = (workouts) => {
  if (!workouts || workouts.length === 0) return ''
  return workouts.map((w) => w.date).sort((a, b) => new Date(b) - new Date(a))[0]
}

const loadWorkouts = async () => {
  try {
    console.log('AllWorkoutsView: Lade Workouts...')
    if (!authStore.token) {
      console.error('AllWorkoutsView: Kein Token verfügbar')
      return
    }

    const response = await axios.get(createApiUrl(API_CONFIG.WORKOUTS.WITH_WEIGHTS))
    console.log('AllWorkoutsView: Workouts geladen:', response.data)
    workouts.value = response.data

    // Setze das letzte Workout-Datum als Standardwert
    if (!selectedDate.value) {
      selectedDate.value = findLatestWorkoutDate(response.data)
    }
    applyFilters()
  } catch (error) {
    console.error('AllWorkoutsView: Fehler beim Laden der Workouts:', error)
    if (error.response?.status === 401) {
      console.error('AllWorkoutsView: Authentifizierung fehlgeschlagen')
    }
  }
}

const uniqueWorkoutNames = computed(() => {
  if (!workouts.value || !Array.isArray(workouts.value)) return []
  const names = new Set(workouts.value.map((w) => w.workout?.name).filter(Boolean))
  return Array.from(names).sort()
})

// Filter anwenden
const applyFilters = () => {
  if (!workouts.value || !Array.isArray(workouts.value)) {
    filteredWorkouts.value = []
    return
  }

  let filtered = workouts.value

  // Filter nach Datum
  if (selectedDate.value) {
    filtered = filtered.filter(
      (workout) =>
        new Date(workout.date).toLocaleDateString('de-DE') ===
        new Date(selectedDate.value).toLocaleDateString('de-DE'),
    )
  }

  // Filter nach ausgewähltem Workout
  if (selectedWorkout.value) {
    filtered = filtered.filter((workout) => workout.workout?.name === selectedWorkout.value)
  }

  filteredWorkouts.value = filtered
}

// Diese Funktion wird durch applyFilters ersetzt
const filterWorkoutsByDate = () => {
  applyFilters()
}

onMounted(() => {
  // Setze Standardwerte
  selectedWorkout.value = '' // "Alle Workouts" als Standard
  loadWorkouts()
})

// Workout löschen
const deleteWorkout = async (workoutWithWeightsId) => {
  try {
    console.log('AllWorkoutsView: Lösche Workout:', workoutWithWeightsId)

    // Erst WorkoutWithWeights abrufen um Workout ID zu bekommen
    const workoutResponse = await axios.get(
      createApiUrl(API_CONFIG.WORKOUTS.WITH_WEIGHTS_BY_ID(workoutWithWeightsId)),
    )
    const workoutWithWeights = workoutResponse.data
    const workoutId = workoutWithWeights.workout.id

    // WorkoutWithWeights löschen
    await axios.delete(createApiUrl(API_CONFIG.WORKOUTS.WITH_WEIGHTS_BY_ID(workoutWithWeightsId)))
    console.log('AllWorkoutsView: WorkoutWithWeights gelöscht')

    // Workout löschen
    await axios.delete(createApiUrl(API_CONFIG.WORKOUTS.BY_ID(workoutId)))
    console.log('AllWorkoutsView: Workout erfolgreich gelöscht')

    loadWorkouts()
  } catch (error) {
    console.error('AllWorkoutsView: Fehler beim Löschen des Workouts:', error)
    if (error.response?.status === 401) {
      alert('Authentifizierung fehlgeschlagen. Bitte melden Sie sich erneut an.')
    } else if (error.response?.status === 403) {
      alert('Zugriff verweigert. Dieses Workout gehört nicht Ihnen.')
    }
  }
}

// Workout duplizieren
const duplicateWorkout = async (workoutId) => {
  try {
    console.log('AllWorkoutsView: Dupliziere Workout:', workoutId)

    const response = await axios.get(createApiUrl(API_CONFIG.WORKOUTS.WITH_WEIGHTS_BY_ID(workoutId)))
    const workoutData = response.data

    const newWorkout = {
      name: workoutData.workout.name,
      exercise: workoutData.workout.exercise.map((exercise) => ({
        name: exercise.name,
        description: exercise.description || 'Keine Beschreibung vorhanden',
        equipment: exercise.equipment || 'Unbekannt',
        targetMuscleGroup: exercise.targetMuscleGroup || 'Unbekannt',
      })),
      show: false,
    }

    console.log('AllWorkoutsView: Neues Workout:', newWorkout)

    const saveWorkoutResponse = await axios.post(createApiUrl('/workout'), newWorkout)
    const savedWorkout = saveWorkoutResponse.data

    const newWorkoutWithWeights = {
      ...workoutData,
      id: undefined,
      workout: savedWorkout,
      date: new Date().toISOString(),
      weights: workoutData.weights.map((weight) => ({
        reps: [...weight.reps],
        weights: [...weight.weights],
      })),
    }

    await axios.post(createApiUrl(API_CONFIG.WORKOUTS.ONE_WORKOUT), newWorkoutWithWeights)

    console.log('AllWorkoutsView: Workout erfolgreich dupliziert')
    alert('Workout erfolgreich dupliziert')
    loadWorkouts()
  } catch (error) {
    console.error('AllWorkoutsView: Fehler beim Duplizieren des Workouts:', error)
    if (error.response?.status === 401) {
      alert('Authentifizierung fehlgeschlagen. Bitte melden Sie sich erneut an.')
    } else {
      alert('Fehler beim Duplizieren des Workouts')
    }
  }
}

// Maximale Anzahl der Sätze bestimmen
const maxSets = (weights) => {
  return Math.max(...weights.map((weight) => weight.reps.length), 0)
}

const isSetDefined = (weights, setIndex) => {
  return weights.some(
    (weight) => weight.reps[setIndex] !== undefined && weight.weights[setIndex] !== undefined,
  )
}

const flattenedWorkouts = computed(() => {
  if (!workouts.value || !Array.isArray(workouts.value)) return []

  return workouts.value.flatMap((workout) => {
    if (!workout.workout?.exercise || !Array.isArray(workout.workout.exercise)) return []

    return workout.workout.exercise.map((exercise, index) => ({
      workoutWithWeightsId: workout.workoutWithWeights?.id || workout.id,
      workoutId: workout.workout.id,
      workoutName: workout.workout.name,
      exerciseName: exercise.name,
      exId: exercise.id,
      targetMuscleGroup: exercise.targetMuscleGroup,
      equipment: exercise.equipment,
      reps: workout.weights?.[index]?.reps || [],
      weights: workout.weights?.[index]?.weights || [],
    }))
  })
})
</script>

<style scoped>
.workout-list {
  margin-top: 2rem;
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
}

.filter-section {
  margin-bottom: 1rem;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}

.filter-section label {
  margin-right: 0.5rem;
}

.filter-section input,
.filter-section select {
  padding: 0.5rem;
  border-radius: 30px;
  border: none;
  background-color: rgb(0, 110, 255);
  color: white;
}

.filter-section input::placeholder {
  color: rgba(255, 255, 255, 0.7);
}

.table {
  margin-bottom: 1rem;
  padding: 0.9rem 0.5rem 0.01px 0.5rem;
  border-radius: 30px;
  background-color: transparent;
  text-align: center;
  width: 100%;
}

.styled-table {
  width: 100%;
  border-collapse: separate;
  margin-bottom: 1rem;
  overflow: hidden;
  border-radius: 20px;
  table-layout: fixed;
  min-width: 100%;
}

.styled-table th,
.styled-table td {
  padding: 8px;
  text-align: left;
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.styled-table th {
  background-color: var(--table-header-bg);
  color: rgb(0, 110, 255);
  text-align: left;
  position: sticky;
  top: 0;
}

.styled-table tr:nth-child(even) {
  background-color: var(--table-bg-secondary);
}

.styled-table tr:nth-child(odd) {
  background-color: var(--table-bg-primary);
}

.styled-table th:first-child {
  border-top-left-radius: 12px;
}

.styled-table th:last-child {
  border-top-right-radius: 12px;
}

.styled-table th:first-child {
  border-top-left-radius: 20px;
}

.styled-table th:last-child {
  border-top-right-radius: 20px;
}

.styled-table tr:last-child td:last-child {
  border-bottom-right-radius: 20px;
}

.styled-table tr:last-child td:first-child {
  border-bottom-left-radius: 20px;
}

.no-workouts {
  color: var(--color-text);
  opacity: 0.7;
  margin-top: 1rem;
}

.delete-button,
.edit-button,
.duplicate-button {
  border: none;
  padding: 5px 10px;
  cursor: pointer;
  border-radius: 30px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.delete-button {
  background-color: #ff4d4d;
  color: white;
}

.delete-button:hover {
  background-color: #ff1a1a;
}

.edit-button {
  margin-left: 3px;
  background-color: #4d56ff;
  color: white;
  font-size: smaller;
}

.edit-button:hover {
  background-color: rgb(0, 110, 255);
}

.duplicate-button {
  margin-left: 3px;
  background-color: #4d56ff;
  color: white;
  font-size: smaller;
}

.duplicate-button:hover {
  background-color: rgb(0, 110, 255);
}

@media (max-width: 900px) {
  .workout-list {
    padding: 0 10px;
    max-height: 100vh;
    width: 120%;
    overflow-y: auto;
  }

  h3 {
    font-size: 0.95rem;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 0.3rem;
  }

  .filter-section {
    flex-direction: column;
    align-items: flex-start;
    width: 90%;
    margin-left: 5%;
  }

  .filter-section input,
  .filter-section select {
    width: 100%;
  }

  .delete-button,
  .edit-button,
  .duplicate-button {
    padding: 4px 8px;
  }

  .table {
    width: 100%;
    overflow-x: scroll;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: thin;
  }

  .styled-table {
    font-size: 0.85rem;
    width: max-content;
    min-width: 100%;
    display: table;
    table-layout: fixed;
  }

  .styled-table th:first-child,
  .styled-table td:first-child {
    min-width: 140px;
    max-width: 25%;
  }

  .styled-table th:not(:first-child),
  .styled-table td:not(:first-child) {
    width: auto;
  }

  .styled-table th,
  .styled-table td {
    padding: 6px;
    white-space: normal;
    word-wrap: break-word;
    overflow-wrap: break-word;
  }

  .exercise_name {
    font-size: 0.85rem;
    font-weight: medium;
    display: flex;
    white-space: normal;
    word-wrap: break-word;
    overflow-wrap: break-word;
  }
}

@media (max-width: 574px) {
  h3 {
    font-size: 0.7rem;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    gap: 0.3rem;
  }
  .workout-list {
    padding: 0;
    max-width: 120%;
    margin-left: -10%;
    overflow-x: hidden;
  }
  .filter-section {
    flex-direction: column;
    align-items: flex-start;
    width: 90%;
    margin-left: 5%;
  }

  .filter-section input,
  .filter-section select {
    width: 100%;
  }

  .exercise_name {
    font-size: 0.7rem;
    font-weight: medium;
    display: flex;
  }

  .styled-table {
    font-size: 0.8rem;
    width: 100%;
    max-width: 100%;
    overflow-x: auto;
  }

  .styled-table th,
  .styled-table td {
    padding: 4px 2px;
    font-size: 0.75rem;
    white-space: normal;
    word-wrap: break-word;
    overflow-wrap: break-word;
  }
}

@media (max-width: 480px) {
  h3 {
    font-size: 0.7rem;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    gap: 0.3rem;
  }
  .workout-list {
    padding: 0;
    max-width: 120%;
    margin-left: -10%;
    overflow-x: hidden;
  }
  .filter-section {
    flex-direction: column;
    align-items: flex-start;
    width: 90%;
    margin-left: 5%;
  }

  .filter-section input,
  .filter-section select {
    width: 100%;
  }

  .exercise_name {
    font-size: 0.7rem;
    font-weight: medium;
    display: flex;
  }

  .styled-table {
    font-size: 0.8rem;
    table-layout: auto;
  }

  .styled-table th:first-child,
  .styled-table td:first-child {
    min-width: 100px;
  }

  .styled-table th,
  .styled-table td {
    padding: 4px;
    white-space: normal;
    word-wrap: break-word;
    overflow-wrap: break-word;
    hyphens: auto;
  }
}
</style>

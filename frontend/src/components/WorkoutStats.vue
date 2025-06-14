<template>
  <div class="workout-list">
    <h2>Trainingshäufigkeit pro Workout</h2>
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import Chart from 'chart.js/auto'

const workouts = ref([])
const filteredWorkouts = ref([])
const selectedDate = ref('')
const chartCanvas = ref(null)
let chartInstance = null

// Workouts aggregieren
const workoutCounts = computed(() => {
  const counts = {}
  workouts.value.forEach((workout) => {
    const name = workout.workout?.name
    if (name) counts[name] = (counts[name] || 0) + 1
  })
  return counts
})

const loadWorkouts = () => {
  fetch('http://localhost:8080/workoutsWithWeights')
    .then((response) => response.json())
    .then((data) => {
      console.log('Geladene Workouts:', JSON.stringify(data, null, 2))
      workouts.value = data
      filteredWorkouts.value = data
    })
    .catch((error) => console.error('Fehler beim Laden der Workouts:', error))
}

const filterWorkoutsByDate = () => {
  if (selectedDate.value) {
    filteredWorkouts.value = workouts.value.filter(
      (workout) =>
        new Date(workout.date).toLocaleDateString('de-DE') ===
        new Date(selectedDate.value).toLocaleDateString('de-DE'),
    )
  } else {
    filteredWorkouts.value = workouts.value
  }
}

onMounted(() => {
  loadWorkouts()
  watch(workouts, () => createChart(), { immediate: true })
})

const createChart = () => {
  if (chartInstance) {
    chartInstance.destroy()
  }
  if (chartCanvas.value) {
    const ctx = chartCanvas.value.getContext('2d')
    chartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: Object.keys(workoutCounts.value),
        datasets: [
          {
            label: 'Häufigkeit',
            data: Object.values(workoutCounts.value),
            backgroundColor: 'rgba(0, 110, 255, 0.5)',
          },
        ],
      },
    })
  }
}

const deleteWorkout = (workoutWithWeightsId) => {
  console.log('WorkoutWithWeights ID zum Löschen:', workoutWithWeightsId)

  fetch(`http://localhost:8080/workoutWithWeights/${workoutWithWeightsId}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error('Fehler beim Abrufen des WorkoutWithWeights')
      }
      return response.json()
    })
    .then((workoutWithWeights) => {
      const workoutId = workoutWithWeights.workout.id
      console.log('Workout ID:', workoutId)

      return fetch(`http://localhost:8080/workoutWithWeights/${workoutWithWeightsId}`, {
        method: 'DELETE',
      }).then((response) => {
        if (!response.ok) {
          throw new Error('Fehler beim Löschen des WorkoutWithWeights')
        }
        console.log(`WorkoutWithWeights mit ID ${workoutWithWeightsId} gelöscht`)

        return fetch(`http://localhost:8080/workout/${workoutId}`, {
          method: 'DELETE',
        })
      })
    })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Fehler beim Löschen des Workouts')
      }
      console.log('Workout erfolgreich gelöscht')
      loadWorkouts()
    })
    .catch((error) => console.error('Fehler beim Löschen des Workouts:', error))
}

const duplicateWorkout = async (workoutId) => {
  try {
    const response = await fetch(`http://localhost:8080/workoutWithWeights/${workoutId}`)
    if (!response.ok) {
      throw new Error(`Fehler beim Abrufen des Workouts: ${response.status}`)
    }
    const workoutData = await response.json()

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

    console.log('Neues Workout:', newWorkout)

    const saveWorkoutResponse = await fetch('http://localhost:8080/workout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newWorkout),
    })

    if (!saveWorkoutResponse.ok) {
      throw new Error(`Fehler beim Speichern des neuen Workouts: ${saveWorkoutResponse.status}`)
    }

    const savedWorkout = await saveWorkoutResponse.json()

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

    const saveWorkoutWithWeightsResponse = await fetch('http://localhost:8080/OneWorkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newWorkoutWithWeights),
    })

    if (!saveWorkoutWithWeightsResponse.ok) {
      throw new Error(
        `Fehler beim Speichern des neuen WorkoutWithWeights: ${saveWorkoutWithWeightsResponse.status}`,
      )
    }

    alert('Workout und WorkoutWithWeights erfolgreich dupliziert')
    loadWorkouts()
  } catch (error) {
    console.error('Fehler beim Duplizieren des Workouts:', error)
    alert('Fehler beim Duplizieren des Workouts')
  }
}

const maxSets = (weights) => {
  return Math.max(...weights.map((weight) => weight.reps.length), 0)
}

const isSetDefined = (weights, setIndex) => {
  return weights.some(
    (weight) => weight.reps[setIndex] !== undefined && weight.weights[setIndex] !== undefined,
  )
}
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

.filter-section input {
  padding: 0.5rem;
  border-radius: 30px;
  border: none;
  background-color: rgb(0, 110, 255);
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
  color: white;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.styled-table th {
  background-color: #1e1e1e;
  color: rgb(0, 110, 255);
  text-align: left;
  position: sticky;
  top: 0;
}

.styled-table tr:nth-child(even) {
  background-color: #2b2b2b;
}

.styled-table tr:nth-child(odd) {
  background-color: #1e1e1e;
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
  color: #888;
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
    overflow-y: auto;
  }

  h3 {
    font-size: 0.95rem;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.3rem;
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
    white-space: nowrap;
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
  }
}

@media (max-width: 574px) {
  .workout-list {
    margin: 0;
    padding: 0;
  }

  .styled-table {
    font-size: 0.8rem;
    width: 100%;
    max-width: 100%;
    overflow-x: auto;
    white-space: nowrap;
  }

  .styled-table th,
  .styled-table td {
    padding: 4px 2px;
    font-size: 0.75rem;
  }
}

@media (max-width: 480px) {
  .filter-section {
    flex-direction: column;
    align-items: flex-start;
  }

  h3 {
    font-size: 0.9rem;
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
  }
}
</style>

<template>
  <div class="workout-list">
    <h2>Alle Workouts</h2>
    <div class="filter-section">
      <label for="date-filter">Filter nach Datum:</label>
      <input id="date-filter" type="date" v-model="selectedDate" @change="filterWorkoutsByDate" />
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
                  ({{ exercise.targetMuscleGroup }})
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

const workouts = ref([])
const filteredWorkouts = ref([])
const selectedDate = ref('')

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
})

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

const flattenedWorkouts = computed(() => {
  return workouts.value.flatMap((workout) =>
    workout.workout.exercise.map((exercise, index) => ({
      workoutWithWeightsId: workout.workoutWithWeights.id,
      workoutId: workout.workout.id,
      workoutName: workout.workout.name,
      exerciseName: exercise.name,
      exId: exercise.id,
      targetMuscleGroup: exercise.targetMuscleGroup,
      equipment: exercise.equipment,
      reps: workout.weights[index]?.reps || [],
      weights: workout.weights[index]?.weights || [],
    })),
  )
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
  background-color: none;
  text-align: center;
  width: 100%;
}

.styled-table {
  width: 100%;
  border-collapse: separate;
  margin-bottom: 1rem;
  overflow: hidden;
  border-radius: 20px;
}

.styled-table th,
.styled-table td {
  padding: 8px;
  text-align: left;
  color: white;
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

@media (max-width: 768px) {
  .workout-list {
    padding: 0 10px;
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

  .styled-table {
    font-size: 0.85rem;
    min-width: 300px;
    display: block;
    overflow-x: auto;
    white-space: nowrap;
  }

  .styled-table th,
  .styled-table td {
    padding: 6px;
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
  }

  .styled-table th,
  .styled-table td {
    padding: 4px;
  }
}
</style>

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
        {{ workout.workout.name }} am {{ new Date(workout.date).toLocaleDateString('de-DE') }}
        <button
          class="delete-button"
          @click="deleteWorkout(workout.id)"
          style="margin-bottom: 0.2rem"
        >
          Löschen
        </button>
        <router-link
          :to="{ name: 'EditWorkoutWithWeights', params: { id: workout.id } }"
          class="edit-button"
          style="margin-bottom: 0.2rem"
        >
          Bearbeiten
        </router-link>
        <table v-if="workout.workout.exercise?.length > 0" class="styled-table">
          <thead>
            <tr>
              <th>Übung</th>
              <th>Set 1</th>
              <th>Set 2</th>
              <th>Set 3</th>
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
              <td>
                {{
                  workout.weights[exIndex]?.reps[0] +
                    'x' +
                    workout.weights[exIndex]?.weights[0] +
                    'kg' || '-'
                }}
              </td>
              <td>
                {{
                  workout.weights[exIndex]?.reps[1] +
                    'x' +
                    workout.weights[exIndex]?.weights[1] +
                    'kg' || '-'
                }}
              </td>
              <td>
                {{
                  workout.weights[exIndex]?.reps[2] +
                    'x' +
                    workout.weights[exIndex]?.weights[2] +
                    'kg' || '-'
                }}
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

const deleteWorkout = (workoutId) => {
  console.log('Workout ID zum Löschen:', workoutId)
  fetch(`http://localhost:8080/workoutWithWeights/${workoutId}`, {
    method: 'DELETE',
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Fehler beim Löschen des Workouts')
      }
      console.log(`Workout mit ID ${workoutId} gelöscht`)
      loadWorkouts()
    })
    .catch((error) => console.error('Fehler beim Löschen des Workouts:', error))
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
}

.filter-section {
  margin-bottom: 1rem;
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

.styled-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1rem;
  border-collapse: separate;
  overflow: hidden;
  border-radius: 20px;
}

.styled-table th,
.styled-table td {
  padding: 8px;
  text-align: left;
  color: white;
  width: 100%;
}

.styled-table th {
  background-color: #1e1e1e;
  color: rgb(0, 110, 255);
  text-align: center;
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

.delete-button {
  background-color: #ff4d4d;
  color: white;
  border: none;
  padding: 5px 10px;
  cursor: pointer;
  border-radius: 30px;
}

.delete-button:hover {
  background-color: #ff1a1a;
}

.edit-button {
  margin-left: 3px;
  background-color: #4d56ff;
  color: white;
  font-size: smaller;
  border: none;
  padding: 5px 10px;
  cursor: pointer;
  border-radius: 30px;
}

.edit-button:hover {
  background-color: rgb(0, 110, 255);
}

.table {
  margin-bottom: 1rem;
  padding: 0.9rem 0.5rem 0.01px 0.5rem;
  border-radius: 30px;
  background-color: none;
  text-align: center;
}
</style>

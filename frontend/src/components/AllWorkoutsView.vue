<template>
  <div class="workout-list">
    <h2>Alle Workouts</h2>
    <div v-if="workouts.length">
      <div v-for="(workout, workoutIndex) in workouts" :key="workoutIndex" class="workout-table">
        {{ workout.workout.name }} am {{ new Date(workout.date).toLocaleDateString('de-DE') }}
        <button class="delete-button" @click="deleteWorkout(workout.id)">Löschen</button>
        <button>Hallo</button>
        <router-link
          :to="{ name: 'EditWorkoutWithWeights', params: { id: workout.id } }"
          class="edit-button"
          style="border: 1px solid red; color: white; background-color: blue"
        >
          Bearbeiten
        </router-link>
        <table v-if="workout.workout.exercise?.length > 0" class="table">
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

const loadWorkouts = () => {
  fetch('http://localhost:8080/workoutsWithWeights')
    .then((response) => response.json())
    .then((data) => {
      console.log('Geladene Workouts:', JSON.stringify(data, null, 2))
      workouts.value = data
    })
    .catch((error) => console.error('Fehler beim Laden der Workouts:', error))
}

onMounted(() => {
  loadWorkouts()
})

const deleteWorkout = (workoutId) => {
  console.log('Workout ID zum Löschen:', workoutId) // Debugging
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

.styled-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1rem;
  border-collapse: separate;
  overflow: hidden;
}

.styled-table th,
.styled-table td {
  border: 0px solid #ff7b00;
  padding: 8px;
  text-align: left;
  color: white;
  width: 100%;
}

.styled-table th {
  background-color: #1e1e1e;
  color: #ff7b00;
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
  border-radius: 4px;
}

.delete-button:hover {
  background-color: #ff1a1a;
}
</style>

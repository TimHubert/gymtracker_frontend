<template>
  <div>
    <h1 style="font-size: 2rem; color: #ffffff">
      {{ workout.name || 'Lädt...' }}
      <span v-if="workout.date"><strong> - </strong> {{ workout.date }}</span>
    </h1>

    <h2 v-if="workout.exercises && workout.exercises.length"></h2>
    <table v-if="workout.exercises && workout.exercises.length" class="table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Set 1</th>
          <th>Set 2</th>
          <th>Set 3</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(exercise, index) in workout.exercises" :key="exercise.name">
          <td>
            <span>
              <span class="exercise_name">{{ exercise.name }}</span>
              ({{ exercise.targetMuscleGroup }})</span
            ><br />
          </td>
          <td>
            {{
              workout.weights[index]?.reps[index] +
                'x' +
                workout.weights[index]?.weights[index] +
                'kg' || '-'
            }}
          </td>
          <td>
            {{
              workout.weights[index]?.reps[index] +
                'x' +
                workout.weights[index]?.weights[index] +
                'kg' || '-'
            }}
          </td>
          <td>
            {{
              workout.weights[index]?.reps[index] +
                'x' +
                workout.weights[index]?.weights[index] +
                'kg' || '-'
            }}
          </td>
        </tr>
      </tbody>
    </table>

    <div v-else>
      <p>Keine Übungen gefunden.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const workout = ref({
  name: '',
  date: '',
  exercises: [],
  weights: [],
})

onMounted(() => {
  const apiUrl = import.meta.env.VITE_APP_BACKEND_BASE_URL || 'http://localhost:8080'
  //fetch(`${apiUrl}/api/workout`)
  fetch(`${apiUrl}/OneWorkout`)
    .then((response) => response.json())
    .then((data) => {
      const rawDate = new Date(data.date)
      const formattedDate = rawDate.toLocaleDateString('de-DE')

      console.log('Workout-Daten:', data)
      workout.value = {
        name: data.name,
        date: formattedDate,
        exercises: data.exercise,
        weights: data.weights,
      }
    })
    .catch((error) => console.error('Fehler beim Abrufen des Workouts:', error))
})
</script>

<style>
.table {
  width: 100%;
  border-collapse: none;
}
.table th,
.table td {
  padding: 8px;
  text-align: left;
  background-color: #363636;
}
.table th {
  background-color: #1e1e1e;
}

.exercise_name {
  font-weight: thin;
  font-size: 1.2rem;
  color: #ffffff;
}
</style>

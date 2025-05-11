
<template>
  <div class="workout-list">
    <h2>Alle Workouts</h2>
    <div v-if="workouts.length">
      <div v-for="(workout, index) in workouts" :key="index" class="workout-table">
        <table v-if="workout.exercises?.length > 0" class="table">
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
      console.log('Geladene Workouts:', data)
      workouts.value = data.filter((workout) => workout.exercises && workout.exercises.length > 0)
      console.log('Gefilterte Workouts:', workouts.value)
    })
    .catch((error) => console.error('Fehler beim Laden der Workouts:', error))
}

onMounted(() => {
  loadWorkouts()
})

// neue flache Liste für Tabellenanzeige
const flattenedWorkouts = computed(() => {
  return workouts.value.flatMap((workout) =>
    workout.exercise.map((ex) => ({
      workoutId: workout.id,
      workoutName: workout.name,
      exercise: exercise,
      exId: exercise.id,
        targetMuscleGroup: exercise.targetMuscleGroup,
        equipment: exercise.equipment,
        reps: workout.weights.map((weight) => weight.reps),
        weights: workout.weights.map((weight) => weight.weights),
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

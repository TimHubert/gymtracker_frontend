<template>
    <div class="workout-list">
      <h2>Alle Workouts</h2>
      <table v-if="flattenedWorkouts.length" class="styled-table">
        <thead>
          <tr>
            <th>Workout</th>
            <th>Übung</th>
            <th>Gerät</th>
            <th>Muskelgruppe</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in flattenedWorkouts" :key="index">
            <td>{{ item.workoutName }}</td>
            <td>{{ item.exercise.name }}</td>
            <td>{{ item.exercise.equipment }}</td>
            <td>{{ item.exercise.targetMuscleGroup }}</td>
          </tr>
        </tbody>
      </table>
      <p v-else class="no-workouts">Keine Workouts gefunden.</p>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, computed } from 'vue'
  
  const workouts = ref([])
  
  onMounted(() => {
    fetch('http://localhost:8080/workouts')
      .then(response => response.json())
      .then(data => {
        workouts.value = data
      })
      .catch(error => console.error('Fehler beim Laden der Workouts:', error))
  })
  
  // neue flache Liste für Tabellenanzeige
  const flattenedWorkouts = computed(() => {
    return workouts.value.flatMap(workout =>
      workout.exercise.map(ex => ({
        workoutName: workout.name,
        exercise: ex
      }))
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
    margin-top: 1rem;
  }
  
  .styled-table th,
  .styled-table td {
    border: 1px solid #ff7b00;
    padding: 8px;
    text-align: left;
    color: white;
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
  
  .no-workouts {
    color: #888;
    margin-top: 1rem;
  }
  </style>
  
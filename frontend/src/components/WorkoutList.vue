<template>
    <div>
      <h2>Alle Workouts</h2>
      <ul v-if="workouts.length">
        <li v-for="workout in workouts" :key="workout.id">
          <strong>{{ workout.name }}</strong>
          <ul>
            <li v-for="exercise in workout.exercise" :key="exercise.name">
              {{ exercise.name }} – {{ exercise.equipment }} – {{ exercise.targetMuscleGroup }}
            </li>
          </ul>
        </li>
      </ul>
      <p v-else>Keine Workouts gefunden.</p>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  
  const workouts = ref([])
  
  onMounted(() => {
    fetch('http://localhost:8080/workouts')
      .then(response => response.json())
      .then(data => {
        workouts.value = data
      })
      .catch(error => console.error('Fehler beim Laden der Workouts:', error))
  })
  </script>
  
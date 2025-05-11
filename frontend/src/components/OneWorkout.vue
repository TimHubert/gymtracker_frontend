<template>
    <div>
      <button @click="$emit('back')">Zurück</button>
      <div v-if="workout">
        <h2>{{ workout.name }}</h2>
        <ul>
          <li v-for="exercise in workout.exercise" :key="exercise.id">
            {{ exercise.name }}
          </li>
        </ul>
      </div>
      <p v-else>Workout wird geladen...</p>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, watch } from 'vue'
  
  const props = defineProps({
    workoutId: {
      type: Number,
      required: true,
    },
  })
  
  const workout = ref(null)
  
  const loadWorkout = () => {
    fetch(`http://localhost:8080/workout/${props.workoutId}`)
      .then((response) => response.json())
      .then((data) => {
        workout.value = data
      })
      .catch((error) => console.error('Fehler beim Laden des Workouts:', error))
  }
  
  watch(() => props.workoutId, loadWorkout)
  
  onMounted(() => {
    loadWorkout()
  })
  </script>
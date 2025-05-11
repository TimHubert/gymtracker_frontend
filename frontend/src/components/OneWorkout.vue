<template>
    <div>
      <button @click="$emit('back')">Zurück</button>
      <div v-if="workout">
        <h2>{{ workout.name }}</h2>
        <table>
  <tbody>
    <tr v-for="exercise in workout.exercises" :key="exercise.id">
      <td>{{ exercise.name }}</td>
      <td>{{ exercise.equipment }}</td>
      <td>{{ exercise.targetMuscleGroup }}</td>
    </tr>
  </tbody>
</table>
      </div>
      <p v-else>Workout wird geladen...</p>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, watch, computed } from 'vue'
  
  const props = defineProps({
    workoutId: {
      type: Number,
      required: true,
    },

    workout: {
      type: Object,
      default: () => ({
        name: '',
        date: '',
        exercises: [],

      }),
    },
  })
  
  const workout = ref(null)
  
  const loadWorkout = () => {
    fetch(`http://localhost:8080/workout/${props.workoutId}`)
      .then((response) => response.json())
      .then((data) => {
       
        workout.value = {
        name: data.name,
        exercises: data.exercise || [] ,
      }
        
      })
      .catch((error) => console.error('Fehler beim Laden des Workouts:', error))
  }
  
  watch(() => props.workoutId, loadWorkout)
  
  onMounted(() => {
    loadWorkout()

})

  </script>
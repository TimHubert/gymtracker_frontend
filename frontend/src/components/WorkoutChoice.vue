<template>
  <div v-if="workouts.length" class="styled-table">
    <div v-for="(workout, index) in workouts" :key="index" class="row">
      <h3
        style="margin-bottom: 0px; margin-top: 10px; cursor: pointer; color: #fff"
        @click="$emit('workout-selected', workout.id)"
      >
        {{ workout.name }}
        (<span
          v-for="(exercise, exIndex) in workout.exercise"
          :key="exIndex"
          style="font-weight: bold"
        >
          {{ exercise.name }}<span v-if="exIndex < workout.exercise.length - 1">, </span> </span
        >)
      </h3>
    </div>
  </div>
  <p v-else class="no-workouts">Keine Workouts gefunden.</p>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '../stores/auth'
import axios from 'axios'

const authStore = useAuthStore()
const workouts = ref([])

const loadWorkouts = async () => {
  try {
    console.log('WorkoutChoice: Lade Workouts...')
    
    // Warte bis Authentifizierung initialisiert ist
    if (!authStore.isAuthenticated) {
      console.log('WorkoutChoice: Warte auf Authentifizierung...')
      return
    }

    const response = await axios.get('http://localhost:8080/workouts', {
      headers: {
        'Authorization': `Bearer ${authStore.token}`
      }
    })
    console.log('WorkoutChoice: Workouts geladen:', response.data)
    workouts.value = response.data.filter(workout => workout.show === true)
    
    if (workouts.value.length === 0) {
      noWorkoutsMessage.value = "Keine sichtbaren Workouts gefunden."
    }
  } catch (error) {
    console.error('WorkoutChoice: Fehler beim Laden der Workouts:', error)
    if (error.response?.status === 401) {
      console.error('WorkoutChoice: Authentifizierung fehlgeschlagen')
      authStore.logout()
    }
    noWorkoutsMessage.value = "Fehler beim Laden der Workouts."
  }
}

onMounted(() => {
  loadWorkouts()
})

const flattenedWorkouts = computed(() => {
  return workouts.value.flatMap((workout) =>
    workout.exercise.map((ex) => ({
      workoutId: workout.id,
      workoutName: workout.name,
      exercise: exercise,
      exId: exercise.id,
    })),
  )
})

const handleWorkoutClick = (workoutId) => {
  console.log(`Workout mit ID ${workoutId} wurde angeklickt`)
  router.push(`/tracker/${workoutId}`)
}
</script>

<style scoped>
.styled-table {
  width: 100%;
  border-collapse: collapse;
  overflow: hidden;
}

.row:nth-child(even) {
  background-color: #2b2b2b;
  border-radius: 30px;
  margin-top: 0.4rem;
}

.row:nth-child(odd) {
  background-color: #1e1e1e;
  border-radius: 30px;
  margin-top: 0.4rem;
}

.row {
  padding: 0.1rem 0rem 0.6rem 1rem;
  color: white;
}

.no-workouts {
  color: #888;
  margin-top: 1rem;
}
</style>

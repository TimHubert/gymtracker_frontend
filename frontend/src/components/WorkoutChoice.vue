<template>
  <div v-if="workouts.length" class="styled-table">
    <div v-for="(workout, index) in workouts" :key="index" class="row">
      <h3
        style="margin-bottom: 0px; margin-top: 10px; cursor: pointer"
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
import { createApiUrl, API_CONFIG } from '../config/api'

const authStore = useAuthStore()
const workouts = ref([])
const noWorkoutsMessage = ref('')

const loadWorkouts = async () => {
  try {
    console.log('WorkoutChoice: Lade Workouts...')

    // Warte bis Authentifizierung initialisiert ist
    if (!authStore.isAuthenticated) {
      console.log('WorkoutChoice: Warte auf Authentifizierung...')
      return
    }

    const response = await axios.get(createApiUrl(API_CONFIG.WORKOUTS.ALL), {
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    })
    console.log('WorkoutChoice: Workouts geladen:', response.data)
    workouts.value = response.data.filter((workout) => workout.show === true)

    if (workouts.value.length === 0) {
      noWorkoutsMessage.value = 'Keine sichtbaren Workouts gefunden.'
    }
  } catch (error) {
    console.error('WorkoutChoice: Fehler beim Laden der Workouts:', error)
    if (error.response?.status === 401) {
      console.error('WorkoutChoice: Authentifizierung fehlgeschlagen')
      authStore.logout()
    }
    noWorkoutsMessage.value = 'Fehler beim Laden der Workouts.'
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
      exercise: ex,
      exId: ex.id,
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
  background-color: var(--table-bg-secondary);
  border-radius: 20px;
  margin-top: 0.4rem;
}

.row:nth-child(odd) {
  background-color: var(--table-bg-primary);
  border-radius: 20px;
  margin-top: 0.4rem;
}

.row {
  padding: 0.1rem 1rem 1rem;
  color: var(--workout-choice-text);
  transition: all 0.3s ease;
}

.row:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  opacity: 0.9;
}

.row h3 {
  color: var(--workout-choice-text);
  margin: 0;
}

.no-workouts {
  color: var(--color-text);
  opacity: 0.7;
  margin-top: 1rem;
}
</style>

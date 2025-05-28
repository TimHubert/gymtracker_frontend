<template>
  <div class="edit-workout">
    <h2>Workout bearbeiten: {{ workoutWithWeights.name }}</h2>

    <button type="submit" class="save-button">Speichern</button>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const workoutWithWeights = ref({ id: route.params.id, ...route.params.workoutWithWeights })

const updateWorkout = async () => {
  try {
    const response = await fetch(`http://localhost:8080/workout/${workoutWithWeights.value.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(workoutWithWeights.value),
    })
    if (response.ok) {
      console.log('Workout erfolgreich aktualisiert')
      router.push('/')
    } else {
      console.error('Fehler beim Aktualisieren des Workouts:', await response.text())
    }
  } catch (error) {
    console.error('Fehler beim Aktualisieren des Workouts:', error)
  }
}

onMounted(() => {
  const apiUrl = import.meta.env.VITE_APP_BACKEND_BASE_URL
  fetch(`${apiUrl}/workoutWithWeights/${workoutWithWeights.value.id}`)
    .then((response) => response.json())
    .then((data) => {
      workoutWithWeights.value = data
      console.log('Workout-Daten geladen:', workoutWithWeights.value)
    })
    .catch((error) => console.error('Fehler beim Laden des Workouts:', error))
})
</script>

<style scoped>
.edit-workout {
  margin-top: 2rem;
}

form div {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
}

input {
  width: 100%;
  padding: 0.5rem;
  margin-bottom: 1rem;
}

.save-button {
  background-color: #4caf50;
  color: white;
  border: none;
  padding: 10px 20px;
  cursor: pointer;
  border-radius: 4px;
}

.save-button:hover {
  background-color: #45a049;
}
</style>

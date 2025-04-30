<template>
  <div>
    <h1>Neues Workout</h1>
    <input placeholder="Name des Workouts" required />

    <div v-if="zeigeÜbungen">
      <div v-for="(übung, index) in übungen" :key="index" class="exercise">
        <input v-model="übung.name" placeholder="Übung" required />
        <input v-model="übung.gerät" placeholder="Gerät" required />
        <input v-model="übung.muskelgruppe" placeholder="Muskelgruppe" required />
        <button @click="removeÜbung(index)" type="button">-</button>
      </div>
    </div>

    <button @click="toggleÜbungen" type="button">+</button>
    <button @click="submitWorkout" type="submit">Erstellen</button>
  </div>
</template>

<script>
export default {
  name: 'NewWorkout',
  data() {
    return {
      zeigeÜbungen: false,
      übungen: [
        {
          name: '',
          gerät: '',
          muskelgruppe: '',
        },
      ],
    }
  },

  methods: {
    toggleÜbungen() {
      if (!this.zeigeÜbungen) {
        this.zeigeÜbungen = true
      } else {
        this.addÜbung()
      }
    },
    addÜbung() {
      this.übungen.push({ name: '', gerät: '', muskelgruppe: '' })
    },
    removeÜbung(index) {
      this.übungen.splice(index, 1)
    },
    async submitWorkout() {
      try {
        const response = await fetch('http://localhost:8080/workout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(this.workout),
        })

        if (!response.ok) {
          throw new Error('Fehler beim Erstellen des Workouts')
        }

        const result = await response.json()
        console.log('Workout erfolgreich erstellt:', result)
        alert('Workout erfolgreich erstellt!')
      } catch (error) {
        console.error('Fehler:', error)
        alert('Fehler beim Erstellen des Workouts')
      }
    },
  },
}
</script>

<script setup>
import { ref, onMounted } from 'vue'

const workout = ref({
  name: '',
  date: '',
  exercises: [],
  weights: [],
})

onMounted(() => {
  const apiUrl = import.meta.env.VITE_APP_BACKEND_BASE_URL
  //fetch(`${apiUrl}/api/workout`)
  fetch(`http://localhost:8080/workout`)
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

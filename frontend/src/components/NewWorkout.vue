<template>
  <div>
    <h1>Neues Workout</h1>
    <input class="input-line" placeholder="Name des Workouts" required />

    <div v-if="zeigeÜbungen">
      <div v-for="(übung, index) in übungen" :key="index" class="exercise">
        <input v-model="übung.name" placeholder="Übung" required />
        <input v-model="übung.gerät" placeholder="Gerät" required />
        <select v-model="übung.muskelgruppe" id="muskelgruppe">
          <option disabled value="">Muskelgruppe</option>
          <option v-for="gruppe in übung.muskelgruppen" :key="gruppe" :value="gruppe">
            {{ gruppe }}
          </option>
        </select>
        <button @click="removeÜbung(index)" type="button">-</button>
      </div>
    </div>

    <button @click="toggleÜbungen" type="button" class="add">+</button>
    <button @click="submitWorkout" type="submit" class="submit">Erstellen</button>
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
          muskelgruppen: ['Brust', 'Lat', 'Trizeps', 'Bizeps', 'Schulter', 'Beine'],
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
      this.übungen.push({
        name: '',
        gerät: '',
        muskelgruppe: '',
        muskelgruppen: ['Brust', 'Lat', 'Trizeps', 'Bizeps', 'Schulter', 'Beine'],
      })
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
.exercise {
  margin-top: 0.3rem;
}
.exercise input,
.exercise select {
  margin-right: 0.5rem;
  margin-top: 0.2rem;
  padding: 0.5rem;
  border-radius: 5px;
  border: 0px solid #ff7b00;
  background-color: #474747;
  color: white;
  outline: none;
}
.exercise button {
  margin-top: 0.2rem;
  background-color: #ff4d4d;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  outline: none;
}
.exercise button:hover {
  background-color: #ff1a1a;
}

.add {
  background-color: #4caf50;
  margin-top: 0.4rem;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  outline: none;
}
.add:hover {
  background-color: #45a049;
}

.submit {
  background-color: #ed6b00;
  margin-top: 0.4rem;
  margin-left: 0.5rem;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  outline: none;
}
.submit:hover {
  background-color: #da720b;
}

.input-line {
  padding: 0.5rem 0;
  border: none;
  border-bottom: 2px solid #ccc;
  background-color: transparent;
  color: white;
  outline: none;
  width: 100%;
  font-size: large;
}

.input-line:focus {
  border-bottom: 2px solid #ff7b00;
}

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

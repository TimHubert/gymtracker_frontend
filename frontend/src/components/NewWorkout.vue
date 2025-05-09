<template>
  <div>
    <h1>Neues Workout</h1>
    <input class="input-line" placeholder="Name des Workouts" required v-model="workout.name" />

    <div class="column" v-if="zeigeÜbungen">
      <div v-for="(übung, index) in übungen" :key="index" class="exercise">
        <div style="display: flex; align-items: center; width: 100%">
          Neue Übung?
          <input
            @click="übung.newName = !übung.newName"
            type="checkbox"
            v-model="übung.newName"
            style="margin-left: 0.3rem"
          />
          <div v-if="übung.newName" style="flex: 1; margin-left: 0.5rem">
            <input v-model="übung.name" placeholder="Übung" required style="width: 100%" />
          </div>
          <div v-else style="flex: 1; margin-left: 0.5rem">
            <select v-model="übung.name" id="übungname" style="width: 100%">
              <option disabled value="">Name</option>
              <option v-for="exercise in uniqueExerciseNames" :key="exercise" :value="exercise">
                {{ exercise }}
              </option>
            </select>
          </div>
        </div>
        <div style="display: flex; align-items: center; width: 100%">
          Neues Equipment?
          <input
            @click="übung.newEquipment = !übung.newEquipment"
            type="checkbox"
            style="margin-left: 0.3rem"
            v-model="übung.newEquipment"
          />
          <div v-if="übung.newEquipment" style="flex: 1; margin-left: 0.5rem">
            <input v-model="übung.gerät" placeholder="Gerät" required style="width: 100%" />
          </div>
          <div v-else style="flex: 1; margin-left: 0.5rem">
            <select v-model="übung.gerät" id="übungequipment" style="width: 100%">
              <option disabled value="">Gerät</option>
              <option v-for="exercise in uniqueEquipmentNames" :key="exercise" :value="exercise">
                {{ exercise }}
              </option>
            </select>
          </div>
        </div>
        <div style="display: flex; align-items: center">
          <select v-model="übung.muskelgruppe" id="muskelgruppe">
            <option disabled value="">Muskelgruppe</option>
            <option v-for="gruppe in übung.muskelgruppen" :key="gruppe" :value="gruppe">
              {{ gruppe }}
            </option>
          </select>
          <button @click="removeÜbung(index)" type="button">-</button>
        </div>
      </div>
    </div>

    <button @click="toggleÜbungen" type="button" class="add">+</button>
    <button @click="submitWorkout" type="submit" class="submit">Erstellen</button>
  </div>
</template>

<script setup>
import { ref, vModelCheckbox, onMounted, computed } from 'vue'

onMounted(() => {
  fetchWorkouts()
})

function fetchWorkouts() {
  fetch('http://localhost:8080/workouts')
    .then((response) => response.json())
    .then((data) => {
      console.log('Geladene Workouts:', data)
      const exercises = data.flatMap((workout) => workout.exercise)
      workouts.value = exercises
    })
    .catch((error) => console.error('Fehler beim Laden der Workouts:', error))
}

const zeigeÜbungen = ref(false)
const übungen = ref([
  {
    name: '',
    gerät: '',
    newName: false,
    muskelgruppe: '',
    muskelgruppen: ['Brust', 'Lat', 'Trizeps', 'Bizeps', 'Schulter', 'Beine'],
  },
])

const workout = ref({
  name: '',
  exercises: [],
  namen: [],
})

const workouts = ref([])

const uniqueExerciseNames = computed(() => {
  return [...new Set(workouts.value.map((exercise) => exercise.name))]
})

const uniqueEquipmentNames = computed(() => {
  return [...new Set(workouts.value.map((exercise) => exercise.equipment))]
})

function toggleÜbungen() {
  if (!zeigeÜbungen.value) {
    zeigeÜbungen.value = true
  } else {
    addÜbung()
  }
}

function addÜbung() {
  übungen.value.push({
    name: '',
    gerät: '',
    muskelgruppe: '',
    muskelgruppen: ['Brust', 'Lat', 'Trizeps', 'Bizeps', 'Schulter', 'Beine'],
  })
}

function removeÜbung(index) {
  übungen.value.splice(index, 1)
}

async function submitWorkout() {
  try {
    if (!workout.value.name.trim()) {
      alert('Bitte geben Sie einen Namen für das Workout ein.')
      return
    }

    if (übungen.value.length === 0) {
      alert('Ein Workout muss mindestens eine Übung enthalten.')
      return
    }

    for (const übung of übungen.value) {
      if (!übung.name.trim() || !übung.gerät.trim() || !übung.muskelgruppe.trim()) {
        alert('Bitte füllen Sie alle Felder für die Übungen aus.')
        return
      }
    }

    workout.value.exercises = übungen.value
    const payload = {
      name: workout.value.name,
      exercise: workout.value.exercises.map((exercise) => ({
        name: exercise.name,
        equipment: exercise.gerät,
        targetMuscleGroup: exercise.muskelgruppe,
      })),
    }

    console.log('Gesendete Daten:', JSON.stringify(payload))

    const response = await fetch('http://localhost:8080/workout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      throw new Error('Fehler beim Erstellen des Workouts')
    }

    const result = await response.json()
    console.log('Workout erfolgreich erstellt:', result)
    alert('Workout erfolgreich erstellt')
    window.location.reload()
  } catch (error) {
    console.error('Fehler:', error)
    alert('Fehler beim Erstellen des Workouts')
  }
}
</script>

<style>
.column {
  display: flex;
  flex-direction: column;
  margin-top: 1rem;
}
.exercise {
  margin-top: 0.3rem;
}
.exercise input,
.exercise select {
  width: 100%;
  margin-right: 0.5rem;
  margin-top: 0.2rem;
  padding: 0.5rem;
  border-radius: 5px;
  border: 0px solid #ff7b00;
  background-color: #474747;
  color: white;
  outline: none;
}
.exercise input[type='checkbox'] {
  width: auto;
  margin-right: 0.5rem;
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

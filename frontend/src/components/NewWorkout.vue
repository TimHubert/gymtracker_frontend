<template>
  <div>
    <h1>Neues Workout</h1>
    <input class="input-line" placeholder="Name des Workouts" required v-model="workout.name" />

    <div class="column" v-if="zeigeÜbungen">
      <div v-for="(übung, index) in übungen" :key="index" class="exercise">
        <div style="display: flex; align-items: center; width: 100%">
          Name
          <div style="flex: 1; margin-left: 0.5rem">
            <select v-model="übung.name" id="übungname" style="width: 100%">
              <option value="custom">Benutzerdefiniert</option>
              <option disabled value="">Übung auswählen</option>
              <option v-for="exercise in uniqueExerciseNames" :key="exercise" :value="exercise">
                {{ exercise }}
              </option>
            </select>
            <input
              v-if="übung.name === 'custom'"
              v-model="übung.customName"
              placeholder="Benutzerdefinierter Übungsname"
              required
              style="width: 100%; margin-top: 0.5rem"
            />
          </div>
        </div>
        <div style="display: flex; align-items: center; width: 100%">
          Equipment
          <div style="flex: 1; margin-left: 0.5rem">
            <select v-model="übung.gerät" id="übungequipment" style="width: 100%">
              <option value="custom">Benutzerdefiniert</option>
              <option disabled value="">Equipment auswählen</option>
              <option v-for="exercise in uniqueEquipmentNames" :key="exercise" :value="exercise">
                {{ exercise }}
              </option>
            </select>
            <input
              v-if="übung.gerät === 'custom'"
              v-model="übung.customEquipment"
              placeholder="Benutzerdefiniertes Equipment"
              required
              style="width: 100%; margin-top: 0.5rem"
            />
          </div>
        </div>
        <div style="display: flex; align-items: center">
          Muskelgruppe
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
    customName: '',
    gerät: '',
    customEquipment: '',
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
    customName: '',
    gerät: '',
    customEquipment: '',
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
      const finalName = übung.name === 'custom' ? übung.customName : übung.name
      const finalEquipment = übung.gerät === 'custom' ? übung.customEquipment : übung.gerät

      if (!finalName.trim() || !finalEquipment.trim() || !übung.muskelgruppe.trim()) {
        alert('Bitte füllen Sie alle Felder für die Übungen aus.')
        return
      }
    }

    workout.value.exercises = übungen.value.map((übung) => ({
      name: übung.name === 'custom' ? übung.customName : übung.name,
      equipment: übung.gerät === 'custom' ? übung.customEquipment : übung.gerät,
      targetMuscleGroup: übung.muskelgruppe,
    }))

    const payload = {
      name: workout.value.name,
      exercise: workout.value.exercises,
      show: true,
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
  margin-left: 0.5rem;
  margin-top: 0.2rem;
  margin-bottom: 0.5rem;
  padding: 0.5rem;
  border-radius: 10px;
  border: 0px solid rgba(0, 132, 255, 0.745);
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
  padding: 0.6rem 0.95rem;
  border-radius: 30px;
  cursor: pointer;
  outline: none;
}
.exercise button:hover {
  background-color: #ff1a1a;
}

.add {
  background-color: rgb(0, 110, 255);
  margin-top: 0.4rem;
  color: white;
  border: none;
  padding: 0.6rem 0.85rem;
  border-radius: 30px;
  cursor: pointer;
  outline: none;
}
.add:hover {
  background-color: rgb(0, 65, 150);
}

.submit {
  background-color: rgb(0, 110, 255);
  margin-top: 0.4rem;
  margin-left: 0.5rem;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 30px;
  cursor: pointer;
  outline: none;
}
.submit:hover {
  background-color: rgb(0, 84, 194);
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
  border-bottom: 2px solid rgb(0, 110, 255);
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

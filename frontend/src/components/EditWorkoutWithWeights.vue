<template>
  <div class="edit-workout" v-if="workoutWithWeights?.workout">
    <div v-if="!isEditing">
      <router-link :to="{ name: 'Stats' }" class="edit-button"> Zurück </router-link>
    </div>
    <h2>
      Workout bearbeiten:
      <template v-if="isEditing">
        <input
          v-model="workoutWithWeights.workout.name"
          placeholder="Workout-Name"
          required
          style="width: 100%; font-size: 1.5rem; margin-bottom: 1rem"
        />
      </template>
      <template v-else>
        {{ workoutWithWeights.workout.name }}
      </template>
    </h2>
    <table>
      <tbody>
        <tr v-for="(exercise, index) in workoutWithWeights.workout.exercise" :key="exercise.id">
          <td>
            <template v-if="isEditing">
              <select v-model="exercise.name" style="width: 100%">
                <option value="custom">Benutzerdefiniert</option>
                <option disabled value="">Übungsname auswählen</option>
                <option v-for="option in exerciseOptions" :key="option" :value="option">
                  {{ option }}
                </option>
              </select>
              <input
                v-if="exercise.name === 'custom'"
                v-model="exercise.customName"
                placeholder="Übungsname"
                required
                style="width: 100%"
              />
            </template>
            <template v-else>
              {{ exercise.customName || exercise.name }}
            </template>
          </td>
          <td>
            <template v-if="isEditing">
              <select v-model="exercise.equipment" style="width: 100%">
                <option value="custom">Benutzerdefiniert</option>
                <option disabled value="">Equipment auswählen</option>
                <option
                  v-for="option in equipmentOptions.filter((opt) => opt !== 'custom')"
                  :key="option"
                  :value="option"
                >
                  {{ option }}
                </option>
              </select>
              <input
                v-if="exercise.equipment === 'custom'"
                v-model="exercise.customEquipment"
                placeholder="Equipment"
                required
                style="width: 100%"
              />
            </template>
            <template v-else>
              {{ exercise.customEquipment || exercise.equipment }}
            </template>
          </td>
          <td>
            <template v-if="isEditing">
              <select v-model="exercise.targetMuscleGroup" style="width: 100%">
                <option disabled value="">Muskelgruppe auswählen</option>
                <option v-for="group in muscleGroups" :key="group" :value="group">
                  {{ group }}
                </option>
              </select>
            </template>
            <template v-else>
              {{ exercise.targetMuscleGroup }}
            </template>
          </td>
          <td>
            <div
              v-for="(rep, repIndex) in workoutWithWeights.weights[index]?.reps || []"
              :key="repIndex"
              style="display: flex; gap: 10px; align-items: center"
            >
              <input
                v-model="workoutWithWeights.weights[index].reps[repIndex]"
                placeholder="Reps"
                required
                style="width: 100%"
              />
              <input
                v-model="workoutWithWeights.weights[index].weights[repIndex]"
                placeholder="Weight"
                required
                style="width: 100%"
              />
            </div>
            <button v-if="isEditing" @click="addRep(index)">+</button>
            <button
              v-if="isEditing"
              @click="removeRep(index)"
              :disabled="workoutWithWeights.weights[index]?.reps.length <= 1"
            >
              -
            </button>
          </td>
        </tr>
      </tbody>
    </table>
    <button v-if="isEditing" @click="toggleEditMode" class="save-button">Zurück</button>
    <button v-else @click="toggleEditMode" class="save-button">Bearbeiten</button>

    <button @click="saveWorkout" class="save-button">Speichern</button>
  </div>
  <p v-else>Workout-Daten werden geladen...</p>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const workoutWithWeights = ref(null)
const isEditing = ref(false)
const exerciseOptions = ref([])
const equipmentOptions = ref([])
const muscleGroups = ['Brust', 'Lat', 'Trizeps', 'Bizeps', 'Schulter', 'Beine'] // Muskelgruppen hinzugefügt

const loadOptions = async () => {
  try {
    const response = await fetch('http://localhost:8080/workoutsWithWeights')
    const data = await response.json()

    const flattenedWorkouts = data.flatMap((workout) =>
      workout.workout.exercise.map((exercise) => ({
        exerciseName: exercise.name,
        equipment: exercise.equipment,
      })),
    )

    exerciseOptions.value = [...new Set(flattenedWorkouts.map((item) => item.exerciseName))]
    equipmentOptions.value = [...new Set(flattenedWorkouts.map((item) => item.equipment))]
  } catch (error) {
    console.error('Fehler beim Laden der Optionen:', error)
  }
}

const toggleEditMode = () => {
  isEditing.value = !isEditing.value
}

const addRep = (exerciseIndex) => {
  workoutWithWeights.value.weights[exerciseIndex].reps.push(0)
  workoutWithWeights.value.weights[exerciseIndex].weights.push(0)
}

const removeRep = (exerciseIndex) => {
  const reps = workoutWithWeights.value.weights[exerciseIndex].reps
  const weights = workoutWithWeights.value.weights[exerciseIndex].weights
  if (reps.length > 1) {
    reps.pop()
    weights.pop()
  }
}

const saveWorkout = async () => {
  try {
    const apiUrl = import.meta.env.VITE_APP_BACKEND_BASE_URL
    const payload = {
      ...workoutWithWeights.value,
      workout: {
        ...workoutWithWeights.value.workout,
        exercise: workoutWithWeights.value.workout.exercise.map((ex) => ({
          name: ex.customName || ex.name,
          equipment: ex.customEquipment || ex.equipment,
          targetMuscleGroup: ex.targetMuscleGroup,
        })),
      },
    }
    const response = await fetch(`${apiUrl}/OneWorkout/${workoutWithWeights.value.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
    if (response.ok) {
      alert('Workout erfolgreich gespeichert')
      toggleEditMode()
    } else {
      console.error('Fehler beim Speichern des Workouts:', await response.text())
    }
  } catch (error) {
    console.error('Fehler beim Speichern des Workouts:', error)
  }
}

onMounted(() => {
  const apiUrl = import.meta.env.VITE_APP_BACKEND_BASE_URL
  fetch(`${apiUrl}/workoutWithWeights/${route.params.id}`)
    .then((response) => response.json())
    .then((data) => {
      workoutWithWeights.value = data
    })
    .catch((error) => console.error('Fehler beim Laden des Workouts:', error))

  loadOptions()
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

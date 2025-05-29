<template>
  <div class="workout-container">
    <div v-if="workoutWithWeights?.workout" class="workout-content">
      <h2>
        <button
          v-if="!isEditing"
          @click="$router.push({ name: 'Stats' })"
          class="button back-button"
        >
          <img src="@/assets/back.svg" alt="Zurück" style="width: 15px" />
        </button>
        <template v-if="isEditing">
          <input
            v-model="workoutWithWeights.workout.name"
            placeholder="Workout-Name"
            required
            class="input workout-name-input"
          />
        </template>
        <template v-else>
          {{ workoutWithWeights.workout.name }}
        </template>
      </h2>
      <table class="workout-table">
        <tbody>
          <tr v-for="(exercise, index) in workoutWithWeights.workout.exercise" :key="exercise.id">
            <td>
              <div>
                <template v-if="isEditing">
                  <select v-model="exercise.name" class="input select-input">
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
                    class="input custom-input"
                  />
                </template>
                <template v-else>
                  {{ exercise.customName || exercise.name }}
                </template>
              </div>
              <div>
                <template v-if="isEditing">
                  <select v-model="exercise.equipment" class="input select-input">
                    <option disabled value="">Equipment auswählen</option>
                    <option value="custom">Benutzerdefiniert</option>
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
                    class="input custom-input"
                  />
                </template>
                <template v-else>
                  {{ exercise.customEquipment || exercise.equipment }}
                </template>
              </div>
              <div>
                <template v-if="isEditing">
                  <select v-model="exercise.targetMuscleGroup" class="input select-input">
                    <option disabled value="">Muskelgruppe</option>
                    <option v-for="group in muscleGroups" :key="group" :value="group">
                      {{ group }}
                    </option>
                  </select>
                </template>
                <template v-else>
                  {{ exercise.targetMuscleGroup }}
                </template>
              </div>
            </td>
            <td>
              <div
                v-for="(rep, repIndex) in workoutWithWeights.weights[index]?.reps || []"
                :key="repIndex"
                class="rep-container"
              >
                <input
                  v-model="workoutWithWeights.weights[index].reps[repIndex]"
                  placeholder="Reps"
                  required
                  class="input"
                />
                x
                <input
                  v-model="workoutWithWeights.weights[index].weights[repIndex]"
                  placeholder="Weight"
                  required
                  class="input"
                />
                kg
              </div>
              <div class="button-container">
                <button v-if="isEditing" @click="addRep(index)" class="button add-button">+</button>
                <button
                  v-if="isEditing"
                  @click="removeRep(index)"
                  :disabled="workoutWithWeights.weights[index]?.reps.length <= 1"
                  class="button remove-button"
                >
                  -
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <div class="action-buttons">
        <button v-if="isEditing" @click="toggleEditMode" class="button">
          <img src="@/assets/back.svg" alt="Zurück" style="width: 15px" />
        </button>
        <button v-if="isEditing" @click="addExercise" class="button add-button">
          Übung hinzufügen
        </button>
        <button v-if="isEditing" @click="removeExercise" class="button remove-button">
          Übung entfernen
        </button>
        <button v-if="isEditing" @click="saveWorkout" class="button submit-button">
          Änderungen Übernehmen
        </button>
        <button v-else @click="toggleEditMode" class="button edit-button">Bearbeiten</button>
      </div>
    </div>
    <p v-else>Workout-Daten werden geladen...</p>
  </div>
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
const muscleGroups = ['Brust', 'Lat', 'Trizeps', 'Bizeps', 'Schulter', 'Beine']

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

const addExercise = () => {
  workoutWithWeights.value.workout.exercise.push({
    name: '',
    equipment: '',
    targetMuscleGroup: '',
    customName: '',
    customEquipment: '',
  })
  workoutWithWeights.value.weights.push({
    reps: [0],
    weights: [0],
  })
}

const removeExercise = () => {
  workoutWithWeights.value.workout.exercise.pop()
  workoutWithWeights.value.weights.pop()
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
.workout-container {
  padding: 2rem;
  background-color: rgb(26, 26, 26);
  border: 1px solid rgb(0, 110, 255);
  color: rgb(0, 110, 255);
  border-radius: 30px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.workout-content {
  margin-top: 1rem;
}

.workout-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}

.workout-table td {
  padding: 0.5rem;
  border: none;
}

.input {
  width: 50px;
  text-align: center;
  padding: 0.5rem;
  border: 0px solid #000000;
  background-color: #111111;
  color: white;
  border-radius: 30px;
  margin-bottom: 3px;
  outline: none;
}

.select-input {
  background-color: #151515;
  width: 100%;
  color: rgb(255, 255, 255);
  text-align: left;
  margin-bottom: 3px;
}

.workout-name-input {
  font-size: 1.5rem;
  width: 100%;
}

.custom-input {
  width: 100%;
  text-align: left;
  padding: 0.5rem;
  border: 0px solid #000000;
  background-color: #ffffff;
  color: black;
  border-radius: 30px;
  margin-bottom: 3px;
}

.rep-container {
  display: flex;
  gap: 10px;
  align-items: center;
}

.button-container {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.add-button {
  background-color: #28a745;
  border-radius: 30px;
}

.add-button:hover {
  background-color: #218838;
}

.remove-button {
  background-color: #dc3545;
  border-radius: 30px;
}

.remove-button:hover {
  background-color: #c82333;
}

.button {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 30px;
  cursor: pointer;
  outline: none;
}

.button:hover {
  background-color: #0056b3;
}

.submit-button {
  background-color: #17a2b8;
}

.submit-button:hover {
  background-color: #138496;
}

.edit-button {
  background-color: white;
  color: rgb(0, 110, 255);
  border-radius: 30px;
}

.edit-button:hover {
  background-color: rgb(200, 200, 200);
  color: rgb(0, 110, 255);
}

.back-button {
  border-radius: 30px;
  background-color: rgb(0, 110, 255);
  margin-bottom: 1rem;
  margin-right: 1rem;
  padding: 4px 5px;
  display: flex;
}

.action-buttons {
  display: flex;
  gap: 10px;
  margin-top: 1rem;
}
</style>

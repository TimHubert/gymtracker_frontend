<template>
  <div class="workout-container">
    <div v-if="editableWorkout" class="workout-content">
      <h2>
        <button v-if="!isEditing" @click="$emit('back')" class="button back-button">
          <img src="@/assets/back.svg" alt="Löschen" style="width: 15px" />
        </button>
        <template v-if="isEditing">
          <input
            v-model="editableWorkout.name"
            placeholder="Workout-Name"
            required
            class="input workout-name-input"
          />
        </template>
        <template v-else>
          {{ editableWorkout.name }}
        </template>
      </h2>
      <table class="workout-table">
        <tbody>
          <tr v-for="(exercise, index) in editableWorkout.exercises" :key="exercise.id">
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
              <div v-for="(rep, repIndex) in exercise.reps" :key="repIndex" class="rep-container">
                <input
                  v-model="exercise.reps[repIndex]"
                  placeholder="Reps"
                  required
                  class="input"
                />
                x
                <input
                  v-model="exercise.weights[repIndex]"
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
                  :disabled="exercise.reps.length <= 1"
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
          <img src="@/assets/back.svg" alt="Löschen" style="width: 15px" />
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
        <button v-if="!isEditing" @click="saveWorkoutWithWeights" class="button submit-button">
          Speichern
        </button>
      </div>
    </div>
    <p v-else>Workout wird geladen...</p>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'

const props = defineProps({
  workoutId: {
    type: Number,
    required: true,
  },
})

const emit = defineEmits(['back'])
const workouts = ref([])
const exerciseOptions = ref([])
const equipmentOptions = ref([])
const flattenedWorkouts = ref([])
const workout = ref(null)
const editableWorkout = ref(null)
const isEditing = ref(false)

const muscleGroups = ['Brust', 'Lat', 'Trizeps', 'Bizeps', 'Schulter', 'Beine']

const loadOptions = async () => {
  try {
    const response = await fetch('http://localhost:8080/workoutsWithWeights')
    const data = await response.json()
    workouts.value = data

    flattenedWorkouts.value = data.flatMap((workout) =>
      workout.workout.exercise.map((exercise, index) => {
        const weightEntry = workout.weights[index] || {}
        return {
          workoutWithWeightsId: workout.id,
          workoutId: workout.workout.id,
          workoutName: workout.workout.name,
          exerciseName: exercise.name,
          exId: exercise.id,
          targetMuscleGroup: exercise.targetMuscleGroup,
          equipment: exercise.equipment,
          reps: weightEntry.reps || [],
          weights: weightEntry.weights || [],
          date: workout.date || new Date().toISOString().split('T')[0],
        }
      }),
    )

    exerciseOptions.value = [...new Set(flattenedWorkouts.value.map((item) => item.exerciseName))]
    equipmentOptions.value = [...new Set(flattenedWorkouts.value.map((item) => item.equipment))]
  } catch (error) {
    console.error('Fehler beim Laden der Workouts:', error)
  }
}

const loadWorkout = async () => {
  try {
    const response = await fetch(`http://localhost:8080/workout/${props.workoutId}`)
    const data = await response.json()
    const originalWorkout = {
      id: data.id,
      name: data.name,
      date: data.date || new Date().toISOString().split('T')[0],
      exercises:
        data.exercise.map((ex) => ({
          ...ex,
          reps: ex.reps || [0, 0, 0],
          weights: ex.weights || [0, 0, 0],
        })) || [],
    }
    workout.value = originalWorkout
    editableWorkout.value = JSON.parse(JSON.stringify(originalWorkout))
  } catch (error) {
    console.error('Fehler beim Laden des Workouts:', error)
  }
}

const addRep = (exerciseIndex) => {
  const exercise = editableWorkout.value.exercises[exerciseIndex]
  exercise.reps.push(0)
  exercise.weights.push(0)
}

const removeRep = (exerciseIndex) => {
  const exercise = editableWorkout.value.exercises[exerciseIndex]
  if (exercise.reps.length > 1) {
    exercise.reps.pop()
    exercise.weights.pop()
  }
}

const addExercise = () => {
  editableWorkout.value.exercises.push({
    name: '',
    equipment: '',
    targetMuscleGroup: '',
    reps: [0],
    weights: [0],
  })
}

const removeExercise = () => {
  editableWorkout.value.exercises.pop()
}

const saveWorkout = () => {
  try {
    if (!editableWorkout.value.name.trim()) {
      alert('Bitte geben Sie einen Namen für das Workout ein.')
      return
    }

    for (const exercise of editableWorkout.value.exercises) {
      if (
        !exercise.name.trim() ||
        !exercise.equipment.trim() ||
        !exercise.targetMuscleGroup.trim()
      ) {
        alert('Bitte füllen Sie alle Felder für jede Übung aus.')
        return
      }
    }

    workout.value = JSON.parse(JSON.stringify(editableWorkout.value))
    isEditing.value = false
  } catch (error) {
    console.error('Fehler:', error)
    alert('Fehler beim Speichern des Workouts: ' + error.message)
  }
}

const toggleEditMode = () => {
  if (isEditing.value) {
    loadWorkout()
  } else if (editableWorkout.value) {
    editableWorkout.value = JSON.parse(JSON.stringify(workout.value))
  }
  isEditing.value = !isEditing.value
}

const saveWorkoutWithWeights = async () => {
  try {
    if (!editableWorkout.value.name.trim()) {
      alert('Bitte geben Sie einen Namen für das Workout ein.')
      return
    }

    for (const exercise of editableWorkout.value.exercises) {
      if (
        !exercise.name.trim() ||
        !exercise.equipment.trim() ||
        !exercise.targetMuscleGroup.trim()
      ) {
        alert('Bitte füllen Sie alle Felder für jede Übung aus.')
        return
      }

      for (let i = 0; i < exercise.reps.length; i++) {
        const rep = exercise.reps[i]
        const weight = exercise.weights[i]

        if (isNaN(rep) || rep.toString().includes(',')) {
          alert(`Ungültiger Wert für Reps in Übung "${exercise.name}".`)
          return
        }

        if (isNaN(weight) || weight.toString().includes(',')) {
          alert(`Ungültiger Wert für Gewicht in Übung "${exercise.name}".`)
          return
        }
      }
    }

    const payload = {
      workout: {
        id: null, // Immer null setzen, um ein neues Workout zu erstellen
        name: editableWorkout.value.name,
        exercise: editableWorkout.value.exercises.map((ex) => ({
          name: ex.customName || ex.name,
          description: 'Keine Beschreibung vorhanden',
          equipment: ex.customEquipment || ex.equipment,
          targetMuscleGroup: ex.targetMuscleGroup,
        })),
      },
      date: editableWorkout.value.date || new Date().toISOString().split('T')[0],
      show: false,
      weights: editableWorkout.value.exercises.map((ex) => ({
        reps: ex.reps,
        weights: ex.weights,
      })),
    }

    const response = await fetch('http://localhost:8080/OneWorkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!response.ok) throw new Error(`HTTP-Fehler! Status: ${response.status}`)

    alert('Workout erfolgreich gespeichert')
    loadOptions()
  } catch (error) {
    console.error('Fehler beim Speichern des Workouts:', error)
    alert('Fehler beim Speichern des Workouts: ' + error.message)
  }
}

watch(() => props.workoutId, loadWorkout)
onMounted(() => {
  loadWorkout()
  loadOptions()
})
</script>

<style>
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

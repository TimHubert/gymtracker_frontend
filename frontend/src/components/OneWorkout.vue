<template>
  <div>
    <button @click="$emit('back')">Zurück</button>
    <div v-if="editableWorkout">
      <h2>
        <template v-if="isEditing">
          <input
            v-model="editableWorkout.name"
            placeholder="Workout-Name"
            required
            style="width: 100%; font-size: 1.5rem; margin-bottom: 1rem"
          />
        </template>
        <template v-else>
          {{ editableWorkout.name }}
        </template>
      </h2>
      <table>
        <tbody>
          <tr v-for="(exercise, index) in editableWorkout.exercises" :key="exercise.id">
            <td>
              <template v-if="isEditing">
                <input
                  v-model="exercise.name"
                  placeholder="Übungsname"
                  required
                  style="width: 100%"
                />
              </template>
              <template v-else>
                {{ exercise.name }}
              </template>
            </td>
            <td>
              <template v-if="isEditing">
                <input
                  v-model="exercise.equipment"
                  placeholder="Equipment"
                  required
                  style="width: 100%"
                />
              </template>
              <template v-else>
                {{ exercise.equipment }}
              </template>
            </td>
            <td>
              <template v-if="isEditing">
                <select v-model="exercise.targetMuscleGroup" style="width: 100%">
                  <option disabled value="">Muskelgruppe</option>
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
                v-for="(rep, repIndex) in exercise.reps"
                :key="repIndex"
                style="display: flex; gap: 10px; align-items: center"
              >
                <input
                  v-model="exercise.reps[repIndex]"
                  placeholder="Reps"
                  required
                  style="width: 100%"
                />
                <input
                  v-model="exercise.weights[repIndex]"
                  placeholder="Weight"
                  required
                  style="width: 100%"
                />
              </div>
              <button v-if="isEditing" @click="addRep(index)">+</button>
              <button
                v-if="isEditing"
                @click="removeRep(index)"
                :disabled="exercise.reps.length <= 1"
              >
                -
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <button v-if="isEditing" @click="addExercise" class="add">Übung hinzufügen</button>
      <button v-if="isEditing" @click="saveWorkout" class="submit">Änderungen Übernehmen</button>
      <button v-else @click="toggleEditMode" class="edit">Bearbeiten</button>
      <button v-if="!isEditing" @click="saveWorkoutWithWeights" class="submit">Speichern</button>
    </div>
    <p v-else>Workout wird geladen...</p>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  workoutId: {
    type: Number,
    required: true,
  },
})

const emit = defineEmits(['back'])
const workout = ref(null)
const editableWorkout = ref(null)
const isEditing = ref(false)

const muscleGroups = ['Brust', 'Lat', 'Trizeps', 'Bizeps', 'Schulter', 'Beine']

const loadWorkout = () => {
  fetch(`http://localhost:8080/workout/${props.workoutId}`)
    .then((response) => response.json())
    .then((data) => {
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
    })
    .catch((error) => console.error('Fehler beim Laden des Workouts:', error))
}

const addRep = (exerciseIndex) => {
  editableWorkout.value.exercises[exerciseIndex].reps.push(0)
  editableWorkout.value.exercises[exerciseIndex].weights.push(0)
}

const removeRep = (exerciseIndex) => {
  editableWorkout.value.exercises[exerciseIndex].reps.pop()
  editableWorkout.value.exercises[exerciseIndex].weights.pop()
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

const saveWorkout = () => {
  try {
    if (!editableWorkout.value.name.trim()) {
      alert('Bitte geben Sie einen Namen für das Workout ein.')
      return
    }

    for (const exercise of editableWorkout.value.exercises) {
      if (!exercise.name.trim()) {
        alert('Bitte geben Sie einen Namen für jede Übung ein.')
        return
      }
      if (!exercise.equipment.trim()) {
        alert('Bitte geben Sie ein Equipment für jede Übung ein.')
        return
      }
      if (!exercise.targetMuscleGroup.trim()) {
        alert('Bitte wählen Sie eine Muskelgruppe für jede Übung aus.')
        return
      }
    }

    // Lokale Kopie des Workouts aktualisieren
    workout.value = JSON.parse(JSON.stringify(editableWorkout.value))
    isEditing.value = false
  } catch (error) {
    console.error('Fehler:', error)
    alert('Fehler beim Speichern des Workouts: ' + error.message)
  }
}

const toggleEditMode = () => {
  if (!isEditing.value) {
    editableWorkout.value = JSON.parse(JSON.stringify(workout.value))
  }
  isEditing.value = !isEditing.value
}

watch(() => props.workoutId, loadWorkout)

onMounted(() => {
  loadWorkout()
})

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
    }

    const currentDate = new Date().toISOString().split('T')[0]

    const payload = {
      workout: {
        id: editableWorkout.value.id || null, // ID hinzufügen, falls vorhanden
        name: editableWorkout.value.name,
        exercise: editableWorkout.value.exercises.map((ex) => ({
          name: ex.name,
          description: 'Keine Beschreibung vorhanden',
          equipment: ex.equipment,
          targetMuscleGroup: ex.targetMuscleGroup,
        })),
      },
      date: currentDate,
      weights: editableWorkout.value.exercises.map((ex) => ({
        reps: ex.reps,
        weights: ex.weights,
      })),
    }

    console.log('Editable Workout ID:', editableWorkout.value.id)
    console.log('Editable Workout Date:', workout.value.date)

    const method = editableWorkout.value.id && workout.value.date === currentDate ? 'PUT' : 'POST'
    const url =
      editableWorkout.value.id && workout.value.date === currentDate
        ? `http://localhost:8080/OneWorkout/${editableWorkout.value.id}`
        : 'http://localhost:8080/OneWorkout'

    const response = await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      throw new Error(`HTTP-Fehler! Status: ${response.status}`)
    }
    alert('Workout erfolgreich gespeichert')
    console.log('Workout erfolgreich gespeichert:', await response.json())
  } catch (error) {
    console.error('Fehler beim Speichern des Workouts:', error)
    alert('Fehler beim Speichern des Workouts: ' + error.message)
  }
}
</script>

<style>
.edit {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  outline: none;
}
.edit:hover {
  background-color: #0056b3;
}
</style>

<template>
  <div>
    <button v-if="!isEditing" @click="$emit('back')">Zurück</button>
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
      <button v-if="isEditing" @click="toggleEditMode" class="submit">Zurück</button>
      <button v-if="isEditing" @click="addExercise" class="add">Übung hinzufügen</button>
      <button v-if="isEditing" @click="removeExercise" class="add">Übung entfernen</button>
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

const workouts = ref([])
const exerciseOptions = ref([])
const equipmentOptions = ref([])
const flattenedWorkouts = ref([])

const loadOptions = async () => {
  try {
    const response = await fetch('http://localhost:8080/workoutsWithWeights')
    const data = await response.json()
    console.log('Geladene Workouts:', JSON.stringify(data, null, 2))
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
        }
      }),
    )

    exerciseOptions.value = [...new Set(flattenedWorkouts.value.map((item) => item.exerciseName))]
    equipmentOptions.value = [...new Set(flattenedWorkouts.value.map((item) => item.equipment))]
  } catch (error) {
    console.error('Fehler beim Laden der Workouts:', error)
  }
}

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

const removeExercise = () => {
  editableWorkout.value.exercises.pop({
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

    workout.value = JSON.parse(JSON.stringify(editableWorkout.value))
    isEditing.value = false
  } catch (error) {
    console.error('Fehler:', error)
    alert('Fehler beim Speichern des Workouts: ' + error.message)
  }
}

const toggleEditMode = () => {
  if (isEditing.value) {
    workout.value = JSON.parse(JSON.stringify(editableWorkout.value))
  } else {
    if (!editableWorkout.value) {
      editableWorkout.value = JSON.parse(JSON.stringify(workout.value))
    }
  }
  isEditing.value = !isEditing.value
}

watch(() => props.workoutId, loadWorkout)

onMounted(() => {
  loadWorkout()
  loadOptions()
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

      for (let i = 0; i < exercise.reps.length; i++) {
        const rep = exercise.reps[i]
        const weight = exercise.weights[i]

        if (isNaN(rep) || rep.toString().includes(',')) {
          alert(
            `Ungültiger Wert für Reps in Übung "${exercise.name}". Bitte geben Sie eine Zahl mit Punkt ein.`,
          )
          return
        }

        if (isNaN(weight) || weight.toString().includes(',')) {
          alert(
            `Ungültiger Wert für Gewicht in Übung "${exercise.name}". Bitte geben Sie eine Zahl mit Punkt ein.`,
          )
          return
        }
      }
    }

    const currentDate = new Date().toISOString().split('T')[0]

    const payload = {
      workout: {
        id: editableWorkout.value.id || null, // ID hinzufügen, falls vorhanden
        name: editableWorkout.value.name,
        exercise: editableWorkout.value.exercises.map((ex) => ({
          name: ex.customName || ex.name,
          description: 'Keine Beschreibung vorhanden',
          equipment: ex.customEquipment || ex.equipment,
          targetMuscleGroup: ex.targetMuscleGroup,
        })),
      },
      date: currentDate,
      weights: editableWorkout.value.exercises.map((ex) => ({
        reps: ex.reps ?? 0,
        weights: ex.weights ?? 0,
      })),
    }

    const currentWorkoutWithWeights = flattenedWorkouts.value.find(
      (workout) => workout.workoutId === editableWorkout.value.id,
    )

    const method =
      editableWorkout.value.id && currentWorkoutWithWeights && workout.value.date === currentDate
        ? 'PUT'
        : 'POST'
    const url =
      method === 'PUT'
        ? `http://localhost:8080/OneWorkout/${currentWorkoutWithWeights.workoutWithWeightsId}`
        : 'http://localhost:8080/OneWorkout'

    let response = await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok && response.status === 404 && method === 'PUT') {
      console.warn('PUT fehlgeschlagen, versuche POST...')
      response = await fetch('http://localhost:8080/OneWorkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })
    }

    if (!response.ok) {
      throw new Error(`HTTP-Fehler! Status: ${response.status}`)
    }
    alert('Workout erfolgreich gespeichert')
    console.log('Workout erfolgreich gespeichert:', await response.json())
  } catch (error) {
    console.error('Fehler beim Speichern des Workouts:', error)
    alert('Fehler beim Speichern des Workouts: ' + error.message)
  }

  loadOptions()
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

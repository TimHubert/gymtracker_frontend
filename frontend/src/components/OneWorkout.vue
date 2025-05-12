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
              style="width: 100%; font-size: 1.5rem; margin-bottom: 1rem;" 
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
                <div v-for="(rep, repIndex) in exercise.reps" :key="repIndex" style="display: flex; gap: 10px; align-items: center;">
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
                <button v-if="isEditing" @click="removeRep(index)" :disabled="exercise.reps.length <= 1">-</button>
              </td>
            </tr>
          </tbody>
        </table>
        <button v-if="isEditing" @click="addExercise" class="add">Übung hinzufügen</button>
        <button v-if="isEditing" @click="saveWorkout" class="submit">Speichern</button>
        <button v-else @click="toggleEditMode" class="edit">Bearbeiten</button>
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

const workout = ref(null) 
const editableWorkout = ref(null) 
const isEditing = ref(false)

const muscleGroups = ['Brust', 'Lat', 'Trizeps', 'Bizeps', 'Schulter', 'Beine']

const loadWorkout = () => {
  fetch(`http://localhost:8080/workout/${props.workoutId}`)
    .then((response) => response.json())
    .then((data) => {
      const originalWorkout = {
        name: data.name,
        exercises: data.exercise.map(ex => ({
          ...ex,
          reps: ex.reps || [0, 0, 0],
          weights: ex.weights || [0, 0, 0],
        })) || [],
      }
      workout.value = originalWorkout
      editableWorkout.value = JSON.parse(JSON.stringify(originalWorkout)) // Kopie erstellen
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

const saveWorkout = async () => {
  try {
    if (!editableWorkout.value.name.trim()) {
      alert('Bitte geben Sie einen Namen für das Workout ein.');
      return;
    }

    for (const exercise of editableWorkout.value.exercises) {
      if (!exercise.name.trim()) {
        alert('Bitte geben Sie einen Namen für jede Übung ein.');
        return;
      }
      if (!exercise.equipment.trim()) {
        alert('Bitte geben Sie ein Equipment für jede Übung ein.');
        return;
      }
      if (!exercise.targetMuscleGroup.trim()) {
        alert('Bitte wählen Sie eine Muskelgruppe für jede Übung aus.');
        return;
      }
    }

    const payload = {
      workoutReference: {
        name: editableWorkout.value.name,
        exercise: editableWorkout.value.exercises.map((exercise) => ({
          name: exercise.name,
          equipment: exercise.equipment,
          targetMuscleGroup: exercise.targetMuscleGroup,
        })),
      },
      weights: editableWorkout.value.exercises.map((exercise) => ({
        reps: exercise.reps,
        weights: exercise.weights,
      })),
    };

    // Senden der Daten an die API für WorkoutWithWeights
    await fetch('http://localhost:8080/workoutWithWeights', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    isEditing.value = false;
    alert('Workout erfolgreich gespeichert!');
  } catch (error) {
    console.error('Fehler:', error);
    alert('Fehler beim Speichern des Workouts');
  }
};

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
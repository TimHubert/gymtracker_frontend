<template>
  <div class="workout-list">
    <h2>Alle Workouts</h2>
    <div v-if="workouts.length">
      <div v-for="(workout, index) in workouts" :key="index" class="workout-table">
        <h3 style="margin-bottom: 0px; margin-top: 10px">{{ workout.name }}</h3>
        <table class="styled-table">
          <thead>
            <tr>
              <th>Übung</th>
              <th>Gerät</th>
              <th>Muskelgruppe</th>
              <th>Aktionen</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(exercise, exIndex) in workout.exercise" :key="exIndex">
              <td>{{ exercise.name }}</td>
              <td>{{ exercise.equipment }}</td>
              <td>{{ exercise.targetMuscleGroup }}</td>
              <td>
                <button
                  @click="
                    () => {
                      console.log('Workout ID:', workout.id)
                      deleteWorkout(workout.id)
                    }
                  "
                  class="delete-button"
                >
                  Löschen
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <p v-else class="no-workouts">Keine Workouts gefunden.</p>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'

const workouts = ref([])

const loadWorkouts = () => {
  fetch('http://localhost:8080/workouts')
    .then((response) => response.json())
    .then((data) => {
      console.log('Geladene Workouts:', data)
      workouts.value = data
    })
    .catch((error) => console.error('Fehler beim Laden der Workouts:', error))
}

onMounted(() => {
  loadWorkouts()
})

// neue flache Liste für Tabellenanzeige
const flattenedWorkouts = computed(() => {
  return workouts.value.flatMap((workout) =>
    workout.exercise.map((ex) => ({
      workoutId: workout.id,
      workoutName: workout.name,
      exercise: ex,
    })),
  )
})

const deleteWorkout = async (exerciseId) => {
  if (!exerciseId) {
    console.error('Ungültige ID:', exerciseId)
    return
  }

  try {
    const response = await fetch(`http://localhost:8080/workout/${exerciseId}`, {
      method: 'DELETE',
    })
    if (response.ok) {
      console.log(`Workout mit ID ${exerciseId} erfolgreich gelöscht`)
      loadWorkouts()
    } else {
      console.error('Fehler beim Löschen der Übung:', await response.text())
    }
  } catch (error) {
    console.error('Fehler beim Löschen der Übung:', error)
  }
}
</script>

<style scoped>
.workout-list {
  margin-top: 2rem;
}

.styled-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1rem;
}

.styled-table th,
.styled-table td {
  border: 1px solid #ff7b00;
  padding: 8px;
  text-align: left;
  color: white;
  width: 100%;
}

.styled-table th {
  background-color: #1e1e1e;
  color: #ff7b00;
}

.styled-table tr:nth-child(even) {
  background-color: #2b2b2b;
}

.styled-table tr:nth-child(odd) {
  background-color: #1e1e1e;
}

.no-workouts {
  color: #888;
  margin-top: 1rem;
}

.delete-button {
  background-color: #ff4d4d;
  color: white;
  border: none;
  padding: 5px 10px;
  cursor: pointer;
  border-radius: 4px;
}

.delete-button:hover {
  background-color: #ff1a1a;
}
</style>

<template>
  <div class="workout-list">
    <h2>Alle Workouts</h2>
    <div v-if="workouts.length">
      <div v-for="(workout, index) in workouts" :key="index" class="workout-table">
        <h3 style="margin-bottom: 0px; margin-top: 10px; text-align: center">
          {{ workout.name }}
          <button
            @click="
              () => {
                console.log('Workout ID:', workout.id)
                deleteWorkout(workout.id)
              }
            "
            class="delete-button"
          >
            <img src="@/assets/delete.svg" alt="Löschen" style="width: 15px" />
          </button>
        </h3>
        <table class="styled-table">
          <thead>
            <tr>
              <th>Übung</th>
              <th>Gerät</th>
              <th>Muskelgruppe</th>
              <th></th>
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
                      console.log('Workout ID:', workout.id, 'Exercise ID:', exercise.id)
                      deleteExercise(workout.id, exercise.id)
                    }
                  "
                  style="
                    background-color: transparent;
                    width: 100%;
                    height: 100%;
                    border: none;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                  "
                >
                  <img src="@/assets/delete.svg" alt="Löschen" style="width: 15px" />
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

// Filterung der Workouts basierend auf "show"
const loadWorkouts = () => {
  fetch('http://localhost:8080/workouts')
    .then((response) => response.json())
    .then((data) => {
      console.log('Geladene Workouts:', data)
      workouts.value = data.filter((workout) => workout.show) // Nur Workouts mit show: true anzeigen
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
      exercise: exercise,
      exId: exercise.id,
    })),
  )
})

const deleteExercise = async (workoutId, exId) => {
  if (!workoutId || !exId) {
    console.error('Ungültige Parameter:', workoutId, exId)
    return
  }

  const confirmDelete = confirm(`Möchten Sie die Übung wirklich löschen?`)
  if (!confirmDelete) return

  try {
    const response = await fetch(`http://localhost:8080/workout/${workoutId}/${exId}`, {
      method: 'DELETE',
    })
    if (response.ok) {
      console.log(`Exercise mit ID ${exId} in Workout ${workoutId} erfolgreich gelöscht`)
      window.location.reload()
    } else {
      console.error('Fehler beim Löschen der Übung:', await response.text())
      window.location.reload()
    }
  } catch (error) {
    console.error('Fehler beim Löschen der Übung:', error)
    window.location.reload()
  }
}

const deleteWorkout = async (workoutId) => {
  if (!workoutId) {
    console.error('Ungültige Parameter:', workoutId)
    return
  }

  const confirmDelete = confirm(`Möchten Sie das Workout wirklich löschen?`)
  if (!confirmDelete) return

  try {
    const response = await fetch(`http://localhost:8080/workout/${workoutId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    if (response.ok) {
      console.log(`Workout erfolgreich gelöscht`)
      loadWorkouts()
    } else {
      console.error('Fehler beim Ausblenden des Workouts:', await response.text())
    }
  } catch (error) {
    console.error('Fehler beim Ausblenden des Workouts:', error)
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
  border-collapse: separate;
  overflow: hidden;
  text-align: left;
}

.styled-table th,
.styled-table td {
  border: 0px solid rgb(0, 110, 255);
  padding: 8px;
  text-align: left;
  color: white;
  width: 100%;
}

.styled-table th {
  background-color: #1e1e1e;
  color: rgb(0, 110, 255);
  text-align: left;
}

.styled-table tr:nth-child(even) {
  background-color: #2b2b2b;
}

.styled-table tr:nth-child(odd) {
  background-color: #1e1e1e;
}
.styled-table th:first-child {
  border-top-left-radius: 10px;
}

.styled-table th:last-child {
  border-top-right-radius: 10px;
}

.styled-table tr:last-child td:last-child {
  border-bottom-right-radius: 10px;
}

.styled-table tr:last-child td:first-child {
  border-bottom-left-radius: 10px;
}

.styled-table td:last-child {
  background-color: #ff4d4d;
}

.styled-table td:last-child:hover {
  background-color: #c93535;
}

.no-workouts {
  color: #888;
  margin-top: 1rem;
}

.delete-button {
  background-color: #ff4d4d;
  color: white;
  border: none;
  padding: 4px 9px;
  cursor: pointer;
  border-radius: 30px;
  align-self: center;
}

.delete-button:hover {
  background-color: #971d1d;
}

/* Responsive Design für Handys und Tablets */
@media (max-width: 768px) {
  .workout-list {
    padding: 0 10px;
  }

  .styled-table {
    font-size: 0.85rem;
  }

  .styled-table th,
  .styled-table td {
    padding: 6px;
  }
}

@media (max-width: 574px) {
  .workout-list {
    margin: 0;
    padding: 0;
  }

  .styled-table {
    font-size: 0.8rem;
    width: 100%;
    max-width: 100%;
    table-layout: fixed;
  }

  .styled-table th,
  .styled-table td {
    padding: 4px 2px;
    font-size: 0.75rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* Spaltenbreiten anpassen */
  .styled-table th:nth-child(1),
  .styled-table td:nth-child(1) {
    width: 35%;
  }

  .styled-table th:nth-child(2),
  .styled-table td:nth-child(2) {
    width: 25%;
  }

  .styled-table th:nth-child(3),
  .styled-table td:nth-child(3) {
    width: 30%;
  }

  .styled-table th:nth-child(4),
  .styled-table td:nth-child(4) {
    width: 10%;
  }
}

@media (max-width: 480px) {
  h3 {
    font-size: 0.9rem;
  }

  .styled-table {
    font-size: 0.7rem;
  }
}
</style>

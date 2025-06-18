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
import { useAuthStore } from '../stores/auth'
import axios from 'axios'
import { createApiUrl, API_CONFIG } from '../config/api'

const authStore = useAuthStore()
const workouts = ref([])

// Filterung der Workouts basierend auf "show"
const loadWorkouts = async () => {
  try {
    console.log('WorkoutList: Lade Workouts...')
    
    // Warte bis Authentifizierung initialisiert ist
    if (!authStore.isAuthenticated) {
      console.log('WorkoutList: Warte auf Authentifizierung...')
      return
    }

    const response = await axios.get(createApiUrl(API_CONFIG.WORKOUTS.ALL))
    console.log('WorkoutList: Workouts geladen:', response.data)
    workouts.value = response.data.filter((workout) => workout.show) // Nur Workouts mit show: true anzeigen
  } catch (error) {
    console.error('WorkoutList: Fehler beim Laden der Workouts:', error)
    if (error.response?.status === 401) {
      console.error('WorkoutList: Authentifizierung fehlgeschlagen')
    }
  }
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
      exId: ex.id,
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
    console.log('WorkoutList: Lösche Übung:', workoutId, exId)
    const response = await axios.delete(createApiUrl(`/workout/${workoutId}/${exId}`))
    console.log('WorkoutList: Übung erfolgreich gelöscht')
    window.location.reload()
  } catch (error) {
    console.error('WorkoutList: Fehler beim Löschen der Übung:', error)
    if (error.response?.status === 401) {
      alert('Authentifizierung fehlgeschlagen. Bitte melden Sie sich erneut an.')
    } else if (error.response?.status === 403) {
      alert('Zugriff verweigert. Diese Übung gehört nicht Ihnen.')
    }
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
    console.log('WorkoutList: Lösche Workout:', workoutId)
    const response = await axios.delete(createApiUrl(API_CONFIG.WORKOUTS.BY_ID(workoutId)))
    console.log('WorkoutList: Workout erfolgreich gelöscht')
    loadWorkouts()
  } catch (error) {
    console.error('WorkoutList: Fehler beim Löschen des Workouts:', error)
    if (error.response?.status === 401) {
      alert('Authentifizierung fehlgeschlagen. Bitte melden Sie sich erneut an.')
    } else if (error.response?.status === 403) {
      alert('Zugriff verweigert. Dieses Workout gehört nicht Ihnen.')
    }
  }
}
</script>

<style scoped>
.h2 {
  margin-top: 1rem;
}
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
  color: var(--color-text);
  width: 100%;
}

.styled-table th {
  background-color: var(--table-header-bg);
  color: rgb(0, 110, 255);
  text-align: left;
}

.styled-table tr:nth-child(even) {
  background-color: var(--table-bg-secondary);
}

.styled-table tr:nth-child(odd) {
  background-color: var(--table-bg-primary);
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
  color: var(--color-text);
  opacity: 0.7;
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
  .h2 {
    margin-top: 1rem;
  }
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
  }
}

@media (max-width: 480px) {
    .h2 {
    margin-top: 1rem;
  }
  
  h3 {
    font-size: 0.9rem;
  }

  .styled-table {
    font-size: 0.7rem;
  }
}
</style>

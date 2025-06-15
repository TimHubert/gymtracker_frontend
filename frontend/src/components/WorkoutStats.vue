<template>
  <div v-if="workouts.length === 0" class="no-workouts-message">
    <div class="emoji-box">
      📊 Keine Workout-Daten verfügbar. Absolviere dein erstes Training, um Statistiken zu sehen!
    </div>
  </div>

  <div v-else class="workout-list">
    <div class="stat-box">
      <h2>Trainingshäufigkeit pro Workout</h2>
      <canvas ref="chartCanvas"></canvas>
    </div>

    <div class="emoji-box">🏋️ Insgesamt absolvierte Workouts: {{ totalWorkouts }}</div>

    <div class="stat-box">
      <h2>Übungsstatistik</h2>
      <div class="chart-container">
        <canvas ref="exerciseChartCanvas"></canvas>
      </div>
    </div>

    <div class="stat-box">
      <h2>Fortschritt über Zeit</h2>
      <div class="filter-section">
        <label for="exercise-select">Übung auswählen:</label>
        <select id="exercise-select" v-model="selectedExercise" @change="createProgressChart">
          <option value="">Alle Übungen</option>
          <option v-for="exercise in availableExercises" :key="exercise" :value="exercise">
            {{ exercise }}
          </option>
        </select>

        <label for="set-select">Satz auswählen:</label>
        <select id="set-select" v-model="selectedSet" @change="createProgressChart">
          <option value="max">Maximales Gewicht</option>
          <option v-for="setNum in maxAvailableSets" :key="setNum" :value="setNum">
            Satz {{ setNum }}
          </option>
        </select>
      </div>
      <canvas ref="progressChartCanvas"></canvas>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import Chart from 'chart.js/auto'
import axios from 'axios'

const workouts = ref([])
const filteredWorkouts = ref([])
const selectedDate = ref('')
const chartCanvas = ref(null)
const exerciseChartCanvas = ref(null)
const progressChartCanvas = ref(null)
const selectedExercise = ref('')
const selectedSet = ref('max') // Standardmäßig maximales Gewicht anzeigen
let chartInstance = null
let exerciseChartInstance = null
let progressChartInstance = null

// Workouts aggregieren
const workoutCounts = computed(() => {
  const counts = {}
  workouts.value.forEach((workout) => {
    const name = workout.workout?.name
    if (name) counts[name] = (counts[name] || 0) + 1
  })
  return counts
})

const totalWorkouts = computed(() => workouts.value.length)

const loadWorkouts = async () => {
  try {
    const response = await axios.get('/workoutsWithWeights')
    console.log('Geladene Workouts:', JSON.stringify(response.data, null, 2))
    workouts.value = response.data
    filteredWorkouts.value = response.data
  } catch (error) {
    console.error('Fehler beim Laden der Workouts:', error)
  }
}

const filterWorkoutsByDate = () => {
  if (selectedDate.value) {
    filteredWorkouts.value = workouts.value.filter(
      (workout) =>
        new Date(workout.date).toLocaleDateString('de-DE') ===
        new Date(selectedDate.value).toLocaleDateString('de-DE'),
    )
  } else {
    filteredWorkouts.value = workouts.value
  }
}

onMounted(async () => {
  await loadWorkouts()

  // Charts nur erstellen, wenn Workouts vorhanden sind
  if (workouts.value.length > 0) {
    // Kurze Verzögerung um sicherzustellen, dass DOM bereit ist
    setTimeout(() => {
      createChart()
      createExerciseChart()
      createProgressChart()
    }, 100)
  }

  // Watcher für zukünftige Änderungen
  watch(
    workouts,
    () => {
      if (workouts.value.length > 0) {
        setTimeout(() => {
          createChart()
          createExerciseChart()
          createProgressChart()
        }, 100)
      }
    },
    { immediate: false },
  )

  watch(
    filteredWorkouts,
    () => {
      if (filteredWorkouts.value.length > 0) {
        setTimeout(() => {
          createExerciseChart()
        }, 100)
      }
    },
    { immediate: true },
  )

  watch(
    [selectedExercise, selectedSet],
    () => {
      if (workouts.value.length > 0) {
        setTimeout(() => {
          createProgressChart()
        }, 100)
      }
    },
    { immediate: true },
  )
})

const createChart = () => {
  if (chartInstance) {
    chartInstance.destroy()
  }
  if (chartCanvas.value) {
    const ctx = chartCanvas.value.getContext('2d')
    chartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: Object.keys(workoutCounts.value),
        datasets: [
          {
            label: 'Häufigkeit',
            data: Object.values(workoutCounts.value),
            backgroundColor: 'rgba(0, 110, 255, 1)',
            borderWidth: 0,
            borderColor: 'transparent',
          },
        ],
      },
      options: {
        plugins: {
          legend: {
            labels: {
              font: {
                family: 'Montserrat',
              },
            },
          },
        },
        scales: {
          x: {
            ticks: {
              font: {
                family: 'Montserrat',
              },
              color: '#fff',
            },
            grid: {
              display: false,
            },
          },
          y: {
            ticks: {
              font: {
                family: 'Montserrat',
              },
              color: '#fff',
            },
            grid: {
              display: false,
            },
          },
        },
      },
      plugins: [stripesPlugin],
    })
    chartInstance.data.datasets[0].borderRadius = { topLeft: 20, topRight: 20 }
    chartInstance.data.datasets[0].borderSkipped = false
    chartInstance.update()
  }
}

const exerciseDistribution = computed(() => {
  const distribution = {}
  filteredWorkouts.value.forEach((workout) => {
    workout.workout?.exercise.forEach((ex) => {
      distribution[ex.name] = (distribution[ex.name] || 0) + 1
    })
  })
  return distribution
})

const createExerciseChart = () => {
  if (exerciseChartInstance) {
    exerciseChartInstance.destroy()
  }
  if (exerciseChartCanvas.value) {
    const ctx = exerciseChartCanvas.value.getContext('2d')
    exerciseChartInstance = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: Object.keys(exerciseDistribution.value),
        datasets: [
          {
            data: Object.values(exerciseDistribution.value),
            backgroundColor: [
              'rgba(0, 110, 255, 1)',
              'rgba(255, 99, 132, 1)',
              'rgba(75, 192, 192, 1)',
            ],
            borderWidth: 0,
            borderColor: 'transparent',
          },
        ],
      },
      options: {
        aspectRatio: 1.5,
        responsive: true,
        maintainAspectRatio: false,
        layout: {
          padding: {
            left: 50,
            right: 50,
            top: 0,
            bottom: 0,
          },
        },
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              font: {
                family: 'Montserrat',
              },
            },
          },
        },
      },
    })
  }
}

// Liste aller verfügbaren Übungen
const availableExercises = computed(() => {
  const exercises = new Set()
  workouts.value.forEach((workout) => {
    workout.workout?.exercise.forEach((ex) => {
      exercises.add(ex.name)
    })
  })
  return Array.from(exercises).sort()
})

// Bestimmen der maximalen Anzahl verfügbarer Sätze für die ausgewählte Übung
const maxAvailableSets = computed(() => {
  if (!selectedExercise.value) {
    // Wenn keine Übung ausgewählt ist, finde die maximale Satzanzahl für alle Übungen
    let maxSets = 0

    workouts.value.forEach((workout) => {
      workout.weights?.forEach((weight) => {
        const setCount = weight.weights?.length || 0
        maxSets = Math.max(maxSets, setCount)
      })
    })

    return Array.from({ length: maxSets }, (_, i) => i + 1)
  } else {
    // Wenn eine Übung ausgewählt ist, finde die maximale Satzanzahl für diese Übung
    let maxSets = 0

    workouts.value.forEach((workout) => {
      const exerciseIndex = workout.workout?.exercise.findIndex(
        (ex) => ex.name === selectedExercise.value,
      )
      if (exerciseIndex !== -1 && workout.weights[exerciseIndex]) {
        const setCount = workout.weights[exerciseIndex].weights?.length || 0
        maxSets = Math.max(maxSets, setCount)
      }
    })

    return Array.from({ length: maxSets }, (_, i) => i + 1)
  }
})

// Daten für das Fortschrittsdiagramm
const exerciseProgressData = computed(() => {
  // Wenn keine Übung ausgewählt ist, Daten für alle Übungen sammeln
  if (!selectedExercise.value) {
    // Max. 5 Übungen darstellen um Übersichtlichkeit zu wahren
    const topExercises = availableExercises.value.slice(0, 5)

    // Erstelle Datensätze für jede der Top-Übungen
    return topExercises
      .map((exercise) => {
        // Sammle alle Workouts mit dieser Übung
        const relevantWorkouts = workouts.value.filter((workout) =>
          workout.workout?.exercise.some((ex) => ex.name === exercise),
        )

        // Sortiere nach Datum
        relevantWorkouts.sort((a, b) => new Date(a.date) - new Date(b.date))

        // Für jedes Workout extrahiere das Gewicht gemäß Satzauswahl
        const progressPoints = relevantWorkouts
          .map((workout) => {
            const date = new Date(workout.date).toLocaleDateString('de-DE')

            // Finde den Index der Übung
            const exerciseIndex = workout.workout.exercise.findIndex((ex) => ex.name === exercise)

            if (exerciseIndex !== -1 && workout.weights[exerciseIndex]) {
              const weights = workout.weights[exerciseIndex].weights.filter((w) => w > 0)

              // Je nach Satzauswahl das entsprechende Gewicht ermitteln
              let selectedWeight = 0

              if (selectedSet.value === 'max') {
                // Maximales Gewicht aus allen Sätzen
                selectedWeight = weights.length > 0 ? Math.max(...weights) : 0
              } else {
                // Gewicht des ausgewählten Satzes (falls vorhanden)
                const setIndex = parseInt(selectedSet.value) - 1
                selectedWeight = setIndex >= 0 && setIndex < weights.length ? weights[setIndex] : 0
              }

              return {
                date,
                weight: selectedWeight,
              }
            }

            return { date, weight: 0 }
          })
          .filter((item) => item.weight > 0)

        return {
          exercise,
          data: progressPoints,
        }
      })
      .filter((dataset) => dataset.data.length > 0)
  }

  // Wenn eine spezifische Übung ausgewählt ist
  const relevantWorkouts = workouts.value.filter((workout) =>
    workout.workout?.exercise.some((ex) => ex.name === selectedExercise.value),
  )

  relevantWorkouts.sort((a, b) => new Date(a.date) - new Date(b.date))

  const data = relevantWorkouts
    .map((workout) => {
      const date = new Date(workout.date).toLocaleDateString('de-DE')

      const exerciseIndex = workout.workout.exercise.findIndex(
        (ex) => ex.name === selectedExercise.value,
      )

      if (exerciseIndex !== -1 && workout.weights[exerciseIndex]) {
        const weights = workout.weights[exerciseIndex].weights.filter((w) => w > 0)

        // Je nach Satzauswahl das entsprechende Gewicht ermitteln
        let selectedWeight = 0

        if (selectedSet.value === 'max') {
          // Maximales Gewicht aus allen Sätzen
          selectedWeight = weights.length > 0 ? Math.max(...weights) : 0
        } else {
          // Gewicht des ausgewählten Satzes (falls vorhanden)
          const setIndex = parseInt(selectedSet.value) - 1
          selectedWeight = setIndex >= 0 && setIndex < weights.length ? weights[setIndex] : 0
        }

        return {
          date,
          weight: selectedWeight,
        }
      }

      return { date, weight: 0 }
    })
    .filter((item) => item.weight > 0)

  return [
    {
      exercise: selectedExercise.value,
      data: data,
    },
  ]
})

const createProgressChart = () => {
  if (progressChartInstance) {
    progressChartInstance.destroy()
  }

  if (!progressChartCanvas.value) return

  const progressData = exerciseProgressData.value

  if (progressData.length === 0) return

  // Erweiterte Farbpalette für mehrere Übungen
  const colors = [
    'rgb(0, 110, 255)',    // Blau
    'rgb(255, 99, 132)',   // Rosa/Rot
    'rgb(75, 192, 192)',   // Türkis
    'rgb(255, 159, 64)',   // Orange
    'rgb(153, 102, 255)',  // Lila
    'rgb(255, 205, 86)',   // Gelb
    'rgb(54, 162, 235)',   // Hellblau
    'rgb(255, 99, 255)',   // Magenta
    'rgb(199, 199, 199)',  // Grau
    'rgb(83, 102, 255)',   // Indigo
    'rgb(255, 159, 132)',  // Lachs
    'rgb(132, 255, 132)',  // Hellgrün
    'rgb(255, 255, 99)',   // Hellgelb
    'rgb(159, 255, 255)',  // Cyan
    'rgb(255, 132, 199)',  // Pink
    'rgb(132, 199, 255)',  // Babyblau
    'rgb(199, 255, 132)',  // Lime
    'rgb(255, 199, 255)',  // Lavendel
    'rgb(199, 132, 255)',  // Violett
    'rgb(132, 255, 199)',  // Mint
  ]

  // Sammle alle eindeutigen Daten über alle Übungen
  const allDates = new Set()
  progressData.forEach((dataset) => {
    dataset.data.forEach((point) => {
      allDates.add(point.date)
    })
  })

  // Sortiere die Daten chronologisch
  const sortedDates = Array.from(allDates).sort((a, b) => {
    return new Date(a.split('.').reverse().join('-')) - new Date(b.split('.').reverse().join('-'))
  })

  // Erstelle die Datensätze für das Chart
  const datasets = progressData.map((dataset, index) => {
    const color = colors[index % colors.length]
    const setLabel = selectedSet.value === 'max' ? 'Max Gewicht' : `Satz ${selectedSet.value}`

    return {
      label: `${dataset.exercise} (${setLabel})`,
      data: dataset.data.map((point) => ({
        x: point.date,
        y: point.weight,
      })),
      borderColor: color,
      backgroundColor: color.replace('rgb', 'rgba').replace(')', ', 0.1)'),
      borderWidth: 2,
      tension: 0.2,
      fill: false,
      pointBackgroundColor: '#fff',
      pointBorderColor: color,
      pointRadius: 5,
      pointHoverRadius: 7,
    }
  })

  const ctx = progressChartCanvas.value.getContext('2d')
  progressChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: sortedDates,
      datasets: datasets,
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: {
            font: {
              family: 'Montserrat',
            },
            color: '#fff',
          },
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              return `${context.dataset.label}: ${context.raw.y} kg`
            },
          },
        },
      },
      scales: {
        x: {
          ticks: {
            font: {
              family: 'Montserrat',
            },
            color: '#fff',
          },
          grid: {
            display: false,
          },
        },
        y: {
          ticks: {
            font: {
              family: 'Montserrat',
            },
            color: '#fff',
          },
          grid: {
            display: true,
            color: 'rgba(255, 255, 255, 0.1)',
          },
          beginAtZero: true,
        },
      },
    },
  })
}

const deleteWorkout = async (workoutWithWeightsId) => {
  try {
    console.log('WorkoutWithWeights ID zum Löschen:', workoutWithWeightsId)

    const response = await axios.get(`/workoutWithWeights/${workoutWithWeightsId}`)
    const workoutWithWeights = response.data
    const workoutId = workoutWithWeights.workout.id
    console.log('Workout ID:', workoutId)

    await axios.delete(`/workoutWithWeights/${workoutWithWeightsId}`)
    console.log(`WorkoutWithWeights mit ID ${workoutWithWeightsId} gelöscht`)

    await axios.delete(`/workout/${workoutId}`)
    console.log('Workout erfolgreich gelöscht')
    loadWorkouts()
  } catch (error) {
    console.error('Fehler beim Löschen des Workouts:', error)
  }
}

const duplicateWorkout = async (workoutId) => {
  try {
    const response = await axios.get(`/workoutWithWeights/${workoutId}`)
    const workoutData = response.data

    const newWorkout = {
      name: workoutData.workout.name,
      exercise: workoutData.workout.exercise.map((exercise) => ({
        name: exercise.name,
        description: exercise.description || 'Keine Beschreibung vorhanden',
        equipment: exercise.equipment || 'Unbekannt',
        targetMuscleGroup: exercise.targetMuscleGroup || 'Unbekannt',
      })),
      show: false,
    }

    console.log('Neues Workout:', newWorkout)

    const saveWorkoutResponse = await axios.post('/workout', newWorkout)
    const savedWorkout = saveWorkoutResponse.data

    const newWorkoutWithWeights = {
      ...workoutData,
      id: undefined,
      workout: savedWorkout,
      date: new Date().toISOString(),
      weights: workoutData.weights.map((weight) => ({
        reps: [...weight.reps],
        weights: [...weight.weights],
      })),
    }

    await axios.post('/OneWorkout', newWorkoutWithWeights)
    alert('Workout und WorkoutWithWeights erfolgreich dupliziert')
    loadWorkouts()
  } catch (error) {
    console.error('Fehler beim Duplizieren des Workouts:', error)
    alert('Fehler beim Duplizieren des Workouts')
  }
}

const maxSets = (weights) => {
  return Math.max(...weights.map((weight) => weight.reps.length), 0)
}

const isSetDefined = (weights, setIndex) => {
  return weights.some(
    (weight) => weight.reps[setIndex] !== undefined && weight.weights[setIndex] !== undefined,
  )
}

const stripesPlugin = {
  id: 'stripesPlugin',
  beforeDraw(chart) {
    const {
      ctx,
      chartArea: { left, right },
    } = chart
    const scale = chart.scales.y
    const minVal = Math.floor(scale.min)
    const maxVal = Math.ceil(scale.max)
    ctx.save()
    for (let i = minVal; i < maxVal; i++) {
      const y1 = scale.getPixelForValue(i)
      const y2 = scale.getPixelForValue(i + 1)
      ctx.fillStyle = i % 2 === 0 ? 'rgba(204, 204, 204, 0.2)' : 'transparent'
      ctx.fillRect(left, Math.min(y1, y2), right - left, Math.abs(y2 - y1))
    }
    ctx.restore()
  },
}
</script>

<style scoped>
.workout-list {
  margin-top: 2rem;
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
}

canvas {
  outline: none;
  border: none;
}

.filter-section {
  margin-bottom: 1rem;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.8rem;
}

.filter-section label {
  margin-right: 0.25rem;
  color: #fff;
}

.filter-section select {
  padding: 0.5rem;
  border-radius: 30px;
  border: none;
  background-color: rgb(0, 110, 255);
  color: white;
  cursor: pointer;
}

.filter-section select:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(0, 110, 255, 0.5);
}

.table {
  margin-bottom: 1rem;
  padding: 0.9rem 0.5rem 0.01px 0.5rem;
  border-radius: 30px;
  background-color: transparent;
  text-align: center;
  width: 100%;
}

.styled-table {
  width: 100%;
  border-collapse: separate;
  margin-bottom: 1rem;
  overflow: hidden;
  border-radius: 20px;
  table-layout: fixed;
  min-width: 100%;
}

.styled-table th,
.styled-table td {
  padding: 8px;
  text-align: left;
  color: white;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.styled-table th {
  background-color: #1e1e1e;
  color: rgb(0, 110, 255);
  text-align: left;
  position: sticky;
  top: 0;
}

.styled-table tr:nth-child(even) {
  background-color: #2b2b2b;
}

.styled-table tr:nth-child(odd) {
  background-color: #1e1e1e;
}

.styled-table th:first-child {
  border-top-left-radius: 12px;
}

.styled-table th:last-child {
  border-top-right-radius: 12px;
}

.styled-table th:first-child {
  border-top-left-radius: 20px;
}

.styled-table th:last-child {
  border-top-right-radius: 20px;
}

.styled-table tr:last-child td:last-child {
  border-bottom-right-radius: 20px;
}

.styled-table tr:last-child td:first-child {
  border-bottom-left-radius: 20px;
}

.no-workouts {
  color: #888;
  margin-top: 1rem;
}

.delete-button,
.edit-button,
.duplicate-button {
  border: none;
  padding: 5px 10px;
  cursor: pointer;
  border-radius: 30px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.delete-button {
  background-color: #ff4d4d;
  color: white;
}

.delete-button:hover {
  background-color: #ff1a1a;
}

.edit-button {
  margin-left: 3px;
  background-color: #4d56ff;
  color: white;
  font-size: smaller;
}

.edit-button:hover {
  background-color: rgb(0, 110, 255);
}

.duplicate-button {
  margin-left: 3px;
  background-color: #4d56ff;
  color: white;
  font-size: smaller;
}

.duplicate-button:hover {
  background-color: rgb(0, 110, 255);
}

.emoji-box {
  margin-top: 1rem;
  padding: 1rem;
  border-radius: 10px;
  background-color: #2b2b2b;
  color: #fff;
  text-align: center;
}

.stat-box {
  margin: 1.5rem 0;
  padding: 1.5rem;
  border-radius: 15px;
  background-color: #2b2b2b;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.stat-box h2 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: rgb(0, 110, 255);
}

.stat-box canvas {
  margin-top: 1rem;
}

.chart-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
  max-width: 300px;
  margin: 0 auto;
}

@media (max-width: 900px) {
  .workout-list {
    padding: 0 10px;
    max-height: 100vh;
    overflow-y: auto;
  }

  h3 {
    font-size: 0.95rem;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.3rem;
  }

  .delete-button,
  .edit-button,
  .duplicate-button {
    padding: 4px 8px;
  }

  .table {
    width: 100%;
    overflow-x: scroll;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: thin;
  }

  .styled-table {
    font-size: 0.85rem;
    width: max-content;
    min-width: 100%;
    display: table;
    white-space: nowrap;
    table-layout: fixed;
  }

  .styled-table th:first-child,
  .styled-table td:first-child {
    min-width: 140px;
    max-width: 25%;
  }

  .styled-table th:not(:first-child),
  .styled-table td:not(:first-child) {
    width: auto;
  }

  .styled-table th,
  .styled-table td {
    padding: 6px;
  }

  .stat-box {
    padding: 1rem;
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
    overflow-x: auto;
    white-space: nowrap;
  }

  .styled-table th,
  .styled-table td {
    padding: 4px 2px;
    font-size: 0.75rem;
  }

  .stat-box {
    padding: 0.75rem;
  }
}

@media (max-width: 480px) {
  .filter-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .filter-section label {
    margin-bottom: 0.25rem;
  }

  .filter-section select {
    width: 100%;
    margin-bottom: 0.5rem;
  }

  h3 {
    font-size: 0.9rem;
  }

  .styled-table {
    font-size: 0.8rem;
    table-layout: auto;
  }

  .styled-table th:first-child,
  .styled-table td:first-child {
    min-width: 100px;
  }

  .styled-table th,
  .styled-table td {
    padding: 4px;
  }
}
</style>

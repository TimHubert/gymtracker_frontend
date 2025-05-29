<template>
  <div>
    <template v-if="!selectedWorkoutId">
      <h1>Wähle ein Workout</h1>
      <WorkoutChoice @workout-selected="handleWorkoutSelected" />
      <br />
      <NewWorkout @workout-selected="handleWorkoutSelected" />
    </template>
    <template v-else>
      <OneWorkout :workoutId="selectedWorkoutId" @back="resetSelection" />
    </template>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import WorkoutChoice from '@/components/WorkoutChoice.vue'
import OneWorkout from '@/components/OneWorkout.vue'
import NewWorkout from '@/components/NewWorkout.vue'

const selectedWorkoutId = ref(null)

const handleWorkoutSelected = (workoutId) => {
  selectedWorkoutId.value = workoutId
}

const resetSelection = () => {
  selectedWorkoutId.value = null
}
</script>

<template>
  <div class="stats">
    <h2>Statistiken</h2>
    <p>Hier sehen Sie Ihre Statistiken.</p>
    <AllWorkoutsView />
  </div>
</template>

<script>
import AllWorkoutsView from '../components/AllWorkoutsView.vue'

export default {
  name: 'Stats',
  components: {
    AllWorkoutsView,
  },
}
</script>

<template>
  <div class="stats">
    <h2>Statistiken</h2>
    <p>Hier sehen Sie Ihre Statistiken.</p>
    <AllWorkoutsView />
    
  </div>
</template>

<script>
export default {
  name: 'Stats',
  components: {
    AllWorkoutsView,
  },
}

import AllWorkoutsView from '../components/AllWorkoutsView.vue'

</script>

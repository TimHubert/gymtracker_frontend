<template>
  <div class="stats-page">
    <!-- Tab Navigation -->
    <div class="tab-navigation">
      <button
        class="tab-button"
        :class="{ active: activeTab === 'charts' }"
        @click="activeTab = 'charts'"
      >
        📊 Statistiken & Charts
      </button>
      <button
        class="tab-button"
        :class="{ active: activeTab === 'workouts' }"
        @click="activeTab = 'workouts'"
      >
        📋 Alle Workouts
      </button>
    </div>

    <!-- Tab Content -->
    <div class="tab-content">
      <!-- Charts Tab -->
      <div v-if="activeTab === 'charts'" class="charts-tab">
        <WorkoutStats />
      </div>

      <!-- Workouts Tab -->
      <div v-if="activeTab === 'workouts'" class="workouts-tab">
        <div class="workouts-header">
          <h2>📋 Alle deine Workouts</h2>
        </div>
        <AllWorkoutsView />
      </div>
    </div>
  </div>
</template>

<script>
import AllWorkoutsView from '../components/AllWorkoutsView.vue'
import WorkoutStats from '../components/WorkoutStats.vue'

export default {
  name: 'Stats',
  components: {
    AllWorkoutsView,
    WorkoutStats,
  },
  data() {
    return {
      activeTab: 'workouts', // Startet mit Charts Tab
    }
  },
}
</script>

<style scoped>
.stats-page {
  width: 100%;
  min-height: 100vh;
  padding: 20px;
}

/* Tab Navigation */
.tab-navigation {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  padding: 10px;
  border-radius: 15px;
}

.tab-button {
  flex: 1;
  padding: 12px 20px;
  border: none;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
}

.tab-button:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.tab-button.active {
  background: linear-gradient(45deg, #1e90ff, #006eff);
  box-shadow: 0 5px 15px rgba(30, 144, 255, 0.3);
}

/* Tab Content */
.tab-content {
  width: 100%;
}

.workouts-tab {
  border-radius: 20px;
  padding: 20px;
  color: white;
}

.workouts-header {
  text-align: center;
  margin-bottom: 30px;
}

.workouts-header h2 {
  font-size: 2.2em;
  margin: 0 0 10px 0;
  font-weight: bold;
  background: linear-gradient(45deg, #1e90ff, #006eff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.workouts-header p {
  opacity: 0.9;
  font-size: 1.1em;
  margin: 0;
}

/* Responsive Design */
@media (max-width: 768px) {
  .tab-navigation {
    flex-direction: column;
    gap: 5px;
    padding: 5px;
    width: 100%;
  }

  .tab-button {
    width: 100%;
    font-size: 1rem;
    padding: 15px 20px;
    margin: 2px 0;
  }

  .workouts-tab {
    padding: 15px;
  }

  .workouts-header h2 {
    font-size: 1.8em;
  }
}

@media (max-width: 480px) {
  .stats-page {
    padding: 10px 5px;
  }

  .workouts-header h2 {
    font-size: 1.5em;
  }

  .workouts-header p {
    font-size: 0.9em;
  }

  .workouts-tab {
    padding: 10px;
    width: 120%;
    margin-left: -10%;
  }

  .charts-tab {
    padding: 10px;
    width: 120%;
    margin-left: -10%;
  }
}
</style>

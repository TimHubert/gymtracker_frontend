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
          <p>Hier siehst du eine Übersicht all deiner Trainingseinheiten</p>
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
}

/* Tab Navigation */
.tab-navigation {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  background: rgba(255, 255, 255, 0.1);
  padding: 10px;
  border-radius: 15px;
  backdrop-filter: blur(10px);
}

.tab-button {
  flex: 1;
  padding: 12px 20px;
  border: none;
  border-radius: 10px;
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
  background: linear-gradient(45deg, #667eea, #764ba2);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
}

/* Tab Content */
.tab-content {
  width: 100%;
}

.charts-tab {
  /* WorkoutStats hat eigene Styles */
}

.workouts-tab {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 30px;
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
  background: linear-gradient(45deg, #667eea, #764ba2);
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
  }

  .tab-button {
    font-size: 0.9rem;
    padding: 10px 15px;
  }

  .workouts-tab {
    padding: 20px;
  }

  .workouts-header h2 {
    font-size: 1.8em;
  }
}
</style>

<template>
    <div class="stats-dashboard">
      <div class="dashboard-header">
        <h1>Deine Workout Statistiken</h1>
        <p class="subtitle">Verfolge deinen Fortschritt und bleib motiviert!</p>
      </div>
  
      <!-- Stats Cards Row -->
      <div class="stats-cards">
        <div class="stat-card">
          <div class="stat-icon">🏋️‍♂️</div>
          <div class="stat-content">
            <h3>{{ totalWorkouts }}</h3>
            <p>Total Workouts</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">🔥</div>
          <div class="stat-content">
            <h3>{{ currentStreak }}</h3>
            <p>Tage Streak</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">⚖️</div>
          <div class="stat-content">
            <h3>{{ Math.round(totalVolume/1000) }}k</h3>
            <p>Total Volume</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">⭐</div>
          <div class="stat-content">
            <h3>{{ favoriteExerciseShort }}</h3>
            <p>Top Übung</p>
          </div>
        </div>
      </div>
  
      <!-- Weekly Summary Section - MOVED HERE! -->
      <div class="weekly-summary">
        <h2>📅 Diese Woche</h2>
        <div class="week-stats">
          <div class="week-stat">
            <div class="week-icon">🏋️</div>
            <div class="week-info">
              <span class="week-value">3x</span>
              <span class="week-label">Trainings</span>
            </div>
          </div>
          <div class="week-stat">
            <div class="week-icon">⚖️</div>
            <div class="week-info">
              <span class="week-value">2.8t</span>
              <span class="week-label">Volume</span>
            </div>
          </div>
          <div class="week-stat">
            <div class="week-icon">🚀</div>
            <div class="week-info">
              <span class="week-value">+5kg</span>
              <span class="week-label">Progress</span>
            </div>
          </div>
          <div class="week-stat">
            <div class="week-icon">🏆</div>
            <div class="week-info">
              <span class="week-value">85kg</span>
              <span class="week-label">Best Lift</span>
            </div>
          </div>
        </div>
      </div>
  
      <!-- Charts Section -->
      <div class="charts-section">
        
        <!-- Workout Frequency Chart -->
        <div class="chart-container">
          <h2>📅 Workout Häufigkeit (letzte 30 Tage)</h2>
          <canvas ref="workoutFrequencyChart" id="workoutFrequencyChart"></canvas>
        </div>
  
        <!-- Weight Progression Chart -->
        <div class="chart-container">
          <h2>📈 Gewichtsprogression - Bankdrücken</h2>
          <canvas ref="weightProgressChart" id="weightProgressChart"></canvas>
        </div>
  
        <!-- Exercise Distribution -->
        <div class="chart-container">
          <h2>🥧 Übungs-Verteilung</h2>
          <canvas ref="exerciseDistributionChart" id="exerciseDistributionChart"></canvas>
        </div>
  
        <!-- Volume Tracking -->
        <div class="chart-container">
          <h2>💥 Wöchentliches Trainingsvolumen</h2>
          <canvas ref="volumeChart" id="volumeChart"></canvas>
        </div>
  
      </div>
  
      <!-- Progress Section -->
      <div class="progress-section">
        <h2>🚀 Fortschrittstracking</h2>
        
        <div class="progress-items">
          <div class="progress-item" v-for="exercise in progressData" :key="exercise.name">
            <div class="progress-header">
              <span class="exercise-name">{{ exercise.icon }} {{ exercise.name }}</span>
              <span class="progress-value">{{ exercise.current }}kg</span>
            </div>
            <div class="progress-bar">
              <div 
                class="progress-fill" 
                :style="{ width: exercise.progress + '%' }"
              ></div>
            </div>
            <div class="progress-info">
              <span>Start: {{ exercise.start }}kg</span>
              <span>Ziel: {{ exercise.goal }}kg</span>
            </div>
          </div>
        </div>
      </div>
  
    </div>
  </template>
  
  <script>
  import Chart from 'chart.js/auto';
  
  export default {
    name: 'WorkoutStats',
    data() {
      return {
        totalWorkouts: 42,
        currentStreak: 5,
        totalVolume: 15750,
        favoriteExercise: 'Bankdrücken',
        favoriteExerciseShort: 'Bench',
        
        // Progress Data für die Fortschrittsbalken
        progressData: [
          {
            name: 'Bankdrücken',
            icon: '🏋️',
            start: 60,
            current: 85,
            goal: 100,
            progress: 71
          },
          {
            name: 'Kniebeugen',
            icon: '🦵',
            start: 80,
            current: 110,
            goal: 140,
            progress: 50
          },
          {
            name: 'Kreuzheben',
            icon: '💀',
            start: 100,
            current: 140,
            goal: 180,
            progress: 50
          }
        ],
  
        // Chart Instances
        charts: {}
      }
    },
    
    mounted() {
      this.$nextTick(() => {
        this.initializeCharts();
      });
    },
    
    beforeUnmount() {
      // Destroy charts to prevent memory leaks
      Object.values(this.charts).forEach(chart => {
        if (chart) chart.destroy();
      });
    },
    
    methods: {
      initializeCharts() {
        this.createWorkoutFrequencyChart();
        this.createWeightProgressChart();
        this.createExerciseDistributionChart();
        this.createVolumeChart();
      },
  
      createWorkoutFrequencyChart() {
        const ctx = this.$refs.workoutFrequencyChart.getContext('2d');
        
        this.charts.workoutFrequency = new Chart(ctx, {
          type: 'line',
          data: {
            labels: ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'],
            datasets: [{
              label: 'Workouts pro Tag',
              data: [1, 0, 1, 1, 0, 1, 0],
              borderColor: '#4f46e5',
              backgroundColor: 'rgba(79, 70, 229, 0.1)',
              fill: true,
              tension: 0.4,
              pointBackgroundColor: '#4f46e5',
              pointBorderColor: '#fff',
              pointBorderWidth: 3,
              pointRadius: 8
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                max: 2,
                ticks: {
                  stepSize: 1,
                  color: '#374151'
                },
                grid: {
                  color: 'rgba(55, 65, 81, 0.2)'
                }
              },
              x: {
                ticks: {
                  color: '#374151'
                },
                grid: {
                  color: 'rgba(55, 65, 81, 0.2)'
                }
              }
            }
          }
        });
      },
  
      createWeightProgressChart() {
        const ctx = this.$refs.weightProgressChart.getContext('2d');
        
        this.charts.weightProgress = new Chart(ctx, {
          type: 'line',
          data: {
            labels: ['Woche 1', 'Woche 2', 'Woche 3', 'Woche 4', 'Woche 5', 'Woche 6'],
            datasets: [{
              label: 'Bankdrücken (kg)',
              data: [60, 65, 70, 75, 80, 85],
              borderColor: '#059669',
              backgroundColor: 'rgba(5, 150, 105, 0.1)',
              fill: true,
              tension: 0.4,
              pointBackgroundColor: '#059669',
              pointBorderColor: '#fff',
              pointBorderWidth: 3,
              pointRadius: 8
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false
              }
            },
            scales: {
              y: {
                beginAtZero: false,
                min: 50,
                ticks: {
                  color: '#374151'
                },
                grid: {
                  color: 'rgba(55, 65, 81, 0.2)'
                }
              },
              x: {
                ticks: {
                  color: '#374151'
                },
                grid: {
                  color: 'rgba(55, 65, 81, 0.2)'
                }
              }
            }
          }
        });
      },
  
      createExerciseDistributionChart() {
        const ctx = this.$refs.exerciseDistributionChart.getContext('2d');
        
        this.charts.exerciseDistribution = new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: ['Bankdrücken', 'Kniebeugen', 'Kreuzheben', 'Schulterdrücken', 'Klimmzüge'],
            datasets: [{
              data: [25, 20, 18, 15, 12],
              backgroundColor: [
                '#4f46e5',
                '#059669', 
                '#dc2626',
                '#d97706',
                '#7c3aed'
              ],
              borderWidth: 3,
              borderColor: '#fff'
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom',
                labels: {
                  padding: 20,
                  usePointStyle: true,
                  color: '#374151',
                  font: {
                    size: 13
                  }
                }
              }
            }
          }
        });
      },
  
      createVolumeChart() {
        const ctx = this.$refs.volumeChart.getContext('2d');
        
        this.charts.volume = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: ['KW 1', 'KW 2', 'KW 3', 'KW 4', 'KW 5', 'KW 6'],
            datasets: [{
              label: 'Volumen (kg)',
              data: [2500, 2800, 3200, 2900, 3500, 3800],
              backgroundColor: 'rgba(79, 70, 229, 0.8)',
              borderColor: '#4f46e5',
              borderWidth: 2,
              borderRadius: 8,
              borderSkipped: false,
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  color: '#374151'
                },
                grid: {
                  color: 'rgba(55, 65, 81, 0.2)'
                }
              },
              x: {
                ticks: {
                  color: '#374151'
                },
                grid: {
                  color: 'rgba(55, 65, 81, 0.2)'
                }
              }
            }
          }
        });
      }
    }
  }
  </script>
  
  <style scoped>
  .stats-dashboard {
    max-width: 1200px;
    margin: 0 auto;
    padding: 25px;
    background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 50%, #cbd5e1 100%);
    border-radius: 25px;
    color: #1f2937;
    min-height: 100vh;
    box-shadow: 
      0 10px 40px rgba(0, 0, 0, 0.1),
      0 4px 20px rgba(0, 0, 0, 0.06);
    position: relative;
    overflow: hidden;
  }
  
  .stats-dashboard::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(79, 70, 229, 0.03) 0%, transparent 70%);
    pointer-events: none;
  }
  
  .dashboard-header {
    text-align: center;
    margin-bottom: 40px;
  }
  
  .dashboard-header h1 {
    font-size: 2.8em;
    margin: 0 0 15px 0;
    font-weight: 800;
    background: linear-gradient(135deg, #4f46e5, #059669);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    letter-spacing: -0.02em;
  }
  
  .subtitle {
    font-size: 1.3em;
    color: #6b7280;
    margin: 0;
    font-weight: 500;
  }
  
  /* Stats Cards */
  .stats-cards {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 25px;
    margin-bottom: 35px;
  }
  
  @media (max-width: 1100px) {
    .stats-cards {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  
  @media (max-width: 640px) {
    .stats-cards {
      grid-template-columns: 1fr;
    }
  }
  
  .stat-card {
    background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
    border: 1px solid rgba(79, 70, 229, 0.1);
    border-radius: 20px;
    padding: 28px;
    display: flex;
    align-items: center;
    gap: 18px;
    transition: all 0.4s ease;
    box-shadow: 
      0 4px 15px rgba(0, 0, 0, 0.08),
      0 2px 8px rgba(0, 0, 0, 0.04);
    min-height: 120px;
    position: relative;
    overflow: hidden;
  }
  
  .stat-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(79, 70, 229, 0.05), rgba(5, 150, 105, 0.05));
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  .stat-card:hover {
    transform: translateY(-6px);
    box-shadow: 
      0 20px 40px rgba(79, 70, 229, 0.15),
      0 8px 25px rgba(0, 0, 0, 0.12);
    border-color: rgba(79, 70, 229, 0.2);
  }
  
  .stat-card:hover::before {
    opacity: 1;
  }
  
  .stat-icon {
    font-size: 3.2em;
    filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.15));
    flex-shrink: 0;
    position: relative;
    z-index: 2;
  }
  
  .stat-content {
    flex: 1;
    min-width: 0;
    position: relative;
    z-index: 2;
  }
  
  .stat-content h3 {
    margin: 0 0 6px 0;
    font-size: 2.2em;
    font-weight: 700;
    color: #1f2937;
    line-height: 1;
    word-break: break-word;
  }
  
  .stat-content p {
    margin: 0;
    color: #6b7280;
    font-size: 0.95em;
    font-weight: 500;
    word-break: break-word;
  }
  
  /* Charts Section */
  .charts-section {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(420px, 1fr));
    gap: 30px;
    margin-bottom: 45px;
  }
  
  .chart-container {
    background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
    border: 1px solid rgba(79, 70, 229, 0.1);
    border-radius: 20px;
    padding: 30px;
    height: 420px;
    box-shadow: 
      0 4px 15px rgba(0, 0, 0, 0.08),
      0 2px 8px rgba(0, 0, 0, 0.04);
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
  }
  
  .chart-container::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(79, 70, 229, 0.02), rgba(5, 150, 105, 0.02));
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  .chart-container:hover {
    box-shadow: 
      0 15px 35px rgba(79, 70, 229, 0.1),
      0 8px 25px rgba(0, 0, 0, 0.12);
    transform: translateY(-2px);
  }
  
  .chart-container:hover::before {
    opacity: 1;
  }
  
  .chart-container h2 {
    margin: 0 0 25px 0;
    font-size: 1.4em;
    text-align: center;
    color: #1f2937;
    font-weight: 600;
    position: relative;
    z-index: 2;
  }
  
  .chart-container canvas {
    max-height: 320px !important;
    position: relative;
    z-index: 2;
  }
  
  /* Progress Section */
  .progress-section {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 16px;
    padding: 35px;
    margin-bottom: 30px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  }
  
  .progress-section h2 {
    margin: 0 0 30px 0;
    text-align: center;
    font-size: 1.6em;
    color: #1f2937;
    font-weight: 600;
  }
  
  .progress-items {
    display: flex;
    flex-direction: column;
    gap: 25px;
  }
  
  .progress-item {
    background: #f9fafb;
    border-radius: 12px;
    padding: 25px;
    border: 1px solid #f3f4f6;
  }
  
  .progress-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }
  
  .exercise-name {
    font-weight: 600;
    font-size: 1.15em;
    color: #1f2937;
  }
  
  .progress-value {
    font-weight: 700;
    font-size: 1.3em;
    color: #4f46e5;
  }
  
  .progress-bar {
    background: #e5e7eb;
    height: 10px;
    border-radius: 5px;
    overflow: hidden;
    margin-bottom: 10px;
  }
  
  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #4f46e5, #059669);
    transition: width 1s ease;
    border-radius: 5px;
  }
  
  .progress-info {
    display: flex;
    justify-content: space-between;
    font-size: 0.9em;
    color: #6b7280;
    font-weight: 500;
  }
  
  /* Weekly Summary - Cooler Design */
  .weekly-summary {
    background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
    border-radius: 20px;
    padding: 30px;
    color: white;
    margin-bottom: 35px;
    position: relative;
    overflow: hidden;
  }
  
  .weekly-summary::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, rgba(79, 70, 229, 0.1), rgba(5, 150, 105, 0.1));
    pointer-events: none;
  }
  
  .weekly-summary h2 {
    margin: 0 0 25px 0;
    text-align: center;
    font-size: 1.6em;
    font-weight: 700;
    position: relative;
    z-index: 1;
  }
  
  .week-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 20px;
    position: relative;
    z-index: 1;
  }
  
  .week-stat {
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 20px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 15px;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    transition: all 0.3s ease;
  }
  
  .week-stat:hover {
    transform: translateY(-2px);
    background: rgba(255, 255, 255, 0.15);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
  }
  
  .week-icon {
    font-size: 2.2em;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
  }
  
  .week-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  
  .week-value {
    font-size: 1.5em;
    font-weight: 800;
    line-height: 1;
  }
  
  .week-label {
    font-size: 0.9em;
    opacity: 0.9;
    font-weight: 500;
  }
  
  /* Responsive Design */
  @media (max-width: 768px) {
    .stats-dashboard {
      padding: 20px;
      margin: 15px;
    }
    
    .charts-section {
      grid-template-columns: 1fr;
      gap: 25px;
    }
    
    .chart-container {
      height: 380px;
      padding: 25px;
    }
    
    .stat-card {
      padding: 25px;
    }
    
    .dashboard-header h1 {
      font-size: 2.2em;
    }
    
    .week-stats {
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 15px;
    }
    
    .week-stat {
      padding: 15px;
      gap: 12px;
    }
    
    .week-icon {
      font-size: 1.8em;
    }
    
    .week-value {
      font-size: 1.3em;
    }
  }
  </style>
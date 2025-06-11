// statsApi.js - API Service für Statistiken

const BASE_URL = 'http://localhost:8080/api/stats';

export const statsApi = {
  // Haupt-Statistiken (für die Cards)
  async getSummary() {
    try {
      const response = await fetch(`${BASE_URL}/summary`);
      if (!response.ok) throw new Error('Failed to fetch summary');
      return await response.json();
    } catch (error) {
      console.error('Error fetching summary:', error);
      // Fallback auf Dummy-Daten
      return {
        totalWorkouts: 42,
        currentStreak: 5,
        totalVolume: 16,
        favoriteExercise: 'Bankdrücken',
        favoriteExerciseShort: 'Bench'
      };
    }
  },

  // Wöchentliche Statistiken
  async getWeeklyStats() {
    try {
      const response = await fetch(`${BASE_URL}/weekly`);
      if (!response.ok) throw new Error('Failed to fetch weekly stats');
      return await response.json();
    } catch (error) {
      console.error('Error fetching weekly stats:', error);
      return {
        workoutsThisWeek: 3,
        volumeThisWeek: "2.8",
        bestLift: "85kg",
        progress: "+5kg"
      };
    }
  },

  // Workout Häufigkeit (für Line Chart)
  async getWorkoutFrequency() {
    try {
      const response = await fetch(`${BASE_URL}/frequency`);
      if (!response.ok) throw new Error('Failed to fetch frequency');
      return await response.json();
    } catch (error) {
      console.error('Error fetching frequency:', error);
      return [1, 0, 1, 1, 0, 1, 0];
    }
  },

  // Gewichtsprogression (für Line Chart)
  async getWeightProgression() {
    try {
      const response = await fetch(`${BASE_URL}/progression`);
      if (!response.ok) throw new Error('Failed to fetch progression');
      return await response.json();
    } catch (error) {
      console.error('Error fetching progression:', error);
      return [60, 65, 70, 75, 80, 85];
    }
  },

  // Übungsverteilung (für Doughnut Chart)
  async getExerciseDistribution() {
    try {
      const response = await fetch(`${BASE_URL}/distribution`);
      if (!response.ok) throw new Error('Failed to fetch distribution');
      const data = await response.json();
      
      // Konvertiere zu Arrays für Chart.js
      const labels = Object.keys(data);
      const values = Object.values(data);
      
      return { labels, values };
    } catch (error) {
      console.error('Error fetching distribution:', error);
      return {
        labels: ['Bankdrücken', 'Kniebeugen', 'Kreuzheben', 'Schulterdrücken', 'Klimmzüge'],
        values: [25, 20, 18, 15, 12]
      };
    }
  },

  // Wöchentliches Volume (für Bar Chart)
  async getWeeklyVolume() {
    try {
      const response = await fetch(`${BASE_URL}/volume`);
      if (!response.ok) throw new Error('Failed to fetch volume');
      return await response.json();
    } catch (error) {
      console.error('Error fetching volume:', error);
      return [2.5, 2.8, 3.2, 2.9, 3.5, 3.8];
    }
  },

  // Alle Daten auf einmal laden (für bessere Performance)
  async getAllStats() {
    try {
      const [summary, weekly, frequency, progression, distribution, volume] = await Promise.all([
        this.getSummary(),
        this.getWeeklyStats(),
        this.getWorkoutFrequency(),
        this.getWeightProgression(),
        this.getExerciseDistribution(),
        this.getWeeklyVolume()
      ]);

      return {
        summary,
        weekly,
        frequency,
        progression,
        distribution,
        volume
      };
    } catch (error) {
      console.error('Error fetching all stats:', error);
      throw error;
    }
  }
};
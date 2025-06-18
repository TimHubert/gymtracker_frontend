import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import WorkoutStats from '../WorkoutStats.vue'
import { useAuthStore } from '../../stores/auth'
import axios from 'axios'

// Mock Chart.js
vi.mock('chart.js/auto', () => ({
  default: vi.fn().mockImplementation(() => ({
    destroy: vi.fn(),
    update: vi.fn(),
    data: { datasets: [{ borderRadius: {}, borderSkipped: false }] },
  })),
}))

// Mock axios
vi.mock('axios')
const mockedAxios = vi.mocked(axios)

// Mock auth store
vi.mock('../../stores/auth')
const mockAuthStore = {
  token: 'mock-token',
  isAuthenticated: true,
}
vi.mocked(useAuthStore).mockReturnValue(mockAuthStore)

// Mock canvas context
HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
  fillRect: vi.fn(),
  clearRect: vi.fn(),
  getImageData: vi.fn(),
  putImageData: vi.fn(),
  createImageData: vi.fn().mockReturnValue([]),
  setTransform: vi.fn(),
  drawImage: vi.fn(),
  save: vi.fn(),
  fillText: vi.fn(),
  restore: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  closePath: vi.fn(),
  stroke: vi.fn(),
  translate: vi.fn(),
  scale: vi.fn(),
  rotate: vi.fn(),
  arc: vi.fn(),
  fill: vi.fn(),
  measureText: vi.fn().mockReturnValue({ width: 0 }),
  transform: vi.fn(),
  rect: vi.fn(),
  clip: vi.fn(),
})

describe('WorkoutStats', () => {
  let wrapper

  const mockWorkoutsData = [
    {
      id: 1,
      date: '2025-06-17T10:00:00.000Z',
      workout: {
        id: 1,
        name: 'Push Day',
        exercise: [
          {
            id: 1,
            name: 'Bankdrücken',
            targetMuscleGroup: 'Brust',
            equipment: 'Langhantel',
          },
        ],
      },
      weights: [{ reps: [10, 8, 6], weights: [80, 85, 90] }],
    },
    {
      id: 2,
      date: '2025-06-16T10:00:00.000Z',
      workout: {
        id: 2,
        name: 'Pull Day',
        exercise: [
          {
            id: 3,
            name: 'Klimmzüge',
            targetMuscleGroup: 'Rücken',
            equipment: 'Körpergewicht',
          },
        ],
      },
      weights: [{ reps: [8, 6, 5], weights: [0, 0, 0] }],
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    mockedAxios.get.mockResolvedValue({ data: mockWorkoutsData })
  })

  const createWrapper = () => {
    return mount(WorkoutStats, {
      global: {
        stubs: {
          canvas: true,
        },
      },
    })
  }

  describe('Component Loading', () => {
    it('sollte Workouts beim Mount laden', async () => {
      wrapper = createWrapper()

      await wrapper.vm.$nextTick()
      await new Promise((resolve) => setTimeout(resolve, 0))

      expect(mockedAxios.get).toHaveBeenCalledWith('http://localhost:8080/workoutsWithWeights')
      expect(wrapper.vm.workouts).toEqual(mockWorkoutsData)
    })

    it('sollte "Keine Workout-Daten" Nachricht anzeigen wenn keine Workouts vorhanden', async () => {
      mockedAxios.get.mockResolvedValue({ data: [] })
      wrapper = createWrapper()

      await wrapper.vm.$nextTick()
      await new Promise((resolve) => setTimeout(resolve, 0))

      expect(wrapper.vm.workouts).toEqual([])
      expect(wrapper.vm.totalWorkouts).toBe(0)
    })
  })

  describe('Workout Counts', () => {
    beforeEach(async () => {
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()
      await new Promise((resolve) => setTimeout(resolve, 0))
    })

    it('sollte Workout-Häufigkeiten korrekt berechnen', () => {
      const counts = wrapper.vm.workoutCounts
      expect(counts['Push Day']).toBe(1)
      expect(counts['Pull Day']).toBe(1)
    })

    it('sollte Gesamtanzahl der Workouts korrekt berechnen', () => {
      expect(wrapper.vm.totalWorkouts).toBe(2)
    })
  })

  describe('Exercise Distribution', () => {
    beforeEach(async () => {
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()
      await new Promise((resolve) => setTimeout(resolve, 0))
    })

    it('sollte Übungsverteilung korrekt berechnen', () => {
      const distribution = wrapper.vm.exerciseDistribution
      expect(distribution['Bankdrücken']).toBe(1)
      expect(distribution['Klimmzüge']).toBe(1)
    })
  })

  describe('Available Exercises', () => {
    beforeEach(async () => {
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()
      await new Promise((resolve) => setTimeout(resolve, 0))
    })

    it('sollte verfügbare Übungen auflisten', () => {
      const exercises = wrapper.vm.availableExercises
      expect(exercises).toContain('Bankdrücken')
      expect(exercises).toContain('Klimmzüge')
      expect(exercises.length).toBe(2)
    })
  })

  describe('Error Handling', () => {
    it('sollte Fehler beim Laden der Workouts behandeln', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      mockedAxios.get.mockRejectedValue(new Error('Network error'))

      wrapper = createWrapper()
      await wrapper.vm.$nextTick()
      await new Promise((resolve) => setTimeout(resolve, 0))

      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })
  })
})
